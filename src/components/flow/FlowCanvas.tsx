import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { FlowConnection, FlowEdge, FlowNode, FlowNodeRenderer, FlowStatus } from "./flowTypes.js";
import type { FlowFocusMode } from "./useFlowCanvasInteraction.js";
import type { GraphViewportHandle } from "./GraphViewport.js";
import { cn } from "../../utils/cn.js";
import { resolveStatus } from "./flowStatus.js";
import { GraphEdgeLayer } from "./GraphEdgeLayer.js";
import { GraphNode } from "./GraphNode.js";
import { GraphSidecar } from "./GraphSidecar.js";
import { buildStatusMessage, GraphStatusRegion } from "./GraphStatusRegion.js";
import { GraphViewport } from "./GraphViewport.js";
import { useFlowCanvasInteraction } from "./useFlowCanvasInteraction.js";
import { worldBounds } from "./worldBounds.js";

interface FlowCanvasProps {
	nodes: FlowNode[];
	edges: FlowEdge[];
	"aria-label": string;
	selectedId?: string;
	onNodeSelect?: (nodeId: string | null) => void;
	onNodesChange?: (nodes: FlowNode[]) => void;
	onEdgesChange?: (edges: FlowEdge[]) => void;
	onConnect?: (connection: FlowConnection) => void;
	isValidConnection?: (connection: FlowConnection) => boolean;
	/**
	 * MIME type for palette drops; payload = node type string.
	 */
	dropMimeType?: string;
	onDropType?: (type: string, position: { x: number; y: number }) => void;
	nodeStatus?: Record<string, FlowStatus>;
	edgeStatus?: Record<string, FlowStatus>;
	editable?: boolean;
	showHandles?: boolean;
	renderNode?: FlowNodeRenderer;
	fitOnMount?: boolean;
	className?: string;
	worldWidth?: number;
	worldHeight?: number;
}

/**
 * Hybrid HTML+SVG flow canvas: pan/zoom viewport, node shells, edges, sidecar, live status.
 * Editable mode adds drag, connect-via-handles, Delete/Backspace node removal, and palette drop.
 * Domain rules stay in the consumer.
 */
function FlowCanvas({
	nodes,
	edges,
	"aria-label": ariaLabel,
	selectedId,
	onNodeSelect,
	onNodesChange,
	onEdgesChange,
	onConnect,
	isValidConnection,
	dropMimeType,
	onDropType,
	nodeStatus,
	edgeStatus,
	editable = false,
	showHandles = false,
	renderNode,
	fitOnMount = true,
	className,
	worldWidth,
	worldHeight,
}: FlowCanvasProps) {
	const viewportRef = useRef<GraphViewportHandle | null>(null);
	const bounds = worldBounds(nodes, worldWidth, worldHeight);
	const interaction = useFlowCanvasInteraction({
		nodes,
		edges,
		editable,
		selectedId,
		viewportRef,
		onNodeSelect,
		onNodesChange,
		onEdgesChange,
		onConnect,
		isValidConnection,
		dropMimeType,
		onDropType,
	});

	useEffect(() => {
		if (!fitOnMount) {
			return;
		}
		const handle = viewportRef.current;
		if (handle === null) {
			return;
		}
		handle.fitView({ width: bounds.width, height: bounds.height });
	}, [fitOnMount, bounds.width, bounds.height]);

	const statusMessage = buildStatusMessage(nodeStatus, edgeStatus);

	let showPortHandles = showHandles;
	if (editable) {
		showPortHandles = true;
	}

	const nodeElements: ReactNode[] = [];
	for (const [index, node] of nodes.entries()) {
		if (node === undefined) {
			continue;
		}

		const status = resolveStatus(nodeStatus, node.id);
		let selected = false;
		if (selectedId === node.id) {
			selected = true;
		}
		let focused = false;
		if (index === interaction.focusIndex) {
			focused = true;
		}
		let tabIndex = -1;
		if (focused && interaction.focusMode === "navigate") {
			tabIndex = 0;
		}

		let editMode = false;
		if (interaction.focusMode === "edit-node" && focused) {
			editMode = true;
		}

		let body: ReactNode = null;
		if (renderNode !== undefined) {
			body = renderNode({
				node,
				selected,
				focused,
				status,
				editMode,
			});
		}

		nodeElements.push(
			<GraphNode
				key={node.id}
				node={node}
				selected={selected}
				focused={focused}
				status={status}
				editMode={editMode}
				showHandles={showPortHandles}
				tabIndex={tabIndex}
				onShellKeyDown={(event) => {
					interaction.onShellKeyDown(index, event);
				}}
				onPortClick={(port, kind) => {
					interaction.onPortClick(node.id, port, kind);
				}}
				onClick={() => {
					interaction.setFocusIndex(index);
					interaction.selectNode(node.id);
				}}
				onFocus={() => {
					interaction.setFocusIndex(index);
				}}
				onPointerDown={(event) => {
					interaction.onNodePointerDown(node, event);
				}}
				onPointerMove={interaction.onNodePointerMove}
				onPointerUp={interaction.onNodePointerUp}
				onDoubleClick={() => {
					if (editable) {
						interaction.setFocusMode("edit-node");
					}
				}}
			>
				{body}
			</GraphNode>,
		);
	}

	let connectingHint: ReactNode = null;
	if (interaction.connecting !== null) {
		let portSuffix = "";
		if (interaction.connecting.sourcePort !== undefined) {
			portSuffix = ` / ${interaction.connecting.sourcePort}`;
		}

		connectingHint = (
			<p className="text-xs text-muted-foreground" role="status">
				Connecting from {interaction.connecting.source}
				{portSuffix}. Click a target port to finish.
			</p>
		);
	} else if (interaction.connectionHint !== null) {
		connectingHint = (
			<p className="text-xs text-destructive" role="status">
				{interaction.connectionHint}
			</p>
		);
	}

	const editableAttr = String(editable);

	return (
		<div
			data-slot="flow-canvas"
			data-editable={editableAttr}
			data-focus-mode={interaction.focusMode}
			className={cn("flex flex-col gap-3", className)}
		>
			<GraphViewport
				aria-label={ariaLabel}
				viewportRef={viewportRef}
				onDragOver={interaction.onDragOver}
				onDrop={interaction.onDrop}
				onClick={() => {
					interaction.clearConnecting();
				}}
			>
				<div
					data-slot="flow-canvas-world"
					style={{
						width: bounds.width,
						height: bounds.height,
						position: "relative",
					}}
				>
					<GraphEdgeLayer
						nodes={nodes}
						edges={edges}
						edgeStatus={edgeStatus}
						width={bounds.width}
						height={bounds.height}
					/>
					{nodeElements}
				</div>
			</GraphViewport>
			{connectingHint}
			<GraphStatusRegion message={statusMessage} nodeStatuses={nodeStatus} />
			<GraphSidecar nodes={nodes} edges={edges} aria-label={`${ariaLabel} structure`} />
		</div>
	);
}

export type { FlowCanvasProps, FlowFocusMode };
export { FlowCanvas };
