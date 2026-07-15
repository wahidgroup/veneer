import type { CSSProperties } from "react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

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
}

const HIDDEN_STYLES: CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	visibility: "hidden",
};

/**
 * Positions a portaled panel under a trigger; dismisses on outside press or Escape.
 */
function usePopover({
	open,
	onClose,
	offset,
	padding,
	matchTriggerWidth,
}: UsePopoverOptions): UsePopoverReturn {
	let resolvedOffset = offset;
	resolvedOffset ??= 4;

	let resolvedPadding = padding;
	resolvedPadding ??= 8;

	let matchWidth = matchTriggerWidth;
	matchWidth ??= false;

	const referenceRef = useRef<HTMLElement | null>(null);
	const floatingRef = useRef<HTMLElement | null>(null);
	const [floatingStyles, setFloatingStyles] =
		useState<CSSProperties>(HIDDEN_STYLES);

	const update = useCallback(() => {
		const reference = referenceRef.current;
		const floating = floatingRef.current;
		if (reference === null || floating === null) {
			return;
		}

		const rect = reference.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const spaceBelow =
			viewportHeight - rect.bottom - resolvedOffset - resolvedPadding;
		const spaceAbove = rect.top - resolvedOffset - resolvedPadding;
		const naturalHeight = floating.scrollHeight;

		let placeBelow = true;
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

			onClose();
		};

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);

		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open, onClose]);

	return { setReference, setFloating, floatingStyles };
}

export type { UsePopoverOptions, UsePopoverReturn };
export { usePopover };
