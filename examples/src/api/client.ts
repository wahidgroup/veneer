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
	if (
		!isRecord(data) ||
		typeof data.streaming !== "boolean" ||
		typeof data.count !== "number"
	) {
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

async function addTableRows(
	id: string,
	rows: TableRow[],
): Promise<{ count: number }> {
	const result = await client.POST("/v1/tables/{id}/rows", {
		params: { path: { id } },
		body: { rows },
	});
	if (result.error !== undefined) {
		throw new Error("add table rows failed");
	}

	return requireCount(unwrap(result.data));
}

async function removeTableRows(
	id: string,
	ids: string[],
): Promise<{ count: number }> {
	const result = await client.POST("/v1/tables/{id}/rows/remove", {
		params: { path: { id } },
		body: { ids },
	});
	if (result.error !== undefined) {
		throw new Error("remove table rows failed");
	}

	return requireCount(unwrap(result.data));
}

async function resetTable(
	id: string,
): Promise<{ streaming: boolean; count: number }> {
	const result = await client.POST("/v1/tables/{id}/reset", {
		params: { path: { id } },
	});
	if (result.error !== undefined) {
		throw new Error("reset table failed");
	}

	return requireReset(unwrap(result.data));
}

async function getTableStreamStatus(
	id: string,
): Promise<{ streaming: boolean }> {
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

export {
	addTableRows,
	client,
	createExamplesApiClient,
	getHealth,
	getLogStreamStatus,
	getTableStreamStatus,
	listTableRows,
	removeTableRows,
	resetLogStream,
	resetTable,
	startLogStream,
	startTableStream,
	stopLogStream,
	stopTableStream,
};
