import type { ReactNode } from "react";

import type { FlowEdge, FlowNode, FlowStatus } from "./flowTypes.js";
import { cn } from "../../utils/cn.js";
import { edgePath } from "./edgeGeometry.js";
import { resolveStatus } from "./flowStatus.js";
import { strokeForValueKind } from "./valueKind.js";

interface GraphEdgeLayerProps {
	nodes: FlowNode[];
	edges: FlowEdge[];
	edgeStatus?: Record<string, FlowStatus>;
	width: number;
	height: number;
	className?: string;
}

function strokeForStatus(status: FlowStatus): string | null {
	if (status === "running") {
		return "stroke-primary";
	}
	if (status === "ok") {
		return "stroke-emerald-600";
	}
	if (status === "failed") {
		return "stroke-destructive";
	}

	return null;
}

/**
 * SVG edge layer under (or over) HTML nodes. Paths use layout bend points or bezier.
 * Idle edges tint by valueKind; status overlays when active.
 */
function GraphEdgeLayer({ nodes, edges, edgeStatus, width, height, className }: GraphEdgeLayerProps) {
	const nodesById = new Map<string, FlowNode>();
	for (const node of nodes) {
		nodesById.set(node.id, node);
	}

	const paths: ReactNode[] = [];
	for (const edge of edges) {
		const d = edgePath(edge, nodesById);
		if (d === null) {
			continue;
		}

		const status = resolveStatus(edgeStatus, edge.id);
		const statusStroke = strokeForStatus(status);
		let strokeClass = strokeForValueKind(edge.valueKind);
		if (statusStroke !== null) {
			strokeClass = statusStroke;
		}

		paths.push(
			<path
				key={edge.id}
				d={d}
				fill="none"
				strokeWidth={2}
				className={cn(strokeClass)}
				data-edge-id={edge.id}
				data-status={status}
				data-value-kind={edge.valueKind}
			/>,
		);
	}

	return (
		<svg
			data-slot="graph-edge-layer"
			width={width}
			height={height}
			className={cn("pointer-events-none absolute inset-0 overflow-visible", className)}
			aria-hidden="true"
		>
			{paths}
		</svg>
	);
}

export type { GraphEdgeLayerProps };
export { GraphEdgeLayer };
