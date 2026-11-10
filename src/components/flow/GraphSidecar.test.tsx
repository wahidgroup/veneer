import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FlowEdge, FlowNode } from "./flowTypes.js";
import { GraphSidecar } from "./GraphSidecar.js";

const nodes: FlowNode[] = [
	{
		id: "a",
		label: "A",
		x: 0,
		y: 0,
		width: 120,
		height: 48,
	},
	{
		id: "b",
		label: "B",
		x: 200,
		y: 0,
		width: 120,
		height: 48,
	},
];

describe("GraphSidecar", () => {
	it.each([
		{
			name: "both ports",
			edge: {
				id: "e1",
				source: "a",
				target: "b",
				sourcePort: "out",
				targetPort: "in",
			} satisfies FlowEdge,
			expected: "Edge: a -> b [out->in]",
		},
		{
			name: "source port only",
			edge: {
				id: "e1",
				source: "a",
				target: "b",
				sourcePort: "out",
			} satisfies FlowEdge,
			expected: "Edge: a -> b",
		},
		{
			name: "target port only",
			edge: {
				id: "e1",
				source: "a",
				target: "b",
				targetPort: "in",
			} satisfies FlowEdge,
			expected: "Edge: a -> b",
		},
		{
			name: "no ports",
			edge: {
				id: "e1",
				source: "a",
				target: "b",
			} satisfies FlowEdge,
			expected: "Edge: a -> b",
		},
	])("formats edge description for $name", ({ edge, expected }) => {
		render(<GraphSidecar aria-label="Graph structure" nodes={nodes} edges={[edge]} />);
		expect(screen.getByText(expected)).toBeInTheDocument();
	});
});
