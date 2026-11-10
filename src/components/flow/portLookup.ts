import type { FlowNode, FlowPort } from "./flowTypes.js";

/**
 * Resolve a port on a node by id.
 */
function findPort(node: FlowNode | undefined, portId: string | undefined): FlowPort | undefined {
	if (node === undefined || portId === undefined || node.ports === undefined) {
		return undefined;
	}

	for (const port of node.ports) {
		if (port.id === portId) {
			return port;
		}
	}

	return undefined;
}

export { findPort };
