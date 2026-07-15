import { describe, expect, it } from "vitest";

import type { FlowConnection, FlowNode } from "./flowTypes.js";
import { sameValueKindConnection } from "./valueKind.js";

const NODES: FlowNode[] = [
	{
		id: "a",
		label: "A",
		x: 0,
		y: 0,
		width: 100,
		height: 60,
		ports: [
			{ id: "amount", side: "EAST", valueKind: "number" },
			{ id: "address", side: "EAST", valueKind: "string" },
		],
	},
	{
		id: "b",
		label: "B",
		x: 200,
		y: 0,
		width: 100,
		height: 60,
		ports: [
			{ id: "amount", side: "WEST", valueKind: "number" },
			{ id: "address", side: "WEST", valueKind: "string" },
		],
	},
];

describe("sameValueKindConnection", () => {
	it("allows number to number", () => {
		const connection: FlowConnection = {
			source: "a",
			target: "b",
			sourcePort: "amount",
			targetPort: "amount",
		};
		expect(sameValueKindConnection(NODES, connection)).toBe(true);
	});

	it("rejects string to number", () => {
		const connection: FlowConnection = {
			source: "a",
			target: "b",
			sourcePort: "address",
			targetPort: "amount",
		};
		expect(sameValueKindConnection(NODES, connection)).toBe(false);
	});
});
