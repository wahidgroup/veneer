import { describe, expect, it } from "vitest";

import { edgePath } from "./edgeGeometry.js";
import type { FlowNode } from "./flowTypes.js";

const nodeA: FlowNode = {
	id: "a",
	label: "A",
	x: 0,
	y: 0,
	width: 100,
	height: 120,
	ports: [
		{ id: "out1", side: "EAST" },
		{ id: "out2", side: "EAST" },
		{ id: "out3", side: "EAST" },
	],
};

const nodeB: FlowNode = {
	id: "b",
	label: "B",
	x: 200,
	y: 0,
	width: 100,
	height: 120,
	ports: [{ id: "in", side: "WEST" }],
};

describe("edgePath", () => {
	it("uses edge.points polyline when provided", () => {
		const nodesById = new Map([
			["a", nodeA],
			["b", nodeB],
		]);
		const d = edgePath(
			{
				id: "e",
				source: "a",
				target: "b",
				points: [
					{ x: 0, y: 0 },
					{ x: 10, y: 0 },
					{ x: 10, y: 20 },
				],
			},
			nodesById,
		);
		expect(d).toBe("M 0 0 L 10 0 L 10 20");
	});

	it("routes to slot y for multi-port EAST side when no points", () => {
		const nodesById = new Map([
			["a", nodeA],
			["b", nodeB],
		]);
		const d = edgePath(
			{
				id: "e",
				source: "a",
				target: "b",
				sourcePort: "out2",
				targetPort: "in",
			},
			nodesById,
		);
		expect(d).toContain("M 100 60");
	});
});
