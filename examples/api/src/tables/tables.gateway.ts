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
	TableServerMessage,
	TableSubscribeMessage,
} from "./table-types.js";
import { TablesService } from "./tables.service.js";

type WsRawData = Buffer | ArrayBuffer | Buffer[] | string;

const DEFAULT_TABLE_ID = "inventory";

interface ClientState {
	socket: WebSocket;
	tableId: string;
	unsubscribe: () => void;
}

@WebSocketGateway({ path: "/v1/tables" })
export class TablesGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger = new Logger(TablesGateway.name);
	private readonly clients = new Map<WebSocket, ClientState>();

	@WebSocketServer()
	server!: WsServer;

	constructor(
		@Inject(TablesService) private readonly tables: TablesService,
	) {}

	handleConnection(client: WebSocket, _request: IncomingMessage): void {
		const tableId = DEFAULT_TABLE_ID;
		const unsubscribe = this.tables.subscribe((event) => {
			const state = this.clients.get(client);
			if (state === undefined) {
				return;
			}

			if (event.tableId !== state.tableId) {
				return;
			}
			if (event.type === "patch") {
				this.send(client, {
					type: "patch",
					transaction: event.transaction,
				});
				return;
			}

			this.send(client, {
				type: "snapshot",
				rows: event.rows,
			});
		});

		this.clients.set(client, { socket: client, tableId, unsubscribe });

		client.on("message", (raw: WsRawData) => {
			this.onMessage(client, raw);
		});

		this.sendSnapshot(client, tableId);
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

		let tableId = DEFAULT_TABLE_ID;
		if (parsed.tableId !== undefined && parsed.tableId.length > 0) {
			tableId = parsed.tableId;
		}

		const state = this.clients.get(client);
		if (state !== undefined) {
			state.tableId = tableId;
		}

		this.sendSnapshot(client, tableId);
	}

	private sendSnapshot(client: WebSocket, tableId: string): void {
		const rows = this.tables.getSnapshot(tableId);
		this.send(client, { type: "snapshot", rows });
	}

	private send(client: WebSocket, message: TableServerMessage): void {
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

function isSubscribeMessage(value: unknown): value is TableSubscribeMessage {
	if (value === null || typeof value !== "object") {
		return false;
	}
	if (!("type" in value)) {
		return false;
	}

	return value.type === "subscribe";
}
