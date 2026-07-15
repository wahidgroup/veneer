import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import type { FlowConnection, FlowEdge, FlowNode } from "./flowTypes.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FlowCanvas } from "./FlowCanvas.js";

const DROP_MIME = "application/x-veneer-flow-test";

const SAMPLE_NODES: FlowNode[] = [
	{
		id: "trigger",
		label: "Trigger",
		x: 40,
		y: 40,
		width: 140,
		height: 72,
		ports: [
			{ id: "out", side: "EAST" },
			{ id: "in", side: "WEST" },
		],
	},
	{
		id: "task",
		label: "Task",
		x: 260,
		y: 40,
		width: 140,
		height: 72,
		ports: [
			{ id: "out", side: "EAST" },
			{ id: "in", side: "WEST" },
		],
	},
];

const SAMPLE_EDGES: FlowEdge[] = [
	{
		id: "e1",
		source: "trigger",
		target: "task",
		sourcePort: "out",
		targetPort: "in",
	},
];

describe("FlowCanvas", () => {
	it("has no axe violations on the default read canvas", async () => {
		await expectNoA11yViolations(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
			/>,
		);
	});

	it("merges className on the root", () => {
		const { container } = render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				className="extra-flow"
			/>,
		);
		expect(
			container.querySelector('[data-slot="flow-canvas"]'),
		).toHaveClass("extra-flow");
	});

	it("selects a node on click", async () => {
		const user = userEvent.setup();
		let selected: string | null = null;
		render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				onNodeSelect={(nodeId) => {
					selected = nodeId;
				}}
			/>,
		);

		await user.click(screen.getByRole("group", { name: "Task" }));
		expect(selected).toBe("task");
	});

	it("exposes structure sidecar terms", () => {
		render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
			/>,
		);
		expect(screen.getByText("Node: Trigger")).toBeInTheDocument();
		expect(screen.getByText(/Edge:/)).toBeInTheDocument();
	});

	it.each([
		["idle", "Graph idle"],
		["running", "Node task running"],
	] as const)("announces %s status", (status, expected) => {
		let nodeStatus: Record<string, "idle" | "running" | "ok" | "failed"> =
			{};
		if (status === "running") {
			nodeStatus = { task: "running" };
		}

		render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				nodeStatus={nodeStatus}
			/>,
		);
		expect(screen.getByRole("status")).toHaveTextContent(expected);
	});

	it("connects via source then target GraphHandle clicks", async () => {
		const user = userEvent.setup();
		const connections: FlowConnection[] = [];
		render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={[]}
				fitOnMount={false}
				editable
				onConnect={(connection) => {
					connections.push(connection);
				}}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Trigger source port out" }),
		);
		expect(screen.getByText(/Connecting from trigger/)).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: "Task target port in" }),
		);
		expect(connections).toHaveLength(1);
		expect(connections[0]?.source).toBe("trigger");
		expect(connections[0]?.target).toBe("task");
		expect(connections[0]?.sourcePort).toBe("out");
		expect(connections[0]?.targetPort).toBe("in");
	});

	it("does not call onConnect when isValidConnection returns false", async () => {
		const user = userEvent.setup();
		const connections: FlowConnection[] = [];
		const typedNodes: FlowNode[] = [
			{
				id: "a",
				label: "A",
				x: 0,
				y: 0,
				width: 100,
				height: 60,
				ports: [{ id: "num", side: "EAST", valueKind: "number" }],
			},
			{
				id: "b",
				label: "B",
				x: 200,
				y: 0,
				width: 100,
				height: 60,
				ports: [{ id: "str", side: "WEST", valueKind: "string" }],
			},
		];

		render(
			<FlowCanvas
				aria-label="typed flow"
				nodes={typedNodes}
				edges={[]}
				fitOnMount={false}
				editable
				onConnect={(connection) => {
					connections.push(connection);
				}}
				isValidConnection={() => {
					return false;
				}}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "A source port num" }),
		);
		await user.click(
			screen.getByRole("button", { name: "B target port str" }),
		);
		expect(connections).toHaveLength(0);
		expect(screen.getByText(/Connection rejected/)).toBeInTheDocument();
	});

	it("deletes the selected node and incident edges on Delete", async () => {
		const user = userEvent.setup();
		let nodes = SAMPLE_NODES;
		let edges = SAMPLE_EDGES;

		const { rerender } = render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={nodes}
				edges={edges}
				selectedId="trigger"
				fitOnMount={false}
				editable
				onNodesChange={(next) => {
					nodes = next;
				}}
				onEdgesChange={(next) => {
					edges = next;
				}}
			/>,
		);

		const trigger = screen.getByRole("group", { name: "Trigger" });
		trigger.focus();
		await user.keyboard("{Delete}");

		rerender(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={nodes}
				edges={edges}
				fitOnMount={false}
				editable
				onNodesChange={(next) => {
					nodes = next;
				}}
				onEdgesChange={(next) => {
					edges = next;
				}}
			/>,
		);

		expect(nodes.map((node) => node.id)).toEqual(["task"]);
		expect(edges).toHaveLength(0);
	});

	it("returns to navigate mode on Escape from edit-node", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				editable
			/>,
		);

		const trigger = screen.getByRole("group", { name: "Trigger" });
		trigger.focus();

		await user.keyboard("{Enter}");
		expect(
			container.querySelector('[data-focus-mode="edit-node"]'),
		).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(
			container.querySelector('[data-focus-mode="navigate"]'),
		).toBeInTheDocument();
	});

	it("drops a palette type onto the viewport", () => {
		const drops: { type: string; x: number; y: number }[] = [];
		const { container } = render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				editable
				dropMimeType={DROP_MIME}
				onDropType={(type, position) => {
					drops.push({ type, x: position.x, y: position.y });
				}}
			/>,
		);

		const viewport = container.querySelector(
			'[data-slot="graph-viewport"]',
		);
		expect(viewport).not.toBeNull();
		if (viewport === null) {
			return;
		}

		fireEvent.drop(viewport, {
			dataTransfer: {
				getData: (mime: string) => {
					if (mime === DROP_MIME) {
						return "http.send";
					}
					return "";
				},
			},
			clientX: 120,
			clientY: 80,
		});
		expect(drops).toHaveLength(1);

		const drop = drops[0];
		expect(drop).toBeDefined();
		if (drop === undefined) {
			return;
		}

		expect(drop.type).toBe("http.send");
	});

	it("renders GraphHandle as Button chrome", () => {
		const { container } = render(
			<FlowCanvas
				aria-label="Sample flow"
				nodes={SAMPLE_NODES}
				edges={SAMPLE_EDGES}
				fitOnMount={false}
				showHandles
			/>,
		);

		const handle = container.querySelector('[data-slot="graph-handle"]');
		expect(handle).toBeTruthy();
		expect(handle?.tagName).toBe("BUTTON");
	});
});
