export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogLine {
	id: string;
	text: string;
	level?: LogLevel;
	at?: string;
	data?: unknown;
}

export interface LogSubscribeMessage {
	type: "subscribe";
	levels?: LogLevel[];
	queries?: string[];
	from?: string;
	to?: string;
}

export interface LogSnapshotMessage {
	type: "snapshot";
	lines: LogLine[];
}

export interface LogLineMessage {
	type: "line";
	line: LogLine;
}

export type LogServerMessage = LogSnapshotMessage | LogLineMessage;

export type LogsConnectionState = "connecting" | "open" | "closed" | "error";

interface ConnectLogsOptions {
	onMessage: (message: LogServerMessage) => void;
	onState?: (state: LogsConnectionState) => void;
	url?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

function isLogLevel(value: unknown): value is LogLevel {
	return (
		value === "debug" ||
		value === "info" ||
		value === "warn" ||
		value === "error"
	);
}

function isLogLine(value: unknown): value is LogLine {
	if (!isRecord(value)) {
		return false;
	}
	if (typeof value.id !== "string" || typeof value.text !== "string") {
		return false;
	}
	if (value.level !== undefined && !isLogLevel(value.level)) {
		return false;
	}
	if (value.at !== undefined && typeof value.at !== "string") {
		return false;
	}

	return true;
}

function isServerMessage(value: unknown): value is LogServerMessage {
	if (!isRecord(value) || typeof value.type !== "string") {
		return false;
	}

	if (value.type === "snapshot") {
		if (!Array.isArray(value.lines)) {
			return false;
		}

		for (const line of value.lines) {
			if (!isLogLine(line)) {
				return false;
			}
		}

		return true;
	}

	if (value.type === "line") {
		return isLogLine(value.line);
	}

	return false;
}

function connectLogs(options: ConnectLogsOptions): {
	sendSubscribe: (message: Omit<LogSubscribeMessage, "type">) => void;
	close: () => void;
} {
	let scheme = "ws";
	if (window.location.protocol === "https:") {
		scheme = "wss";
	}

	let url = `${scheme}://${window.location.host}/v1/logs`;
	if (options.url !== undefined) {
		url = options.url;
	}

	let socket: WebSocket | null = null;
	let closedByUser = false;
	let generation = 0;
	let attempt = 0;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSubscribe: Omit<LogSubscribeMessage, "type"> | null = null;

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

			const payload: LogSubscribeMessage = {
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

			const payload: LogSubscribeMessage = {
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

export { connectLogs };
