import type { IncomingMessage } from "node:http";
import type { WebSocketServer as WsServer } from "ws";
import { Inject, Logger } from "@nestjs/common";
import { WebSocket } from "ws";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";

import type {
	LogFilter,
	LogServerMessage,
	LogSubscribeMessage,
} from "./log-types.js";
import { matchLogLine } from "./log-types.js";
import { LogsService } from "./logs.service.js";

type WsRawData = Buffer | ArrayBuffer | Buffer[] | string;

interface ClientState {
	socket: WebSocket;
	filter: LogFilter;
	unsubscribe: () => void;
}

@WebSocketGateway({ path: "/v1/logs" })
export class LogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(LogsGateway.name);
	private readonly clients = new Map<WebSocket, ClientState>();

	@WebSocketServer()
	server!: WsServer;

	constructor(@Inject(LogsService) private readonly logs: LogsService) {}

	handleConnection(client: WebSocket, _request: IncomingMessage): void {
		const filter: LogFilter = {};
		const unsubscribe = this.logs.subscribeLines((line) => {
			const state = this.clients.get(client);
			if (state === undefined) {
				return;
			}

			if (!matchLogLine(line, state.filter)) {
				return;
			}

			this.send(client, { type: "line", line });
		});

		this.clients.set(client, { socket: client, filter, unsubscribe });

		client.on("message", (raw: WsRawData) => {
			this.onMessage(client, raw);
		});

		this.sendSnapshot(client, filter);
	}

	handleDisconnect(client: WebSocket): void {
		const state = this.clients.get(client);
		if (state !== undefined) {
			state.unsubscribe();
			this.clients.delete(client);
		}
	}

	private onMessage(client: WebSocket, raw: WsRawData): void {
		let parsed: unknown;
		try {
			parsed = JSON.parse(rawDataToString(raw));
		} catch {
			client.close(1003, "invalid json");
			return;
		}

		if (!isSubscribeMessage(parsed)) {
			if (
				parsed === null ||
				typeof parsed !== "object" ||
				!("type" in parsed)
			) {
				client.close(1003, "invalid message");
			}

			return;
		}

		const filter: LogFilter = {
			levels: parsed.levels,
			queries: parsed.queries,
			from: parsed.from,
			to: parsed.to,
		};

		const state = this.clients.get(client);
		if (state !== undefined) {
			state.filter = filter;
		}

		this.sendSnapshot(client, filter);
	}

	private sendSnapshot(client: WebSocket, filter: LogFilter): void {
		const lines = this.logs.filterLines(filter);
		this.send(client, { type: "snapshot", lines });
	}

	private send(client: WebSocket, message: LogServerMessage): void {
		if (client.readyState !== WebSocket.OPEN) {
			return;
		}

		try {
			client.send(JSON.stringify(message));
		} catch (error: unknown) {
			let detail = "unknown error";
			if (error instanceof Error) {
				detail = error.message;
			}

			this.logger.warn(`ws send failed: ${detail}`);
		}
	}
}

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

function isSubscribeMessage(value: unknown): value is LogSubscribeMessage {
	if (value === null || typeof value !== "object") {
		return false;
	}
	if (!("type" in value)) {
		return false;
	}

	return value.type === "subscribe";
}
