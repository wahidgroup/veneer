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

export interface LogFilter {
	levels?: LogLevel[];
	queries?: string[];
	from?: string;
	to?: string;
}

const ALL_LEVELS: LogLevel[] = ["debug", "info", "warn", "error"];

function parseInstant(value: string): number | null {
	if (value === "") {
		return null;
	}

	const ms = Date.parse(value);
	if (Number.isNaN(ms)) {
		return null;
	}

	return ms;
}

function formatLineData(data: unknown): string {
	try {
		return JSON.stringify(data, null, 2);
	} catch {
		return String(data);
	}
}

function lineHaystack(line: LogLine): string {
	let haystack = line.text;
	if (line.data !== undefined) {
		haystack = `${haystack}\n${formatLineData(line.data)}`;
	}

	return haystack.toLowerCase();
}

export function matchLogLine(line: LogLine, filter: LogFilter): boolean {
	let levels = filter.levels;
	levels ??= ALL_LEVELS;

	let queries = filter.queries;
	queries ??= [];

	let from = filter.from;
	from ??= "";

	let to = filter.to;
	to ??= "";

	const levelSet = new Set(levels);
	if (line.level !== undefined && !levelSet.has(line.level)) {
		return false;
	}

	const fromMs = parseInstant(from);
	const toMs = parseInstant(to);
	const timeActive = fromMs !== null || toMs !== null;

	if (timeActive) {
		if (line.at === undefined) {
			return false;
		}

		const atMs = parseInstant(line.at);
		if (atMs === null) {
			return false;
		}

		if (fromMs !== null && atMs < fromMs) {
			return false;
		}

		if (toMs !== null && atMs > toMs) {
			return false;
		}
	}

	const needles = queries
		.map((query) => {
			return query.trim().toLowerCase();
		})
		.filter((query) => {
			return query.length > 0;
		});

	if (needles.length > 0) {
		const haystack = lineHaystack(line);
		let matched = false;
		for (const needle of needles) {
			if (haystack.includes(needle)) {
				matched = true;
				break;
			}
		}

		if (!matched) {
			return false;
		}
	}

	return true;
}
