import { describe, expect, it } from "vitest";

import { worldBounds } from "./worldBounds.js";
import type { FlowNode } from "./flowTypes.js";

describe("worldBounds", () => {
	it("uses overrides when provided", () => {
		const bounds = worldBounds([], 900, 500);
		expect(bounds).toEqual({ width: 900, height: 500 });
	});

	it("expands from node extents", () => {
		const nodes: FlowNode[] = [
			{
				id: "a",
				label: "A",
				x: 10,
				y: 20,
				width: 100,
				height: 50,
			},
			{
				id: "b",
				label: "B",
				x: 200,
				y: 100,
				width: 80,
				height: 40,
			},
		];
		const bounds = worldBounds(nodes, undefined, undefined);
		expect(bounds.width).toBe(360);
		expect(bounds.height).toBe(220);
	});
});
