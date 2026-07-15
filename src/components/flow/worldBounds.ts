import type { FlowNode } from "./flowTypes.js";

interface WorldBounds {
	width: number;
	height: number;
}

/**
 * Compute flow world size from nodes or explicit overrides.
 */
function worldBounds(
	nodes: FlowNode[],
	worldWidth: number | undefined,
	worldHeight: number | undefined,
): WorldBounds {
	let width = 640;
	if (worldWidth !== undefined) {
		width = worldWidth;
	} else if (nodes.length > 0) {
		let maxX = 0;
		for (const node of nodes) {
			const right = node.x + node.width;
			if (right > maxX) {
				maxX = right;
			}
		}

		width = maxX + 80;
	}

	let height = 360;
	if (worldHeight !== undefined) {
		height = worldHeight;
	} else if (nodes.length > 0) {
		let maxY = 0;
		for (const node of nodes) {
			const bottom = node.y + node.height;
			if (bottom > maxY) {
				maxY = bottom;
			}
		}

		height = maxY + 80;
	}

	return { width, height };
}

export type { WorldBounds };
export { worldBounds };
