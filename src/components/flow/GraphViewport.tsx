import type {
	ComponentProps,
	PointerEvent as ReactPointerEvent,
	ReactNode,
	RefObject,
	WheelEvent as ReactWheelEvent,
} from "react";
import { createContext, useCallback, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface GraphViewportTransform {
	x: number;
	y: number;
	zoom: number;
}

interface GraphViewportHandle {
	fitView: (bounds: { width: number; height: number }, padding?: number) => void;
	screenToFlowPosition: (point: { x: number; y: number }) => {
		x: number;
		y: number;
	};
	getTransform: () => GraphViewportTransform;
}

interface GraphViewportContextValue {
	transform: GraphViewportTransform;
	screenToFlowPosition: GraphViewportHandle["screenToFlowPosition"];
	containerRef: RefObject<HTMLDivElement | null>;
}

const GraphViewportContext = createContext<GraphViewportContextValue | null>(null);

/**
 * Access the enclosing GraphViewport transform + screen->flow projection.
 * Throws when used outside a GraphViewport subtree.
 */
function useGraphViewport(): GraphViewportContextValue {
	const value = useContext(GraphViewportContext);
	if (value === null) {
		throw new Error("useGraphViewport must be used within GraphViewport");
	}

	return value;
}

interface GraphViewportProps extends Omit<ComponentProps<"div">, "children"> {
	children: ReactNode;
	minZoom?: number;
	maxZoom?: number;
	showControls?: boolean;
	showBackground?: boolean;
	viewportRef?: RefObject<GraphViewportHandle | null>;
	"aria-label": string;
}

/**
 * CSS-transform pan/zoom viewport for hybrid flow canvases.
 */
function GraphViewport({
	children,
	minZoom = 0.25,
	maxZoom = 2.5,
	showControls = true,
	showBackground = true,
	viewportRef,
	"aria-label": ariaLabel,
	className,
	...rest
}: GraphViewportProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [transform, setTransform] = useState<GraphViewportTransform>({
		x: 0,
		y: 0,
		zoom: 1,
	});
	const panRef = useRef<{
		pointerId: number;
		originX: number;
		originY: number;
		startX: number;
		startY: number;
	} | null>(null);

	const screenToFlowPosition = useCallback(
		(point: { x: number; y: number }) => {
			const el = containerRef.current;
			if (el === null) {
				return { x: point.x, y: point.y };
			}

			const rect = el.getBoundingClientRect();
			const localX = point.x - rect.left;
			const localY = point.y - rect.top;

			return {
				x: (localX - transform.x) / transform.zoom,
				y: (localY - transform.y) / transform.zoom,
			};
		},
		[transform],
	);

	const fitView = useCallback(
		(bounds: { width: number; height: number }, padding = 40) => {
			const el = containerRef.current;
			if (el === null) {
				return;
			}

			const rect = el.getBoundingClientRect();
			const availableW = Math.max(1, rect.width - padding * 2);
			const availableH = Math.max(1, rect.height - padding * 2);

			const zoomW = availableW / Math.max(1, bounds.width);
			const zoomH = availableH / Math.max(1, bounds.height);
			let zoom = Math.min(zoomW, zoomH);
			if (zoom < minZoom) {
				zoom = minZoom;
			}
			if (zoom > maxZoom) {
				zoom = maxZoom;
			}

			const x = (rect.width - bounds.width * zoom) / 2;
			const y = (rect.height - bounds.height * zoom) / 2;

			setTransform({ x, y, zoom });
		},
		[maxZoom, minZoom],
	);

	useImperativeHandle(viewportRef, () => {
		return {
			fitView,
			screenToFlowPosition,
			getTransform: () => {
				return transform;
			},
		};
	}, [fitView, screenToFlowPosition, transform]);

	function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
		event.preventDefault();

		const delta = -event.deltaY * 0.001;

		setTransform((current) => {
			let zoom = current.zoom * (1 + delta);
			if (zoom < minZoom) {
				zoom = minZoom;
			}
			if (zoom > maxZoom) {
				zoom = maxZoom;
			}

			return { ...current, zoom };
		});
	}

	function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		let allowPan = false;
		if (event.button === 1) {
			allowPan = true;
		}
		if (event.button === 0 && event.altKey) {
			allowPan = true;
		}
		if (!allowPan) {
			return;
		}

		event.currentTarget.setPointerCapture(event.pointerId);

		panRef.current = {
			pointerId: event.pointerId,
			originX: event.clientX,
			originY: event.clientY,
			startX: transform.x,
			startY: transform.y,
		};
	}

	function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		const pan = panRef.current;
		if (pan?.pointerId !== event.pointerId) {
			return;
		}

		const dx = event.clientX - pan.originX;
		const dy = event.clientY - pan.originY;
		setTransform({
			x: pan.startX + dx,
			y: pan.startY + dy,
			zoom: transform.zoom,
		});
	}

	function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
		const pan = panRef.current;
		if (pan?.pointerId !== event.pointerId) {
			return;
		}

		panRef.current = null;
		event.currentTarget.releasePointerCapture(event.pointerId);
	}

	const contextValue = useMemo<GraphViewportContextValue>(() => {
		return {
			transform,
			screenToFlowPosition,
			containerRef,
		};
	}, [transform, screenToFlowPosition]);

	let background: ReactNode = null;
	if (showBackground) {
		background = (
			<div
				data-slot="graph-viewport-background"
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-40"
				style={{
					backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
					backgroundSize: `${String(16 * transform.zoom)}px ${String(16 * transform.zoom)}px`,
					backgroundPosition: `${String(transform.x)}px ${String(transform.y)}px`,
				}}
			/>
		);
	}

	let controls: ReactNode = null;
	if (showControls) {
		controls = (
			<div data-slot="graph-viewport-controls" className="absolute bottom-3 left-3 z-20 flex gap-1">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					aria-label="Zoom in"
					onClick={() => {
						setTransform((current) => {
							let zoom = current.zoom * 1.15;
							if (zoom > maxZoom) {
								zoom = maxZoom;
							}
							return { ...current, zoom };
						});
					}}
				>
					+
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					aria-label="Zoom out"
					onClick={() => {
						setTransform((current) => {
							let zoom = current.zoom / 1.15;
							if (zoom < minZoom) {
								zoom = minZoom;
							}
							return { ...current, zoom };
						});
					}}
				>
					−
				</Button>
			</div>
		);
	}

	return (
		<GraphViewportContext.Provider value={contextValue}>
			<div
				ref={containerRef}
				data-slot="graph-viewport"
				role="group"
				aria-label={ariaLabel}
				className={cn(
					"relative h-80 w-full overflow-hidden rounded-md border border-border bg-muted/20",
					className,
				)}
				onWheel={onWheel}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				{...rest}
			>
				{background}
				<div
					data-slot="graph-viewport-world"
					className="absolute left-0 top-0 origin-top-left"
					style={{
						transform: `translate(${String(transform.x)}px, ${String(transform.y)}px) scale(${String(transform.zoom)})`,
					}}
				>
					{children}
				</div>
				{controls}
			</div>
		</GraphViewportContext.Provider>
	);
}

export type { GraphViewportHandle, GraphViewportProps, GraphViewportTransform };
export { GraphViewport, useGraphViewport };
