import { describe, expect, it } from "vitest";

import { layoutGraph } from "./layoutGraph.js";

describe("layoutGraph", () => {
	it("places a chain left-to-right with port sides", async () => {
		const result = await layoutGraph({
			nodes: [
				{
					id: "a",
					label: "A",
					width: 120,
					height: 64,
					ports: [
						{ id: "out", side: "EAST" },
						{ id: "in", side: "WEST" },
					],
				},
				{
					id: "b",
					label: "B",
					width: 120,
					height: 64,
					ports: [
						{ id: "out", side: "EAST" },
						{ id: "in", side: "WEST" },
					],
				},
				{
					id: "c",
					label: "C",
					width: 120,
					height: 64,
					ports: [{ id: "in", side: "WEST" }],
				},
			],
			edges: [
				{
					id: "e1",
					source: "a",
					target: "b",
					sourcePort: "out",
					targetPort: "in",
				},
				{
					id: "e2",
					source: "b",
					target: "c",
					sourcePort: "out",
					targetPort: "in",
				},
			],
			fixedPortOrder: true,
		});
		expect(result.nodes).toHaveLength(3);

		const byId = new Map(result.nodes.map((node) => [node.id, node]));
		const a = byId.get("a");
		const b = byId.get("b");
		const c = byId.get("c");
		expect(a).toBeDefined();
		expect(b).toBeDefined();
		expect(c).toBeDefined();
		expect(a!.x).toBeLessThan(b!.x);
		expect(b!.x).toBeLessThan(c!.x);
		expect(result.edges).toHaveLength(2);
	});

	it("preserves edge valueKind and label through layout", async () => {
		const result = await layoutGraph({
			nodes: [
				{
					id: "a",
					label: "A",
					width: 120,
					height: 64,
					ports: [{ id: "out", side: "EAST", valueKind: "number" }],
				},
				{
					id: "b",
					label: "B",
					width: 120,
					height: 64,
					ports: [{ id: "in", side: "WEST", valueKind: "number" }],
				},
			],
			edges: [
				{
					id: "e1",
					source: "a",
					target: "b",
					sourcePort: "out",
					targetPort: "in",
					valueKind: "number",
					label: "amt",
				},
			],
			fixedPortOrder: true,
		});
		expect(result.edges).toHaveLength(1);
		expect(result.edges[0]?.valueKind).toBe("number");
		expect(result.edges[0]?.label).toBe("amt");
		expect(result.edges[0]?.points).toBeDefined();
	});
});
