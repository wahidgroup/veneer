import type { CSSProperties, ReactNode } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn.js";
import { Portal } from "./Portal.js";

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	disabled?: boolean;
	side?: "top" | "bottom";
	delayMs?: number;
	className?: string;
}

const OFFSET = 8;
const PADDING = 8;

/**
 * Hover/focus tooltip portaled above the trigger. Sets `aria-describedby` while open.
 */
function Tooltip({ content, children, disabled, side, delayMs, className }: TooltipProps) {
	let resolvedSide = side;
	resolvedSide ??= "top";

	let delay = delayMs;
	delay ??= 200;

	let isDisabled = disabled;
	isDisabled ??= false;

	const tooltipId = useId();
	const triggerRef = useRef<HTMLSpanElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [open, setOpen] = useState(false);
	const [styles, setStyles] = useState<CSSProperties>({
		position: "fixed",
		top: 0,
		left: 0,
		visibility: "hidden",
	});

	function clearTimers() {
		if (showTimerRef.current !== null) {
			clearTimeout(showTimerRef.current);
			showTimerRef.current = null;
		}
		if (hideTimerRef.current !== null) {
			clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
	}

	function scheduleOpen() {
		if (isDisabled) {
			return;
		}

		clearTimers();

		showTimerRef.current = setTimeout(() => {
			setOpen(true);
		}, delay);
	}

	function scheduleClose() {
		clearTimers();
		hideTimerRef.current = setTimeout(() => {
			setOpen(false);
		}, 0);
	}

	useEffect(() => {
		return () => {
			clearTimers();
		};
	}, []);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}

		const trigger = triggerRef.current;
		const panel = panelRef.current;
		if (trigger === null || panel === null) {
			return;
		}

		function place() {
			const triggerNode = triggerRef.current;
			const panelNode = panelRef.current;
			if (triggerNode === null || panelNode === null) {
				return;
			}

			const triggerRect = triggerNode.getBoundingClientRect();
			const panelRect = panelNode.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let placeTop = resolvedSide === "top";
			const spaceAbove = triggerRect.top - OFFSET - PADDING;
			const spaceBelow = viewportHeight - triggerRect.bottom - OFFSET - PADDING;

			if (placeTop && panelRect.height > spaceAbove && spaceBelow > spaceAbove) {
				placeTop = false;
			} else if (!placeTop && panelRect.height > spaceBelow && spaceAbove > spaceBelow) {
				placeTop = true;
			}

			let top = triggerRect.bottom + OFFSET;
			if (placeTop) {
				top = triggerRect.top - OFFSET - panelRect.height;
			}

			let left = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;

			if (left < PADDING) {
				left = PADDING;
			}
			if (left + panelRect.width > viewportWidth - PADDING) {
				left = viewportWidth - panelRect.width - PADDING;
			}
			if (top < PADDING) {
				top = PADDING;
			}
			if (top + panelRect.height > viewportHeight - PADDING) {
				top = viewportHeight - panelRect.height - PADDING;
			}

			setStyles({
				position: "fixed",
				top,
				left,
				visibility: "visible",
			});
		}

		place();

		function onReposition() {
			place();
		}

		window.addEventListener("scroll", onReposition, true);
		window.addEventListener("resize", onReposition);

		return () => {
			window.removeEventListener("scroll", onReposition, true);
			window.removeEventListener("resize", onReposition);
		};
	}, [open, resolvedSide]);

	useEffect(() => {
		if (!open) {
			return;
		}

		// Not a dismiss layer. A tooltip is transient and non-modal
		// (WCAG 1.4.13), so this observer does not consume Escape.
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				clearTimers();
				setOpen(false);
			}
		}

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	let describedBy: string | undefined;
	if (open) {
		describedBy = tooltipId;
	}

	let panel: ReactNode = null;
	if (open) {
		panel = (
			<Portal>
				<div
					ref={panelRef}
					id={tooltipId}
					role="tooltip"
					data-slot="tooltip-content"
					style={styles}
					className={cn(
						"z-tooltip pointer-events-none max-w-xs rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md",
						className,
					)}
				>
					{content}
				</div>
			</Portal>
		);
	}

	return (
		<>
			<span
				ref={triggerRef}
				data-slot="tooltip"
				className="inline-flex"
				aria-describedby={describedBy}
				onMouseEnter={scheduleOpen}
				onMouseLeave={scheduleClose}
				onFocus={scheduleOpen}
				onBlur={scheduleClose}
			>
				{children}
			</span>
			{panel}
		</>
	);
}

export type { TooltipProps };
export { Tooltip };
