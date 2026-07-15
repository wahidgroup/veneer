import { DescriptionList } from "../data/DescriptionList.js";
import type { FlowEdge, FlowNode } from "./flowTypes.js";

interface GraphSidecarProps {
	nodes: FlowNode[];
	edges: FlowEdge[];
	"aria-label": string;
}

/**
 * Accessible node/edge structure parallel to the visual canvas
 * (WCAG dense-graph fallback).
 */
function GraphSidecar({
	nodes,
	edges,
	"aria-label": ariaLabel,
}: GraphSidecarProps) {
	const items = [
		...nodes.map((node) => {
			return {
				term: node.id,
				description: `Node: ${node.label}`,
			};
		}),
		...edges.map((edge) => {
			let description = `${edge.source} → ${edge.target}`;
			if (edge.label !== undefined && edge.label.length > 0) {
				description = `${description} (${edge.label})`;
			}

			let sourcePort = "*";
			if (edge.sourcePort !== undefined) {
				sourcePort = edge.sourcePort;
			}

			let targetPort = "*";
			if (edge.targetPort !== undefined) {
				targetPort = edge.targetPort;
			}
			if (
				edge.sourcePort !== undefined ||
				edge.targetPort !== undefined
			) {
				description = `${description} [${sourcePort}→${targetPort}]`;
			}

			return {
				term: edge.id,
				description: `Edge: ${description}`,
			};
		}),
	];

	return (
		<DescriptionList
			data-slot="graph-sidecar"
			aria-label={ariaLabel}
			items={items}
			columns={1}
		/>
	);
}

export type { GraphSidecarProps };
export { GraphSidecar };
