export type TableRowStatus = "healthy" | "degraded" | "down";

export interface TableRow {
	id: string;
	name: string;
	region: string;
	status: TableRowStatus;
	cpu: number;
}

export interface TableRowTransaction {
	add?: TableRow[];
	update?: TableRow[];
	remove?: string[];
}

export interface TableSubscribeMessage {
	type: "subscribe";
	tableId?: string;
}

export interface TableSnapshotMessage {
	type: "snapshot";
	rows: TableRow[];
}

export interface TablePatchMessage {
	type: "patch";
	transaction: TableRowTransaction;
}

export type TableServerMessage = TableSnapshotMessage | TablePatchMessage;

export type TablesConnectionState = "connecting" | "open" | "closed" | "error";

interface ConnectTablesOptions {
	onMessage: (message: TableServerMessage) => void;
	onState?: (state: TablesConnectionState) => void;
	url?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

function isTableStatus(value: unknown): value is TableRowStatus {
	return value === "healthy" || value === "degraded" || value === "down";
}

function isTableRow(value: unknown): value is TableRow {
	if (!isRecord(value)) {
		return false;
	}
	if (
		typeof value.id !== "string" ||
		typeof value.name !== "string" ||
		typeof value.region !== "string" ||
		!isTableStatus(value.status) ||
		typeof value.cpu !== "number"
	) {
		return false;
	}

	return true;
}

function isTransaction(value: unknown): value is TableRowTransaction {
	if (!isRecord(value)) {
		return false;
	}

	if (value.add !== undefined) {
		if (!Array.isArray(value.add)) {
			return false;
		}

		for (const row of value.add) {
			if (!isTableRow(row)) {
				return false;
			}
		}
	}

	if (value.update !== undefined) {
		if (!Array.isArray(value.update)) {
			return false;
		}

		for (const row of value.update) {
			if (!isTableRow(row)) {
				return false;
			}
		}
	}

	if (value.remove !== undefined) {
		if (!Array.isArray(value.remove)) {
			return false;
		}

		for (const id of value.remove) {
			if (typeof id !== "string") {
				return false;
			}
		}
	}

	return true;
}

function isServerMessage(value: unknown): value is TableServerMessage {
	if (!isRecord(value) || typeof value.type !== "string") {
		return false;
	}

	if (value.type === "snapshot") {
		if (!Array.isArray(value.rows)) {
			return false;
		}

		for (const row of value.rows) {
			if (!isTableRow(row)) {
				return false;
			}
		}

		return true;
	}

	if (value.type === "patch") {
		return isTransaction(value.transaction);
	}

	return false;
}

function connectTables(options: ConnectTablesOptions): {
	sendSubscribe: (message: Omit<TableSubscribeMessage, "type">) => void;
	close: () => void;
} {
	let scheme = "ws";
	if (window.location.protocol === "https:") {
		scheme = "wss";
	}

	let url = `${scheme}://${window.location.host}/v1/tables`;
	if (options.url !== undefined) {
		url = options.url;
	}

	let socket: WebSocket | null = null;
	let closedByUser = false;
	let generation = 0;
	let attempt = 0;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSubscribe: Omit<TableSubscribeMessage, "type"> | null = null;

	function clearReconnect(): void {
		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function scheduleReconnect(): void {
		if (closedByUser) {
			return;
		}

		clearReconnect();

		const delayMs = Math.min(8_000, 500 * 2 ** attempt);

		attempt += 1;
		reconnectTimer = setTimeout(() => {
			if (closedByUser) {
				return;
			}

			open();
		}, delayMs);
	}

	function discardSocket(ws: WebSocket, reason: string): void {
		if (
			ws.readyState === WebSocket.CONNECTING ||
			ws.readyState === WebSocket.OPEN
		) {
			ws.close(1000, reason);
		}
	}

	function open(): void {
		if (closedByUser) {
			return;
		}

		const current = generation + 1;
		generation = current;

		if (socket !== null) {
			const previous = socket;
			socket = null;
			discardSocket(previous, "reconnect");
		}

		options.onState?.("connecting");

		const ws = new WebSocket(url);
		socket = ws;

		ws.addEventListener("open", () => {
			if (current !== generation || closedByUser) {
				return;
			}

			attempt = 0;
			options.onState?.("open");

			if (lastSubscribe === null) {
				return;
			}

			const payload: TableSubscribeMessage = {
				type: "subscribe",
				...lastSubscribe,
			};

			ws.send(JSON.stringify(payload));
		});

		ws.addEventListener("close", () => {
			if (current !== generation) {
				return;
			}

			if (socket === ws) {
				socket = null;
			}

			options.onState?.("closed");
			scheduleReconnect();
		});

		ws.addEventListener("error", () => {
			if (current !== generation || closedByUser) {
				return;
			}

			options.onState?.("error");
		});

		ws.addEventListener("message", (event) => {
			if (current !== generation || closedByUser) {
				return;
			}

			let parsed: unknown;
			try {
				parsed = JSON.parse(String(event.data));
			} catch {
				return;
			}

			if (!isServerMessage(parsed)) {
				return;
			}

			options.onMessage(parsed);
		});
	}

	open();

	return {
		sendSubscribe(message) {
			lastSubscribe = message;
			if (socket === null || socket.readyState !== WebSocket.OPEN) {
				return;
			}

			const payload: TableSubscribeMessage = {
				type: "subscribe",
				...message,
			};
			socket.send(JSON.stringify(payload));
		},
		close() {
			closedByUser = true;
			generation += 1;

			clearReconnect();

			const ws = socket;
			socket = null;
			if (ws !== null) {
				discardSocket(ws, "client close");
			}
		},
	};
}

export { connectTables };
