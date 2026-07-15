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
	it.each([
		{
			label: "allows number to number",
			connection: {
				source: "a",
				target: "b",
				sourcePort: "amount",
				targetPort: "amount",
			} satisfies FlowConnection,
			expected: true,
		},
		{
			label: "rejects string to number",
			connection: {
				source: "a",
				target: "b",
				sourcePort: "address",
				targetPort: "amount",
			} satisfies FlowConnection,
			expected: false,
		},
	])("$label", ({ connection, expected }) => {
		const allowed = sameValueKindConnection(NODES, connection);
		expect(allowed).toBe(expected);
	});
});
