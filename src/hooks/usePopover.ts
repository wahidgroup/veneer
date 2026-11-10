import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useDismissLayer } from "../overlays/dismissLayerStack.js";
import { captureFocusRestore, restoreFocus } from "../utils/focusScope.js";

interface UsePopoverOptions {
	open: boolean;
	onClose: () => void;
	offset?: number;
	padding?: number;
	matchTriggerWidth?: boolean;
}

interface UsePopoverReturn {
	setReference: (node: HTMLElement | null) => void;
	setFloating: (node: HTMLElement | null) => void;
	floatingStyles: CSSProperties;
	/**
	 * True on the commit whose `floatingStyles` are `visibility: visible`.
	 * Focus then; Chromium rejects focus while the panel is hidden.
	 */
	focusable: boolean;
}

const HIDDEN_STYLES: CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	visibility: "hidden",
};

type DismissReason = "escape" | "outside-press";

/**
 * True when focus is on the document body or absent.
 * A trigger that already holds focus is not focused again.
 */
function shouldRestoreTrigger(trigger: HTMLElement): boolean {
	const active = document.activeElement;
	if (active === trigger) {
		return false;
	}
	if (active === null || active === document.body) {
		return true;
	}

	return false;
}

/**
 * Positions a portaled panel under a trigger; dismisses on outside press or Escape.
 * The floating node is mounted only while open, so focus that was inside it reads as body at the restore site.
 */
function usePopover({ open, onClose, offset, padding, matchTriggerWidth }: UsePopoverOptions): UsePopoverReturn {
	let resolvedOffset = offset;
	resolvedOffset ??= 4;

	let resolvedPadding = padding;
	resolvedPadding ??= 8;

	let matchWidth = matchTriggerWidth;
	matchWidth ??= false;

	const referenceRef = useRef<HTMLElement | null>(null);
	const floatingRef = useRef<HTMLElement | null>(null);
	const onCloseRef = useRef(onClose);
	const restoreTargetRef = useRef<HTMLElement | null>(null);
	const dismissReasonRef = useRef<DismissReason | null>(null);
	const [floatingStyles, setFloatingStyles] = useState<CSSProperties>(HIDDEN_STYLES);

	useLayoutEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	const update = useCallback(() => {
		const reference = referenceRef.current;
		const floating = floatingRef.current;
		if (reference === null || floating === null) {
			return;
		}

		const rect = reference.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const spaceBelow = viewportHeight - rect.bottom - resolvedOffset - resolvedPadding;
		const spaceAbove = rect.top - resolvedOffset - resolvedPadding;
		const naturalHeight = floating.scrollHeight;

		let placeBelow: boolean;
		let maxHeight: number | undefined;
		if (naturalHeight <= spaceBelow) {
			placeBelow = true;
		} else if (naturalHeight <= spaceAbove) {
			placeBelow = false;
		} else if (spaceBelow >= spaceAbove) {
			placeBelow = true;
			maxHeight = Math.max(spaceBelow, 0);
		} else {
			placeBelow = false;
			maxHeight = Math.max(spaceAbove, 0);
		}

		let height = naturalHeight;
		if (maxHeight !== undefined) {
			height = Math.min(naturalHeight, maxHeight);
		}

		const maxWidth = viewportWidth - resolvedPadding * 2;
		let width = floating.offsetWidth;
		if (matchWidth) {
			width = rect.width;
		}
		if (width > maxWidth) {
			width = maxWidth;
		}

		let left = rect.left;
		if (left + width > viewportWidth - resolvedPadding) {
			left = viewportWidth - width - resolvedPadding;
		}
		if (left < resolvedPadding) {
			left = resolvedPadding;
		}

		let top = rect.bottom + resolvedOffset;
		if (!placeBelow) {
			top = rect.top - resolvedOffset - height;
		}

		const next: CSSProperties = {
			position: "fixed",
			top,
			left,
			visibility: "visible",
		};
		if (maxHeight !== undefined) {
			next.maxHeight = maxHeight;
			next.overflowY = "auto";
		}
		if (matchWidth) {
			next.width = width;
		}

		setFloatingStyles(next);
	}, [resolvedOffset, resolvedPadding, matchWidth]);

	useDismissLayer({
		open,
		onEscape: () => {
			dismissReasonRef.current = "escape";
			onCloseRef.current();
		},
	});

	const setReference = useCallback(
		(node: HTMLElement | null) => {
			referenceRef.current = node;
			if (node !== null && open) {
				update();
			}
		},
		[open, update],
	);

	const setFloating = useCallback(
		(node: HTMLElement | null) => {
			floatingRef.current = node;
			if (node !== null && open) {
				update();
			}
		},
		[open, update],
	);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}

		restoreTargetRef.current = captureFocusRestore();

		return () => {
			const target = restoreTargetRef.current;
			const reason = dismissReasonRef.current;
			restoreTargetRef.current = null;
			dismissReasonRef.current = null;

			if (reason === "outside-press") {
				return;
			}
			if (target?.isConnected !== true) {
				return;
			}
			if (!shouldRestoreTrigger(target)) {
				return;
			}

			restoreFocus(target);
		};
	}, [open]);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}

		update();
		const frame = window.requestAnimationFrame(() => {
			update();
		});

		return () => {
			window.cancelAnimationFrame(frame);
		};
	}, [open, update]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handleReposition = () => {
			update();
		};

		window.addEventListener("scroll", handleReposition, true);
		window.addEventListener("resize", handleReposition);

		let observer: ResizeObserver | undefined;
		if (typeof ResizeObserver !== "undefined") {
			observer = new ResizeObserver(handleReposition);
			if (referenceRef.current !== null) {
				observer.observe(referenceRef.current);
			}
			if (floatingRef.current !== null) {
				observer.observe(floatingRef.current);
			}
		}

		return () => {
			window.removeEventListener("scroll", handleReposition, true);
			window.removeEventListener("resize", handleReposition);

			if (observer !== undefined) {
				observer.disconnect();
			}
		};
	}, [open, update]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handlePointer = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) {
				return;
			}
			if (referenceRef.current?.contains(target) === true) {
				return;
			}
			if (floatingRef.current?.contains(target) === true) {
				return;
			}

			dismissReasonRef.current = "outside-press";
			onCloseRef.current();
		};

		document.addEventListener("mousedown", handlePointer);

		return () => {
			document.removeEventListener("mousedown", handlePointer);
		};
	}, [open]);

	let focusable = false;
	if (open && floatingStyles.visibility === "visible") {
		focusable = true;
	}

	return { setReference, setFloating, floatingStyles, focusable };
}

export type { UsePopoverOptions, UsePopoverReturn };
export { usePopover };
