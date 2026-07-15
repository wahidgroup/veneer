import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";

import { createApp } from "./create-app.js";

type WsRawData = Buffer | ArrayBuffer | Buffer[] | string;

function rawDataToString(raw: WsRawData): string {
	if (typeof raw === "string") {
		return raw;
	}
	if (Buffer.isBuffer(raw)) {
		return raw.toString("utf8");
	}
	if (Array.isArray(raw)) {
		return Buffer.concat(raw).toString("utf8");
	}

	const text = Buffer.from(raw).toString("utf8");
	return text;
}

async function readBody(response: Response): Promise<unknown> {
	const body = await response.json();
	return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readEnvelopeData(body: unknown): Record<string, unknown> {
	if (!isRecord(body) || !isRecord(body.data)) {
		throw new Error("expected data envelope");
	}
	return body.data;
}

function readFlowRun(body: unknown): Record<string, unknown> {
	const data = readEnvelopeData(body);
	if (!isRecord(data.run)) {
		throw new Error("expected run payload");
	}
	return data.run;
}

function readOutputsByNode(
	run: Record<string, unknown>,
): Record<string, Record<string, unknown>> {
	const outputsByNode = run.outputsByNode;
	if (!isRecord(outputsByNode)) {
		throw new Error("expected outputsByNode");
	}
	const narrowed: Record<string, Record<string, unknown>> = {};
	for (const [nodeId, outputs] of Object.entries(outputsByNode)) {
		if (!isRecord(outputs)) {
			throw new Error("expected node outputs");
		}
		narrowed[nodeId] = outputs;
	}
	return narrowed;
}

function readNodeStates(run: Record<string, unknown>): Record<string, unknown> {
	const nodeStates = run.nodeStates;
	if (!isRecord(nodeStates)) {
		throw new Error("expected nodeStates");
	}
	return nodeStates;
}

describe("examples api", () => {
	let app: NestExpressApplication;
	let baseUrl: string;

	beforeAll(async () => {
		const created = await createApp();
		app = created.app;
		await app.listen(0);
		baseUrl = await app.getUrl();
	});

	afterAll(async () => {
		await app.close();
	});

	it("returns health envelope", async () => {
		const response = await fetch(`${baseUrl}/health`);
		expect(response.status).toBe(200);
		expect(await readBody(response)).toEqual({
			data: { status: "ok" },
			meta: {
				timestamp: expect.any(String),
			},
		});
	});

	it("starts stops and resets the log stream", async () => {
		let response = await fetch(`${baseUrl}/v1/logs/stream`);
		expect(response.status).toBe(200);
		expect(await readBody(response)).toEqual({
			data: { streaming: false },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/logs/stream/start`, {
			method: "POST",
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: { streaming: true },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/logs/stream`);
		expect(await readBody(response)).toEqual({
			data: { streaming: true },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/logs/stream/stop`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: { streaming: false },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/logs/stream/reset`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: { streaming: false, count: 3 },
			meta: {
				timestamp: expect.any(String),
			},
		});
	});

	it("streams snapshot and line events over websocket", async () => {
		await fetch(`${baseUrl}/v1/logs/stream/reset`, { method: "POST" });

		const wsUrl = baseUrl.replace(/^http/, "ws");
		const ws = new WebSocket(`${wsUrl}/v1/logs`);
		const messages: unknown[] = [];

		await new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error("ws timeout"));
			}, 5000);

			ws.on("open", () => {
				ws.send(JSON.stringify({ type: "subscribe", queries: [] }));
			});

			ws.on("message", (raw: WsRawData) => {
				messages.push(JSON.parse(rawDataToString(raw)));
				clearTimeout(timer);
				resolve();
			});

			ws.on("error", reject);
		});

		expect(messages[0]).toEqual({
			type: "snapshot",
			lines: [
				expect.objectContaining({ id: "seed-1" }),
				expect.objectContaining({ id: "seed-2" }),
				expect.objectContaining({ id: "seed-3" }),
			],
		});

		await fetch(`${baseUrl}/v1/logs/stream/start`, { method: "POST" });

		ws.on("message", (raw: WsRawData) => {
			messages.push(JSON.parse(rawDataToString(raw)));
		});

		await expect
			.poll(() => {
				return messages;
			})
			.toEqual(
				expect.arrayContaining([
					expect.objectContaining({ type: "line" }),
				]),
			);

		ws.close();
		await fetch(`${baseUrl}/v1/logs/stream/stop`, { method: "POST" });
	});

	it("lists and mutates table rows", async () => {
		await fetch(`${baseUrl}/v1/tables/inventory/reset`, { method: "POST" });

		let response = await fetch(
			`${baseUrl}/v1/tables/inventory?page=1&limit=10`,
		);
		expect(response.status).toBe(200);

		const listed = await readBody(response);
		expect(listed).toEqual({
			data: expect.arrayContaining([
				expect.objectContaining({
					id: "1",
					name: "node-001",
					region: expect.any(String),
					status: expect.any(String),
					cpu: expect.any(Number),
				}),
			]),
			meta: {
				timestamp: expect.any(String),
				pagination: {
					page: 1,
					limit: 10,
					total: 87,
					totalPages: 9,
				},
			},
		});

		if (
			listed === null ||
			typeof listed !== "object" ||
			!("data" in listed) ||
			!Array.isArray(listed.data)
		) {
			throw new Error("expected list envelope");
		}

		expect(listed.data).toHaveLength(10);

		response = await fetch(`${baseUrl}/v1/tables/inventory/rows`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				rows: [
					{
						id: "row-extra",
						name: "edge-c",
						region: "us-east-1",
						status: "healthy",
						cpu: 12,
					},
				],
			}),
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/tables/inventory?page=1&limit=10&sortBy=name&sortDesc=true`,
		);
		const afterAdd = await readBody(response);
		expect(afterAdd).toEqual({
			data: expect.any(Array),
			meta: {
				timestamp: expect.any(String),
				pagination: {
					page: 1,
					limit: 10,
					total: 88,
					totalPages: 9,
				},
			},
		});

		response = await fetch(
			`${baseUrl}/v1/tables/inventory?page=1&limit=10&queries=edge-c`,
		);
		expect(await readBody(response)).toEqual({
			data: [
				expect.objectContaining({
					id: "row-extra",
					name: "edge-c",
				}),
			],
			meta: {
				timestamp: expect.any(String),
				pagination: {
					page: 1,
					limit: 10,
					total: 1,
					totalPages: 1,
				},
			},
		});

		response = await fetch(`${baseUrl}/v1/tables/inventory/rows/remove`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ ids: ["row-extra"] }),
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/tables/inventory?page=1&limit=10&filterRegion=us-east-1`,
		);
		const filtered = await readBody(response);
		expect(filtered).toEqual({
			data: expect.any(Array),
			meta: {
				timestamp: expect.any(String),
				pagination: expect.objectContaining({
					page: 1,
					limit: 10,
					total: expect.any(Number),
				}),
			},
		});
	});

	it("streams table snapshot and patch events over websocket", async () => {
		await fetch(`${baseUrl}/v1/tables/inventory/reset`, { method: "POST" });
		await fetch(`${baseUrl}/v1/tables/inventory/stream/stop`, {
			method: "POST",
		});

		const wsUrl = baseUrl.replace(/^http/, "ws");
		const ws = new WebSocket(`${wsUrl}/v1/tables`);
		const messages: unknown[] = [];

		await new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error("tables ws timeout"));
			}, 5000);

			ws.on("open", () => {
				ws.send(
					JSON.stringify({ type: "subscribe", tableId: "inventory" }),
				);
			});

			ws.on("message", (raw: WsRawData) => {
				messages.push(JSON.parse(rawDataToString(raw)));
				clearTimeout(timer);
				resolve();
			});

			ws.on("error", reject);
		});

		expect(messages[0]).toEqual({
			type: "snapshot",
			rows: expect.arrayContaining([
				expect.objectContaining({ id: "1" }),
			]),
		});
		const first = messages[0];
		if (
			first === null ||
			typeof first !== "object" ||
			!("rows" in first) ||
			!Array.isArray(first.rows)
		) {
			throw new Error("expected snapshot");
		}
		expect(first.rows).toHaveLength(87);

		await fetch(`${baseUrl}/v1/tables/inventory/stream/start`, {
			method: "POST",
		});

		ws.on("message", (raw: WsRawData) => {
			messages.push(JSON.parse(rawDataToString(raw)));
		});

		await expect
			.poll(
				() => {
					return messages.some((message) => {
						if (message === null || typeof message !== "object") {
							return false;
						}

						return "type" in message && message.type === "patch";
					});
				},
				{ timeout: 5000, interval: 200 },
			)
			.toBe(true);

		ws.close();

		await fetch(`${baseUrl}/v1/tables/inventory/stream/stop`, {
			method: "POST",
		});
		await fetch(`${baseUrl}/v1/tables/inventory/reset`, { method: "POST" });
	});

	it("lists filters adds removes and resets instance options", async () => {
		let response = await fetch(`${baseUrl}/v1/options/instances/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: { count: 8 },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/options/instances`);
		expect(response.status).toBe(200);

		const listed = await readBody(response);
		expect(listed).toEqual({
			data: {
				items: expect.arrayContaining([
					expect.objectContaining({ value: "t3.micro" }),
				]),
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		if (
			listed === null ||
			typeof listed !== "object" ||
			!("data" in listed) ||
			listed.data === null ||
			typeof listed.data !== "object" ||
			!("items" in listed.data) ||
			!Array.isArray(listed.data.items)
		) {
			throw new Error("expected options list");
		}
		expect(listed.data.items).toHaveLength(8);

		response = await fetch(`${baseUrl}/v1/options/instances?q=c6i`);
		const filtered = await readBody(response);
		if (
			filtered === null ||
			typeof filtered !== "object" ||
			!("data" in filtered) ||
			filtered.data === null ||
			typeof filtered.data !== "object" ||
			!("items" in filtered.data) ||
			!Array.isArray(filtered.data.items)
		) {
			throw new Error("expected filtered options");
		}
		expect(filtered.data.items).toHaveLength(2);

		response = await fetch(`${baseUrl}/v1/options/instances`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				value: "custom-1",
				label: "custom-1 - demo",
			}),
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: { value: "custom-1", label: "custom-1 - demo" },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/options/instances`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				value: "custom-1",
				label: "custom-1 - demo",
			}),
		});
		expect(response.status).toBe(409);

		response = await fetch(
			`${baseUrl}/v1/options/instances/${encodeURIComponent("custom-1")}`,
			{ method: "DELETE" },
		);
		expect(response.status).toBe(200);
		expect(await readBody(response)).toEqual({
			data: { count: 8 },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(
			`${baseUrl}/v1/options/instances/${encodeURIComponent("missing")}`,
			{ method: "DELETE" },
		);
		expect(response.status).toBe(404);

		response = await fetch(`${baseUrl}/v1/options/instances`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				value: "custom-2",
				label: "custom-2 - demo",
			}),
		});
		expect(response.status).toBe(201);

		response = await fetch(`${baseUrl}/v1/options/instances/reset`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: { count: 8 },
			meta: {
				timestamp: expect.any(String),
			},
		});
	});

	it("runs progress job and quota mutations", async () => {
		let response = await fetch(`${baseUrl}/v1/metrics/progress`);
		expect(response.status).toBe(200);
		expect(await readBody(response)).toEqual({
			data: {
				value: 0,
				max: 100,
				streaming: false,
				label: "Deploy job",
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/metrics/progress/start`, {
			method: "POST",
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: {
				value: 0,
				max: 100,
				streaming: true,
				label: "Deploy job",
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		await new Promise((resolve) => {
			setTimeout(resolve, 500);
		});

		response = await fetch(`${baseUrl}/v1/metrics/progress`);
		const mid = await readBody(response);
		expect(mid).toEqual({
			data: {
				value: expect.any(Number),
				max: 100,
				streaming: expect.any(Boolean),
				label: "Deploy job",
			},
			meta: {
				timestamp: expect.any(String),
			},
		});
		if (
			typeof mid === "object" &&
			mid !== null &&
			"data" in mid &&
			typeof mid.data === "object" &&
			mid.data !== null &&
			"value" in mid.data
		) {
			expect(mid.data.value).toBeGreaterThan(0);
		}

		response = await fetch(`${baseUrl}/v1/metrics/progress/stop`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(`${baseUrl}/v1/metrics/progress/reset`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: {
				value: 0,
				max: 100,
				streaming: false,
				label: "Deploy job",
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/metrics/quota`);
		expect(await readBody(response)).toEqual({
			data: { used: 42, max: 100, label: "Stacks" },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/metrics/quota/consume`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 10 }),
		});
		expect(await readBody(response)).toEqual({
			data: { used: 52, max: 100, label: "Stacks" },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/metrics/quota/release`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 5 }),
		});
		expect(await readBody(response)).toEqual({
			data: { used: 47, max: 100, label: "Stacks" },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/metrics/quota/reset`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: { used: 42, max: 100, label: "Stacks" },
			meta: {
				timestamp: expect.any(String),
			},
		});
	});

	it("lists filters adds removes and resets commands", async () => {
		let response = await fetch(`${baseUrl}/v1/commands/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: { count: 6 },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/commands`);
		expect(response.status).toBe(200);

		const listed = await readBody(response);
		expect(listed).toEqual({
			data: {
				items: expect.arrayContaining([
					expect.objectContaining({
						id: "stacks",
						label: "Go to stacks",
					}),
				]),
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/commands?q=inventory`);
		expect(await readBody(response)).toEqual({
			data: {
				items: [
					{
						id: "stacks",
						label: "Go to stacks",
						group: "Navigate",
						keywords: ["inventory"],
					},
				],
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(`${baseUrl}/v1/commands`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				id: "custom-cmd",
				label: "Custom command",
				group: "Actions",
			}),
		});
		expect(response.status).toBe(201);
		expect(await readBody(response)).toEqual({
			data: {
				id: "custom-cmd",
				label: "Custom command",
				group: "Actions",
			},
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(
			`${baseUrl}/v1/commands/${encodeURIComponent("custom-cmd")}`,
			{ method: "DELETE" },
		);
		expect(response.status).toBe(200);
		expect(await readBody(response)).toEqual({
			data: { count: 6 },
			meta: {
				timestamp: expect.any(String),
			},
		});

		response = await fetch(
			`${baseUrl}/v1/commands/${encodeURIComponent("missing")}`,
			{ method: "DELETE" },
		);
		expect(response.status).toBe(404);

		response = await fetch(`${baseUrl}/v1/commands/reset`, {
			method: "POST",
		});
		expect(await readBody(response)).toEqual({
			data: { count: 6 },
			meta: {
				timestamp: expect.any(String),
			},
		});
	});

	it("runs the deposit split flow and respects minAmount gate", async () => {
		let response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		const resetData = readEnvelopeData(await readBody(response));
		expect(Array.isArray(resetData.nodes)).toBe(true);
		expect(Array.isArray(resetData.edges)).toBe(true);
		if (
			!Array.isArray(resetData.nodes) ||
			!Array.isArray(resetData.edges)
		) {
			throw new Error("expected nodes and edges arrays");
		}

		expect(resetData.nodes).toHaveLength(5);
		expect(
			resetData.edges.every((edge) => {
				if (!isRecord(edge)) {
					return false;
				}
				return (
					edge.valueKind === "number" || edge.valueKind === "string"
				);
			}),
		).toBe(true);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 50 } }),
			},
		);
		expect(response.status).toBe(200);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 10, address: "bc1qholder" }),
		});
		expect(response.status).toBe(201);

		let run = readFlowRun(await readBody(response));
		let nodeStates = readNodeStates(run);
		let outputsByNode = readOutputsByNode(run);
		expect(nodeStates["split-half"]).toBe("failed");
		expect(nodeStates["send-a"]).toBe("idle");
		expect(outputsByNode["account-listener"]?.amount).toBe(10);

		response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 50 } }),
			},
		);
		expect(response.status).toBe(200);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 101, address: "bc1qholder" }),
		});
		expect(response.status).toBe(201);

		run = readFlowRun(await readBody(response));
		nodeStates = readNodeStates(run);
		outputsByNode = readOutputsByNode(run);
		expect(nodeStates["split-half"]).toBe("ok");
		expect(outputsByNode["split-half"]?.halfA).toBe(50);
		expect(outputsByNode["split-half"]?.halfB).toBe(50);
		expect(outputsByNode["split-half"]?.dust).toBe(1);
		expect(outputsByNode["split-half"]?.addressOut).toBe("bc1qholder");
		expect(outputsByNode["return-dust"]?.address).toBe("bc1qholder");

		response = await fetch(`${baseUrl}/v1/flows/demo/run`);
		expect(response.status).toBe(200);
	});

	it("accumulates deposit amounts across triggers until reset", async () => {
		let response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 0 } }),
			},
		);
		expect(response.status).toBe(200);

		for (let i = 0; i < 10; i += 1) {
			response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ amount: 1, address: "bc1qholder" }),
			});
			expect(response.status).toBe(201);
		}

		const run = readFlowRun(await readBody(response));
		const outputsByNode = readOutputsByNode(run);
		const nodeStates = readNodeStates(run);
		expect(outputsByNode["account-listener"]?.amount).toBe(10);
		expect(outputsByNode["split-half"]?.amount).toBe(10);
		expect(outputsByNode["split-half"]?.halfA).toBe(5);
		expect(outputsByNode["split-half"]?.halfB).toBe(5);
		expect(outputsByNode["split-half"]?.dust).toBe(0);
		expect(nodeStates["split-half"]).toBe("ok");
	});

	it("rejects invalid trigger and config payloads", async () => {
		let response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: -1, address: "bc1qholder" }),
		});
		expect(response.status).toBe(400);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 1, address: "" }),
		});
		expect(response.status).toBe(400);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/missing-node/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 1 } }),
			},
		);
		expect(response.status).toBe(400);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: -1 } }),
			},
		);
		expect(response.status).toBe(400);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					config: { minAmount: 5, extra: "nope" },
				}),
			},
		);
		expect(response.status).toBe(400);
	});

	it("resets the cumulative deposit counter", async () => {
		let response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 0 } }),
			},
		);
		expect(response.status).toBe(200);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 3, address: "bc1qholder" }),
		});
		expect(response.status).toBe(201);

		response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 0 } }),
			},
		);
		expect(response.status).toBe(200);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 2, address: "bc1qholder" }),
		});
		expect(response.status).toBe(201);

		const outputsByNode = readOutputsByNode(
			readFlowRun(await readBody(response)),
		);
		expect(outputsByNode["account-listener"]?.amount).toBe(2);
	});

	it("returns a full run body from GET /run after a trigger", async () => {
		let response = await fetch(`${baseUrl}/v1/flows/demo/reset`, {
			method: "POST",
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/flows/demo/nodes/split-half/config`,
			{
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ config: { minAmount: 0 } }),
			},
		);
		expect(response.status).toBe(200);

		response = await fetch(`${baseUrl}/v1/flows/demo/trigger`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ amount: 4, address: "bc1qholder" }),
		});
		expect(response.status).toBe(201);

		response = await fetch(`${baseUrl}/v1/flows/demo/run`);
		expect(response.status).toBe(200);

		const body = readEnvelopeData(await readBody(response));
		const nodeStates = readNodeStates(body);
		const outputsByNode = readOutputsByNode(body);
		expect(body.runId).toMatch(/^run-/);
		expect(nodeStates["account-listener"]).toBe("ok");
		expect(outputsByNode["account-listener"]?.amount).toBe(4);
		expect(typeof body.message).toBe("string");
	});
});
