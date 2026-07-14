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
});
