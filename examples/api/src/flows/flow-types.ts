export type FlowFieldKind = "number" | "string";

export type FlowNodeStatus = "idle" | "running" | "ok" | "failed";

export interface FlowFieldDef {
	id: string;
	label: string;
	kind: FlowFieldKind;
	direction: "in" | "out";
}

export interface FlowDemoNode {
	id: string;
	label: string;
	fields: FlowFieldDef[];
	/** Node-local config (e.g. split-half.minAmount). */
	config: Record<string, number | string>;
}

export interface FlowDemoEdge {
	id: string;
	source: string;
	target: string;
	sourcePort: string;
	targetPort: string;
	valueKind: FlowFieldKind;
}

export interface FlowDemoRun {
	runId: string | null;
	nodeStates: Record<string, FlowNodeStatus>;
	/** Per-node field id → serialized value from last run. */
	outputsByNode: Record<string, Record<string, string | number>>;
	message: string;
}

export interface FlowDemoSnapshot {
	nodes: FlowDemoNode[];
	edges: FlowDemoEdge[];
	run: FlowDemoRun;
}

export const DEFAULT_MIN_AMOUNT = 10;
export const MAX_DEPOSIT_AMOUNT = 1_000_000;
export const MAX_MIN_AMOUNT = 1_000_000;
export const MAX_ADDRESS_LENGTH = 256;
