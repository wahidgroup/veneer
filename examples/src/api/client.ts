import createClient from "openapi-fetch";

import type { paths } from "./types/api.js";
import { unwrap, unwrapPaginated } from "./unwrap.js";

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

function requireTableRows(data: {
	items: unknown[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}): {
	items: Array<{ id: string; name: string; status: string }>;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
} {
	const items: Array<{ id: string; name: string; status: string }> = [];
	for (const item of data.items) {
		if (
			!isRecord(item) ||
			typeof item.id !== "string" ||
			typeof item.name !== "string" ||
			typeof item.status !== "string"
		) {
			throw new Error("table row payload invalid");
		}

		items.push({
			id: item.id,
			name: item.name,
			status: item.status,
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
	query?: { page?: number; limit?: number; search?: string },
): Promise<{
	items: Array<{ id: string; name: string; status: string }>;
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

export {
	client,
	createExamplesApiClient,
	getHealth,
	getLogStreamStatus,
	listTableRows,
	resetLogStream,
	startLogStream,
	stopLogStream,
};
