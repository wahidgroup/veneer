import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode, ElkPort } from "elkjs/lib/elk-api.js";

import type { FlowEdge, FlowNode, FlowPoint, FlowPort, LayoutGraphInput, LayoutGraphResult } from "./flowTypes.js";

interface ElkEngine {
	layout(graph: ElkNode): Promise<ElkNode>;
}

type ElkEngineConstructor = new () => ElkEngine;

/**
 * Narrows the elkjs default export to a constructable engine.
 */
function isElkEngineConstructor(value: unknown): value is ElkEngineConstructor {
	return typeof value === "function";
}

function createElkEngine(): ElkEngine {
	if (!isElkEngineConstructor(ELK)) {
		throw new Error("elkjs ELK constructor missing");
	}

	const engine = new ELK();
	return engine;
}

const DEFAULT_DIRECTION = "RIGHT";

function elkPortId(nodeId: string, portId: string): string {
	return `${nodeId}::${portId}`;
}

function buildElkPorts(nodeId: string, ports: FlowPort[] | undefined): ElkPort[] | undefined {
	if (ports === undefined || ports.length === 0) {
		return undefined;
	}

	const elkPorts: ElkPort[] = [];
	for (const port of ports) {
		elkPorts.push({
			id: elkPortId(nodeId, port.id),
			width: 8,
			height: 8,
			layoutOptions: {
				"elk.port.side": port.side,
			},
		});
	}

	return elkPorts;
}

function collectBendPoints(edge: ElkExtendedEdge): FlowPoint[] | undefined {
	const sections = edge.sections;
	if (sections === undefined || sections.length === 0) {
		return undefined;
	}

	const points: FlowPoint[] = [];
	for (const section of sections) {
		points.push({ x: section.startPoint.x, y: section.startPoint.y });
		if (section.bendPoints !== undefined) {
			for (const bend of section.bendPoints) {
				points.push({ x: bend.x, y: bend.y });
			}
		}

		points.push({ x: section.endPoint.x, y: section.endPoint.y });
	}

	if (points.length < 2) {
		return undefined;
	}

	return points;
}

/**
 * Layered ELK layout with optional ports (FIXED_SIDE / FIXED_ORDER).
 * Requires the optional `elkjs` peer.
 */
async function layoutGraph(input: LayoutGraphInput): Promise<LayoutGraphResult> {
	const elk = createElkEngine();
	let direction = DEFAULT_DIRECTION;
	if (input.direction !== undefined) {
		direction = input.direction;
	}

	let portConstraints = "FIXED_SIDE";
	if (input.fixedPortOrder === true) {
		portConstraints = "FIXED_ORDER";
	}

	const children: ElkNode[] = [];
	for (const node of input.nodes) {
		children.push({
			id: node.id,
			width: node.width,
			height: node.height,
			ports: buildElkPorts(node.id, node.ports),
			layoutOptions: {
				"elk.portConstraints": portConstraints,
			},
		});
	}

	const edges: ElkExtendedEdge[] = [];
	for (const edge of input.edges) {
		let sources = [edge.source];
		if (edge.sourcePort !== undefined) {
			sources = [elkPortId(edge.source, edge.sourcePort)];
		}
		let targets = [edge.target];
		if (edge.targetPort !== undefined) {
			targets = [elkPortId(edge.target, edge.targetPort)];
		}

		edges.push({
			id: edge.id,
			sources,
			targets,
		});
	}

	const graph: ElkNode = {
		id: "root",
		layoutOptions: {
			"elk.algorithm": "layered",
			"elk.direction": direction,
			"elk.spacing.nodeNode": "48",
			"elk.layered.spacing.nodeNodeBetweenLayers": "64",
			"elk.edgeRouting": "ORTHOGONAL",
		},
		children,
		edges,
	};

	const laidOut = await elk.layout(graph);
	const resultNodes: FlowNode[] = [];
	const byId = new Map<string, LayoutGraphInput["nodes"][number]>();
	for (const node of input.nodes) {
		byId.set(node.id, node);
	}

	let maxX = 0;
	let maxY = 0;
	if (laidOut.children !== undefined) {
		for (const child of laidOut.children) {
			const source = byId.get(child.id);
			if (source === undefined) {
				continue;
			}

			let x = 0;
			if (child.x !== undefined) {
				x = child.x;
			}
			let y = 0;
			if (child.y !== undefined) {
				y = child.y;
			}

			const width = source.width;
			const height = source.height;
			if (x + width > maxX) {
				maxX = x + width;
			}
			if (y + height > maxY) {
				maxY = y + height;
			}

			const ports: FlowPort[] = [];
			if (source.ports !== undefined) {
				for (const port of source.ports) {
					ports.push(port);
				}
			}

			let label = source.id;
			if (source.label !== undefined && source.label.length > 0) {
				label = source.label;
			}

			resultNodes.push({
				id: source.id,
				label,
				x,
				y,
				width,
				height,
				ports,
			});
		}
	}

	const resultEdges: FlowEdge[] = [];
	if (laidOut.edges !== undefined) {
		const edgesById = new Map<string, LayoutGraphInput["edges"][number]>();
		for (const edge of input.edges) {
			edgesById.set(edge.id, edge);
		}

		for (const edge of laidOut.edges) {
			const sourceInput = edgesById.get(edge.id);
			if (sourceInput === undefined) {
				continue;
			}

			resultEdges.push({
				id: sourceInput.id,
				source: sourceInput.source,
				target: sourceInput.target,
				sourcePort: sourceInput.sourcePort,
				targetPort: sourceInput.targetPort,
				label: sourceInput.label,
				valueKind: sourceInput.valueKind,
				points: collectBendPoints(edge),
			});
		}
	}

	return {
		nodes: resultNodes,
		edges: resultEdges,
		width: maxX + 48,
		height: maxY + 48,
	};
}

export { layoutGraph };
