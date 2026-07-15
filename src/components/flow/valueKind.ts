import type { FlowConnection, FlowNode, FlowValueKind } from "./flowTypes.js";
import { findPort } from "./portLookup.js";

/**
 * True when source and target ports share the same valueKind (or either is unset).
 */
function sameValueKindConnection(
	nodes: FlowNode[],
	connection: FlowConnection,
): boolean {
	let sourceNode: FlowNode | undefined;
	let targetNode: FlowNode | undefined;
	for (const node of nodes) {
		if (node.id === connection.source) {
			sourceNode = node;
		}
		if (node.id === connection.target) {
			targetNode = node;
		}
	}

	const sourcePort = findPort(sourceNode, connection.sourcePort);
	const targetPort = findPort(targetNode, connection.targetPort);
	if (sourcePort === undefined || targetPort === undefined) {
		return true;
	}
	if (
		sourcePort.valueKind === undefined ||
		targetPort.valueKind === undefined
	) {
		return true;
	}

	const compatible = sourcePort.valueKind === targetPort.valueKind;
	return compatible;
}

/**
 * Idle edge stroke class keyed to the value kind flowing through the edge.
 */
function strokeForValueKind(kind: FlowValueKind | undefined): string {
	if (kind === "number") {
		return "stroke-primary";
	}
	if (kind === "string") {
		return "stroke-muted-foreground";
	}

	return "stroke-border";
}

/**
 * Handle border/fill tint class keyed to the port's value kind.
 */
function handleTintForValueKind(kind: FlowValueKind | undefined): string {
	if (kind === "number") {
		return "border-primary bg-primary/20";
	}
	if (kind === "string") {
		return "border-muted-foreground bg-muted";
	}

	return "";
}

export { handleTintForValueKind, sameValueKindConnection, strokeForValueKind };
