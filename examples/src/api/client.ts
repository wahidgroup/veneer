import createClient from "openapi-fetch";

import type { components, paths } from "./types/api.js";
import { unwrap, unwrapPaginated } from "./unwrap.js";

type TableRowDto = components["schemas"]["TableRowDto"];

export type TableRow = TableRowDto;

export interface TableListParams {
	page?: number;
	limit?: number;
	queries?: string[];
	search?: string;
	sortBy?: string;
	sortDesc?: boolean;
	filterName?: string;
	filterRegion?: string;
	filterStatus?: string;
}

function createExamplesApiClient(baseUrl = "") {
	return createClient<paths>({ baseUrl });
}

const client = createExamplesApiClient();

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

function requireHealth(data: unknown): { status: string } {
	if (!isRecord(data) || typeof data.status !== "string") {
		throw new Error("health payload missing status");
	}

	const result = { status: data.status };
	return result;
}

function requireStreaming(data: unknown): { streaming: boolean } {
	if (!isRecord(data) || typeof data.streaming !== "boolean") {
		throw new Error("stream payload missing streaming");
	}

	const result = { streaming: data.streaming };
	return result;
}

function requireReset(data: unknown): { streaming: boolean; count: number } {
	if (!isRecord(data) || typeof data.streaming !== "boolean" || typeof data.count !== "number") {
		throw new Error("reset payload missing streaming/count");
	}

	const result = { streaming: data.streaming, count: data.count };
	return result;
}

function requireCount(data: unknown): { count: number } {
	if (!isRecord(data) || typeof data.count !== "number") {
		throw new Error("count payload missing count");
	}

	const result = { count: data.count };
	return result;
}

function isTableStatus(value: unknown): value is TableRow["status"] {
	return value === "healthy" || value === "degraded" || value === "down";
}

function requireTableRows(data: {
	items: unknown[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}): {
	items: TableRow[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
} {
	const items: TableRow[] = [];
	for (const item of data.items) {
		if (
			!isRecord(item) ||
			typeof item.id !== "string" ||
			typeof item.name !== "string" ||
			typeof item.region !== "string" ||
			!isTableStatus(item.status) ||
			typeof item.cpu !== "number"
		) {
			throw new Error("table row payload invalid");
		}

		items.push({
			id: item.id,
			name: item.name,
			region: item.region,
			status: item.status,
			cpu: item.cpu,
		});
	}

	const result = {
		items,
		pagination: data.pagination,
	};
	return result;
}

async function getHealth(): Promise<{ status: string }> {
	const result = await client.GET("/health");
	if (result.error !== undefined) {
		throw new Error("health request failed");
	}

	return requireHealth(unwrap(result.data));
}

async function getLogStreamStatus(): Promise<{ streaming: boolean }> {
	const result = await client.GET("/v1/logs/stream");
	if (result.error !== undefined) {
		throw new Error("stream status request failed");
	}

	return requireStreaming(unwrap(result.data));
}

async function startLogStream(): Promise<{ streaming: boolean }> {
	const result = await client.POST("/v1/logs/stream/start");
	if (result.error !== undefined) {
		throw new Error("start stream failed");
	}

	return requireStreaming(unwrap(result.data));
}

async function stopLogStream(): Promise<{ streaming: boolean }> {
	const result = await client.POST("/v1/logs/stream/stop");
	if (result.error !== undefined) {
		throw new Error("stop stream failed");
	}

	return requireStreaming(unwrap(result.data));
}

async function resetLogStream(): Promise<{
	streaming: boolean;
	count: number;
}> {
	const result = await client.POST("/v1/logs/stream/reset");
	if (result.error !== undefined) {
		throw new Error("reset stream failed");
	}

	return requireReset(unwrap(result.data));
}

async function listTableRows(
	id: string,
	query?: TableListParams,
): Promise<{
	items: TableRow[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}> {
	const result = await client.GET("/v1/tables/{id}", {
		params: {
			path: { id },
			query,
		},
	});
	if (result.error !== undefined) {
		throw new Error("list table failed");
	}

	return requireTableRows(unwrapPaginated(result.data));
}

async function addTableRows(id: string, rows: TableRow[]): Promise<{ count: number }> {
	const result = await client.POST("/v1/tables/{id}/rows", {
		params: { path: { id } },
		body: { rows },
	});
	if (result.error !== undefined) {
		throw new Error("add table rows failed");
	}

	return requireCount(unwrap(result.data));
}

async function removeTableRows(id: string, ids: string[]): Promise<{ count: number }> {
	const result = await client.POST("/v1/tables/{id}/rows/remove", {
		params: { path: { id } },
		body: { ids },
	});
	if (result.error !== undefined) {
		throw new Error("remove table rows failed");
	}

	return requireCount(unwrap(result.data));
}

async function resetTable(id: string): Promise<{ streaming: boolean; count: number }> {
	const result = await client.POST("/v1/tables/{id}/reset", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("reset table failed");
	}

	return requireReset(unwrap(result.data));
}

async function getTableStreamStatus(id: string): Promise<{ streaming: boolean }> {
	const result = await client.GET("/v1/tables/{id}/stream", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("table stream status failed");
	}

	return requireStreaming(unwrap(result.data));
}

async function startTableStream(id: string): Promise<{ streaming: boolean }> {
	const result = await client.POST("/v1/tables/{id}/stream/start", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("start table stream failed");
	}

	return requireStreaming(unwrap(result.data));
}

async function stopTableStream(id: string): Promise<{ streaming: boolean }> {
	const result = await client.POST("/v1/tables/{id}/stream/stop", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("stop table stream failed");
	}

	return requireStreaming(unwrap(result.data));
}

type InstanceOption = components["schemas"]["InstanceOptionDto"];

function requireInstanceOptions(data: unknown): { items: InstanceOption[] } {
	if (!isRecord(data) || !Array.isArray(data.items)) {
		throw new Error("options list payload invalid");
	}

	const items: InstanceOption[] = [];
	for (const item of data.items) {
		if (!isRecord(item) || typeof item.value !== "string" || typeof item.label !== "string") {
			throw new Error("option item payload invalid");
		}

		items.push({ value: item.value, label: item.label });
	}

	return { items };
}

function requireInstanceOption(data: unknown): InstanceOption {
	if (!isRecord(data) || typeof data.value !== "string" || typeof data.label !== "string") {
		throw new Error("option payload invalid");
	}

	return { value: data.value, label: data.label };
}

async function listInstanceOptions(q?: string): Promise<{ items: InstanceOption[] }> {
	const result = await client.GET("/v1/options/instances", {
		params: { query: { q } },
	});
	if (result.error !== undefined) {
		throw new Error("list instance options failed");
	}

	return requireInstanceOptions(unwrap(result.data));
}

async function addInstanceOption(option: InstanceOption): Promise<InstanceOption> {
	const result = await client.POST("/v1/options/instances", {
		body: option,
	});
	if (result.error !== undefined) {
		throw new Error("add instance option failed");
	}

	return requireInstanceOption(unwrap(result.data));
}

async function removeInstanceOption(value: string): Promise<{ count: number }> {
	const result = await client.DELETE("/v1/options/instances/{value}", {
		params: { path: { value } },
	});
	if (result.error !== undefined) {
		throw new Error("remove instance option failed");
	}

	return requireCount(unwrap(result.data));
}

async function resetInstanceOptions(): Promise<{ count: number }> {
	const result = await client.POST("/v1/options/instances/reset");
	if (result.error !== undefined) {
		throw new Error("reset instance options failed");
	}

	return requireCount(unwrap(result.data));
}

type ProgressJob = components["schemas"]["ProgressJobDto"];
type QuotaSnapshot = components["schemas"]["QuotaDto"];

function requireProgressJob(data: unknown): ProgressJob {
	if (
		!isRecord(data) ||
		typeof data.value !== "number" ||
		typeof data.max !== "number" ||
		typeof data.streaming !== "boolean" ||
		typeof data.label !== "string"
	) {
		throw new Error("progress job payload invalid");
	}

	return {
		value: data.value,
		max: data.max,
		streaming: data.streaming,
		label: data.label,
	};
}

function requireQuota(data: unknown): QuotaSnapshot {
	if (
		!isRecord(data) ||
		typeof data.used !== "number" ||
		typeof data.max !== "number" ||
		typeof data.label !== "string"
	) {
		throw new Error("quota payload invalid");
	}

	return {
		used: data.used,
		max: data.max,
		label: data.label,
	};
}

async function getProgressJob(): Promise<ProgressJob> {
	const result = await client.GET("/v1/metrics/progress");
	if (result.error !== undefined) {
		throw new Error("get progress job failed");
	}

	return requireProgressJob(unwrap(result.data));
}

async function startProgressJob(): Promise<ProgressJob> {
	const result = await client.POST("/v1/metrics/progress/start");
	if (result.error !== undefined) {
		throw new Error("start progress job failed");
	}

	return requireProgressJob(unwrap(result.data));
}

async function stopProgressJob(): Promise<ProgressJob> {
	const result = await client.POST("/v1/metrics/progress/stop");
	if (result.error !== undefined) {
		throw new Error("stop progress job failed");
	}

	return requireProgressJob(unwrap(result.data));
}

async function resetProgressJob(): Promise<ProgressJob> {
	const result = await client.POST("/v1/metrics/progress/reset");
	if (result.error !== undefined) {
		throw new Error("reset progress job failed");
	}

	return requireProgressJob(unwrap(result.data));
}

async function getQuota(): Promise<QuotaSnapshot> {
	const result = await client.GET("/v1/metrics/quota");
	if (result.error !== undefined) {
		throw new Error("get quota failed");
	}

	return requireQuota(unwrap(result.data));
}

async function consumeQuota(amount: number): Promise<QuotaSnapshot> {
	const result = await client.POST("/v1/metrics/quota/consume", {
		body: { amount },
	});
	if (result.error !== undefined) {
		throw new Error("consume quota failed");
	}

	return requireQuota(unwrap(result.data));
}

async function releaseQuota(amount: number): Promise<QuotaSnapshot> {
	const result = await client.POST("/v1/metrics/quota/release", {
		body: { amount },
	});
	if (result.error !== undefined) {
		throw new Error("release quota failed");
	}

	return requireQuota(unwrap(result.data));
}

async function resetQuota(): Promise<QuotaSnapshot> {
	const result = await client.POST("/v1/metrics/quota/reset");
	if (result.error !== undefined) {
		throw new Error("reset quota failed");
	}

	return requireQuota(unwrap(result.data));
}

type CommandItem = components["schemas"]["CommandItemDto"];

function requireCommandItems(data: unknown): { items: CommandItem[] } {
	if (!isRecord(data) || !Array.isArray(data.items)) {
		throw new Error("commands list payload invalid");
	}

	const items: CommandItem[] = [];
	for (const item of data.items) {
		items.push(requireCommandItem(item));
	}

	return { items };
}

function requireCommandItem(data: unknown): CommandItem {
	if (!isRecord(data) || typeof data.id !== "string" || typeof data.label !== "string") {
		throw new Error("command payload invalid");
	}

	const item: CommandItem = {
		id: data.id,
		label: data.label,
	};

	if (typeof data.group === "string") {
		item.group = data.group;
	}

	if (Array.isArray(data.keywords)) {
		const keywords: string[] = [];
		for (const keyword of data.keywords) {
			if (typeof keyword !== "string") {
				throw new Error("command keywords payload invalid");
			}
			keywords.push(keyword);
		}
		item.keywords = keywords;
	}

	if (typeof data.disabled === "boolean") {
		item.disabled = data.disabled;
	}

	return item;
}

async function listCommands(q?: string): Promise<{ items: CommandItem[] }> {
	const result = await client.GET("/v1/commands", {
		params: { query: { q } },
	});
	if (result.error !== undefined) {
		throw new Error("list commands failed");
	}

	return requireCommandItems(unwrap(result.data));
}

async function addCommand(item: CommandItem): Promise<CommandItem> {
	const result = await client.POST("/v1/commands", {
		body: item,
	});
	if (result.error !== undefined) {
		throw new Error("add command failed");
	}

	return requireCommandItem(unwrap(result.data));
}

async function removeCommand(id: string): Promise<{ count: number }> {
	const result = await client.DELETE("/v1/commands/{id}", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("remove command failed");
	}

	return requireCount(unwrap(result.data));
}

async function resetCommands(): Promise<{ count: number }> {
	const result = await client.POST("/v1/commands/reset");
	if (result.error !== undefined) {
		throw new Error("reset commands failed");
	}

	return requireCount(unwrap(result.data));
}

type FlowFieldKind = "number" | "string";
type FlowNodeStatus = "idle" | "running" | "ok" | "failed";

interface FlowDemoField {
	id: string;
	label: string;
	kind: FlowFieldKind;
	direction: "in" | "out";
}

interface FlowDemoNode {
	id: string;
	label: string;
	fields: FlowDemoField[];
	config: Record<string, number | string>;
}

interface FlowDemoEdge {
	id: string;
	source: string;
	target: string;
	sourcePort: string;
	targetPort: string;
	valueKind: FlowFieldKind;
}

interface FlowDemoRun {
	runId: string | null;
	nodeStates: Record<string, FlowNodeStatus>;
	outputsByNode: Record<string, Record<string, string | number>>;
	message: string;
}

interface FlowDemoSnapshot {
	nodes: FlowDemoNode[];
	edges: FlowDemoEdge[];
	run: FlowDemoRun;
}

function isFlowFieldKind(value: unknown): value is FlowFieldKind {
	return value === "number" || value === "string";
}

function isFlowNodeStatus(value: unknown): value is FlowNodeStatus {
	return value === "idle" || value === "running" || value === "ok" || value === "failed";
}

function requireFlowField(data: unknown): FlowDemoField {
	if (
		!isRecord(data) ||
		typeof data.id !== "string" ||
		typeof data.label !== "string" ||
		!isFlowFieldKind(data.kind) ||
		(data.direction !== "in" && data.direction !== "out")
	) {
		throw new Error("flow field payload invalid");
	}

	return {
		id: data.id,
		label: data.label,
		kind: data.kind,
		direction: data.direction,
	};
}

function requireFlowNode(data: unknown): FlowDemoNode {
	if (
		!isRecord(data) ||
		typeof data.id !== "string" ||
		typeof data.label !== "string" ||
		!Array.isArray(data.fields) ||
		!isRecord(data.config)
	) {
		throw new Error("flow node payload invalid");
	}

	const fields: FlowDemoField[] = [];
	for (const field of data.fields) {
		fields.push(requireFlowField(field));
	}

	const config: Record<string, number | string> = {};
	for (const [key, value] of Object.entries(data.config)) {
		if (typeof value === "number" || typeof value === "string") {
			config[key] = value;
		}
	}

	return {
		id: data.id,
		label: data.label,
		fields,
		config,
	};
}

function requireFlowEdge(data: unknown): FlowDemoEdge {
	if (
		!isRecord(data) ||
		typeof data.id !== "string" ||
		typeof data.source !== "string" ||
		typeof data.target !== "string" ||
		typeof data.sourcePort !== "string" ||
		typeof data.targetPort !== "string" ||
		!isFlowFieldKind(data.valueKind)
	) {
		throw new Error("flow edge payload invalid");
	}

	return {
		id: data.id,
		source: data.source,
		target: data.target,
		sourcePort: data.sourcePort,
		targetPort: data.targetPort,
		valueKind: data.valueKind,
	};
}

function requireFlowRun(data: unknown): FlowDemoRun {
	if (
		!isRecord(data) ||
		(data.runId !== null && typeof data.runId !== "string") ||
		!isRecord(data.nodeStates) ||
		!isRecord(data.outputsByNode) ||
		typeof data.message !== "string"
	) {
		throw new Error("flow run payload invalid");
	}

	const nodeStates: Record<string, FlowNodeStatus> = {};
	for (const [id, status] of Object.entries(data.nodeStates)) {
		if (isFlowNodeStatus(status)) {
			nodeStates[id] = status;
		}
	}

	const outputsByNode: Record<string, Record<string, string | number>> = {};
	for (const [id, fields] of Object.entries(data.outputsByNode)) {
		if (!isRecord(fields)) {
			continue;
		}
		const mapped: Record<string, string | number> = {};
		for (const [fieldId, value] of Object.entries(fields)) {
			if (typeof value === "string" || typeof value === "number") {
				mapped[fieldId] = value;
			}
		}
		outputsByNode[id] = mapped;
	}

	return {
		runId: data.runId,
		nodeStates,
		outputsByNode,
		message: data.message,
	};
}

function requireFlowSnapshot(data: unknown): FlowDemoSnapshot {
	if (!isRecord(data) || !Array.isArray(data.nodes) || !Array.isArray(data.edges) || !isRecord(data.run)) {
		throw new Error("flow snapshot payload invalid");
	}

	const nodes: FlowDemoNode[] = [];
	for (const node of data.nodes) {
		nodes.push(requireFlowNode(node));
	}

	const edges: FlowDemoEdge[] = [];
	for (const edge of data.edges) {
		edges.push(requireFlowEdge(edge));
	}

	return {
		nodes,
		edges,
		run: requireFlowRun(data.run),
	};
}

async function getFlowDemo(): Promise<FlowDemoSnapshot> {
	const result = await client.GET("/v1/flows/demo");
	if (result.error !== undefined) {
		throw new Error("get flow demo failed");
	}

	return requireFlowSnapshot(unwrap(result.data));
}

async function resetFlowDemo(): Promise<FlowDemoSnapshot> {
	const result = await client.POST("/v1/flows/demo/reset");
	if (result.error !== undefined) {
		throw new Error("reset flow demo failed");
	}

	return requireFlowSnapshot(unwrap(result.data));
}

async function triggerFlowDemo(amount: number, address: string): Promise<FlowDemoSnapshot> {
	const result = await client.POST("/v1/flows/demo/trigger", {
		body: { amount, address },
	});
	if (result.error !== undefined) {
		throw new Error("trigger flow demo failed");
	}

	return requireFlowSnapshot(unwrap(result.data));
}

async function patchFlowNodeConfig(id: string, config: Record<string, number | string>): Promise<FlowDemoSnapshot> {
	const result = await client.PATCH("/v1/flows/demo/nodes/{id}/config", {
		params: { path: { id } },
		body: { config },
	});
	if (result.error !== undefined) {
		throw new Error("patch flow node config failed");
	}

	return requireFlowSnapshot(unwrap(result.data));
}

export type {
	CommandItem,
	FlowDemoEdge,
	FlowDemoField,
	FlowDemoNode,
	FlowDemoRun,
	FlowDemoSnapshot,
	FlowFieldKind,
	FlowNodeStatus,
	InstanceOption,
	ProgressJob,
	QuotaSnapshot,
};
export {
	addCommand,
	addInstanceOption,
	addTableRows,
	client,
	consumeQuota,
	createExamplesApiClient,
	getFlowDemo,
	getHealth,
	getLogStreamStatus,
	getProgressJob,
	getQuota,
	getTableStreamStatus,
	listCommands,
	listInstanceOptions,
	listTableRows,
	patchFlowNodeConfig,
	releaseQuota,
	removeCommand,
	removeInstanceOption,
	removeTableRows,
	resetCommands,
	resetFlowDemo,
	resetInstanceOptions,
	resetLogStream,
	resetProgressJob,
	resetQuota,
	resetTable,
	startLogStream,
	startProgressJob,
	startTableStream,
	stopLogStream,
	stopProgressJob,
	stopTableStream,
	triggerFlowDemo,
};
