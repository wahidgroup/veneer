import type { FlowEdge, FlowNode, FlowPoint } from "./flowTypes.js";
import { portAnchor, portSlotOnSide } from "./flowStatus.js";
import { findPort } from "./portLookup.js";

function endpoint(
	node: FlowNode,
	portId: string | undefined,
	fallbackSide: "EAST" | "WEST",
): FlowPoint {
	const port = findPort(node, portId);
	if (port !== undefined) {
		const slot = portSlotOnSide(node.ports, port.id, port.side);
		const local = portAnchor(
			port.side,
			node.width,
			node.height,
			slot.index,
			slot.count,
		);

		const point: FlowPoint = {
			x: node.x + local.x,
			y: node.y + local.y,
		};
		return point;
	}

	const local = portAnchor(fallbackSide, node.width, node.height);
	const point: FlowPoint = {
		x: node.x + local.x,
		y: node.y + local.y,
	};
	return point;
}

/**
 * SVG path for a flow edge. Uses layout bend points when present,
 * otherwise a horizontal cubic bezier between port anchors.
 */
function edgePath(
	edge: FlowEdge,
	nodesById: Map<string, FlowNode>,
): string | null {
	const source = nodesById.get(edge.source);
	const target = nodesById.get(edge.target);
	if (source === undefined || target === undefined) {
		return null;
	}

	if (edge.points !== undefined && edge.points.length >= 2) {
		const first = edge.points[0];
		if (first === undefined) {
			return null;
		}

		let d = `M ${String(first.x)} ${String(first.y)}`;
		for (let index = 1; index < edge.points.length; index += 1) {
			const point = edge.points[index];
			if (point === undefined) {
				continue;
			}

			d += ` L ${String(point.x)} ${String(point.y)}`;
		}

		return d;
	}

	const start = endpoint(source, edge.sourcePort, "EAST");
	const end = endpoint(target, edge.targetPort, "WEST");
	const midX = (start.x + end.x) / 2;

	const path = `M ${String(start.x)} ${String(start.y)} C ${String(midX)} ${String(start.y)}, ${String(midX)} ${String(end.y)}, ${String(end.x)} ${String(end.y)}`;
	return path;
}

export { edgePath };
