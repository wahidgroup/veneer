/**
 * @packageDocumentation
 * `@wahidgroup/veneer/flow`: hybrid flow canvas (HTML nodes + SVG edges).
 *
 * Peer: none required for the canvas. Use `@wahidgroup/veneer/flow/layout`
 * (+ `elkjs`) for `layoutGraph`.
 *
 * `FlowValueKind` is `"string" | "number"` in v1; widen only with a breaking change.
 */

export { FlowCanvas } from "./components/flow/FlowCanvas.js";
export type { FlowCanvasProps, FlowFocusMode } from "./components/flow/FlowCanvas.js";
export { GraphEdgeLayer } from "./components/flow/GraphEdgeLayer.js";
export type { GraphEdgeLayerProps } from "./components/flow/GraphEdgeLayer.js";
export { GraphHandle } from "./components/flow/GraphHandle.js";
export type { GraphHandleProps } from "./components/flow/GraphHandle.js";
export { GraphNode } from "./components/flow/GraphNode.js";
export type { GraphNodeProps } from "./components/flow/GraphNode.js";
export { GraphSidecar } from "./components/flow/GraphSidecar.js";
export type { GraphSidecarProps } from "./components/flow/GraphSidecar.js";
export { buildStatusMessage, GraphStatusRegion } from "./components/flow/GraphStatusRegion.js";
export type { GraphStatusRegionProps } from "./components/flow/GraphStatusRegion.js";
export { GraphViewport, useGraphViewport } from "./components/flow/GraphViewport.js";
export type {
	GraphViewportHandle,
	GraphViewportProps,
	GraphViewportTransform,
} from "./components/flow/GraphViewport.js";
export { sameValueKindConnection } from "./components/flow/valueKind.js";
export type {
	FlowConnection,
	FlowEdge,
	FlowNode,
	FlowNodeRenderContext,
	FlowNodeRenderer,
	FlowPoint,
	FlowPort,
	FlowPortSide,
	FlowStatus,
	FlowValueKind,
} from "./components/flow/flowTypes.js";
