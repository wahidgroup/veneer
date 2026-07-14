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
		expect(await readBody(response)).toEqual({
			data: [
				expect.objectContaining({ id: expect.any(String) }),
				expect.objectContaining({ id: expect.any(String) }),
				expect.objectContaining({ id: expect.any(String) }),
			],
			meta: {
				timestamp: expect.any(String),
				pagination: {
					page: 1,
					limit: 10,
					total: 3,
					totalPages: 1,
				},
			},
		});

		response = await fetch(`${baseUrl}/v1/tables/inventory/rows`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				rows: [{ id: "row-4", name: "edge-c", status: "ready" }],
			}),
		});
		expect(response.status).toBe(201);

		response = await fetch(
			`${baseUrl}/v1/tables/inventory?page=1&limit=10`,
		);
		expect(await readBody(response)).toEqual({
			data: [
				expect.objectContaining({ id: expect.any(String) }),
				expect.objectContaining({ id: expect.any(String) }),
				expect.objectContaining({ id: expect.any(String) }),
				expect.objectContaining({ id: "row-4" }),
			],
			meta: {
				timestamp: expect.any(String),
				pagination: {
					page: 1,
					limit: 10,
					total: 4,
					totalPages: 1,
				},
			},
		});
	});
});
