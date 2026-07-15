import type {
	ComponentProps,
	KeyboardEvent,
	PointerEvent,
	ReactNode,
} from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn.js";

type ResizablePanelOrientation = "horizontal" | "vertical";

interface ResizablePanelProps extends Omit<ComponentProps<"div">, "children"> {
	orientation?: ResizablePanelOrientation;
	defaultSize?: number;
	minSize?: number;
	maxSize?: number;
	start: ReactNode;
	end: ReactNode;
}

const RESIZE_STEP = 5;

function clampSize(value: number, min: number, max: number): number {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}
	return value;
}

/**
 * Two-pane flex layout with a keyboard- and pointer-resizable separator.
 * Percentage sizing only; no persistence.
 */
function ResizablePanel({
	orientation,
	defaultSize,
	minSize,
	maxSize,
	start,
	end,
	className,
	...rest
}: ResizablePanelProps) {
	let resolvedOrientation: ResizablePanelOrientation = "horizontal";
	if (orientation === "vertical") {
		resolvedOrientation = "vertical";
	}

	let resolvedDefaultSize = 50;
	if (defaultSize !== undefined) {
		resolvedDefaultSize = defaultSize;
	}

	let resolvedMinSize = 10;
	if (minSize !== undefined) {
		resolvedMinSize = minSize;
	}

	let resolvedMaxSize = 90;
	if (maxSize !== undefined) {
		resolvedMaxSize = maxSize;
	}

	const rootRef = useRef<HTMLDivElement | null>(null);
	const sizeRef = useRef(resolvedDefaultSize);
	const dragRef = useRef<{
		pointerId: number;
		startSize: number;
		startCoord: number;
	} | null>(null);

	const [size, setSize] = useState(() => {
		return clampSize(resolvedDefaultSize, resolvedMinSize, resolvedMaxSize);
	});

	useEffect(() => {
		sizeRef.current = size;
	}, [size]);

	const adjustSize = (delta: number) => {
		setSize((current) => {
			return clampSize(current + delta, resolvedMinSize, resolvedMaxSize);
		});
	};

	function onHandleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (resolvedOrientation === "horizontal") {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				adjustSize(-RESIZE_STEP);
				return;
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				adjustSize(RESIZE_STEP);
				return;
			}
		} else {
			if (event.key === "ArrowUp") {
				event.preventDefault();
				adjustSize(-RESIZE_STEP);
				return;
			}
			if (event.key === "ArrowDown") {
				event.preventDefault();
				adjustSize(RESIZE_STEP);
				return;
			}
		}
	}

	function onHandlePointerDown(event: PointerEvent<HTMLDivElement>) {
		let button = event.button;
		button ??= 0;
		if (button !== 0) {
			return;
		}

		const root = rootRef.current;
		if (root === null) {
			return;
		}

		let startCoord = event.clientX;
		if (resolvedOrientation === "vertical") {
			startCoord = event.clientY;
		}

		let pointerId = event.pointerId;
		pointerId ??= 1;

		dragRef.current = {
			pointerId,
			startSize: sizeRef.current,
			startCoord,
		};

		const target = event.currentTarget;
		if (typeof target.setPointerCapture === "function") {
			target.setPointerCapture(pointerId);
		}

		event.preventDefault();
	}

	useEffect(() => {
		function onWindowPointerMove(event: globalThis.PointerEvent) {
			const drag = dragRef.current;
			if (drag === null) {
				return;
			}

			let pointerId = event.pointerId;
			pointerId ??= 1;
			if (drag.pointerId !== pointerId) {
				return;
			}

			const root = rootRef.current;
			if (root === null) {
				return;
			}

			const rect = root.getBoundingClientRect();
			let extent = rect.width;
			let deltaPx = event.clientX - drag.startCoord;
			if (resolvedOrientation === "vertical") {
				extent = rect.height;
				deltaPx = event.clientY - drag.startCoord;
			}
			if (extent <= 0) {
				return;
			}

			const deltaPercent = (deltaPx / extent) * 100;
			const next = clampSize(
				drag.startSize + deltaPercent,
				resolvedMinSize,
				resolvedMaxSize,
			);
			setSize(next);
		}

		function onWindowPointerUp(event: globalThis.PointerEvent) {
			const drag = dragRef.current;
			if (drag === null) {
				return;
			}

			let pointerId = event.pointerId;
			pointerId ??= 1;
			if (drag.pointerId !== pointerId) {
				return;
			}

			dragRef.current = null;
		}

		window.addEventListener("pointermove", onWindowPointerMove);
		window.addEventListener("pointerup", onWindowPointerUp);
		window.addEventListener("pointercancel", onWindowPointerUp);

		return () => {
			window.removeEventListener("pointermove", onWindowPointerMove);
			window.removeEventListener("pointerup", onWindowPointerUp);
			window.removeEventListener("pointercancel", onWindowPointerUp);
		};
	}, [resolvedOrientation, resolvedMinSize, resolvedMaxSize]);

	let flexDirection: "row" | "column" = "row";
	let ariaOrientation: "horizontal" | "vertical" = "vertical";
	let handleClass = cn(
		"relative z-10 shrink-0 touch-none select-none",
		"bg-transparent",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		"before:pointer-events-none before:absolute before:bg-border",
	);

	if (resolvedOrientation === "vertical") {
		flexDirection = "column";
		ariaOrientation = "horizontal";
		handleClass = cn(
			handleClass,
			"h-3 w-full cursor-row-resize",
			"before:inset-x-0 before:top-1/2 before:h-px before:-translate-y-1/2",
		);
	} else {
		handleClass = cn(
			handleClass,
			"w-3 self-stretch cursor-col-resize",
			"before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2",
		);
	}

	return (
		<div
			ref={rootRef}
			data-slot="resizable-panel"
			data-orientation={resolvedOrientation}
			className={cn("flex h-full min-h-0 w-full min-w-0", className)}
			style={{ flexDirection }}
			{...rest}
		>
			<div
				data-slot="resizable-panel-start"
				className="min-h-0 min-w-0 overflow-auto"
				style={{ flex: `0 0 ${String(size)}%` }}
			>
				{start}
			</div>
			{/* APG window splitter: focusable separator handle. */}
			{/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- APG separator */}
			<div
				role="separator"
				data-slot="resizable-handle"
				tabIndex={0}
				aria-orientation={ariaOrientation}
				aria-valuenow={Math.round(size)}
				aria-valuemin={resolvedMinSize}
				aria-valuemax={resolvedMaxSize}
				aria-label="Resize panels"
				className={handleClass}
				onKeyDown={onHandleKeyDown}
				onPointerDown={onHandlePointerDown}
			/>
			{/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
			<div
				data-slot="resizable-panel-end"
				className="min-h-0 min-w-0 flex-1 overflow-auto"
			>
				{end}
			</div>
		</div>
	);
}

export type { ResizablePanelProps, ResizablePanelOrientation };
export { ResizablePanel };
