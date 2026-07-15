import type { ReactNode } from "react";

type FlowPortSide = "NORTH" | "SOUTH" | "EAST" | "WEST";

type FlowStatus = "idle" | "running" | "ok" | "failed";

type FlowValueKind = "string" | "number";

interface FlowPort {
	id: string;
	side: FlowPortSide;
	label?: string;
	valueKind?: FlowValueKind;
}

interface FlowPoint {
	x: number;
	y: number;
}

interface FlowNode {
	id: string;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
	ports?: FlowPort[];
}

interface FlowEdge {
	id: string;
	source: string;
	target: string;
	sourcePort?: string;
	targetPort?: string;
	label?: string;
	valueKind?: FlowValueKind;
	/** Optional bend points from layout (flow coords). */
	points?: FlowPoint[];
}

interface FlowConnection {
	source: string;
	target: string;
	sourcePort?: string;
	targetPort?: string;
}

interface LayoutGraphNodeInput {
	id: string;
	label?: string;
	width: number;
	height: number;
	ports?: FlowPort[];
}

interface LayoutGraphEdgeInput {
	id: string;
	source: string;
	target: string;
	sourcePort?: string;
	targetPort?: string;
	label?: string;
	valueKind?: FlowValueKind;
}

interface LayoutGraphInput {
	nodes: LayoutGraphNodeInput[];
	edges: LayoutGraphEdgeInput[];
	direction?: "RIGHT" | "LEFT" | "UP" | "DOWN";
	/** When true, preserve port order within a side (FIXED_ORDER). */
	fixedPortOrder?: boolean;
}

interface LayoutGraphResult {
	nodes: FlowNode[];
	edges: FlowEdge[];
	width: number;
	height: number;
}

interface FlowNodeRenderContext {
	node: FlowNode;
	selected: boolean;
	focused: boolean;
	status: FlowStatus;
	editMode: boolean;
}

type FlowNodeRenderer = (context: FlowNodeRenderContext) => ReactNode;

export type {
	FlowConnection,
	FlowEdge,
	FlowNode,
	FlowNodeRenderContext,
	FlowNodeRenderer,
	FlowPoint,
	FlowPort,
	FlowPortSide,
	FlowStatus,
	FlowValueKind,
	LayoutGraphEdgeInput,
	LayoutGraphInput,
	LayoutGraphNodeInput,
	LayoutGraphResult,
};
