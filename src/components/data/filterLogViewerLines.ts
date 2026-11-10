import type { LogViewerLevel, LogViewerLine } from "./LogViewer.js";

interface FilterLogViewerLinesOptions {
	levels?: LogViewerLevel[];
	queries?: string[];
	from?: string;
	to?: string;
}

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

function lineSearchHaystack(line: LogViewerLine): string {
	let haystack = line.text;
	if (line.data !== undefined) {
		haystack = `${haystack}\n${formatLineData(line.data)}`;
	}

	return haystack.toLowerCase();
}

/**
 * Pure client/helper filter for parents that filter locally. Queries match
 * with OR semantics across chips (text or stringified `data`). Not used by
 * LogViewer itself - the panel displays `lines` as given.
 */
function filterLogViewerLines(lines: LogViewerLine[], opts: FilterLogViewerLinesOptions = {}): LogViewerLine[] {
	let levels = opts.levels;
	levels ??= ["debug", "info", "warn", "error"];

	let queries = opts.queries;
	queries ??= [];

	let from = opts.from;
	from ??= "";

	let to = opts.to;
	to ??= "";

	const levelSet = new Set(levels);
	const fromMs = parseInstant(from);
	const toMs = parseInstant(to);
	const timeActive = fromMs !== null || toMs !== null;
	const needles = queries
		.map((query) => {
			return query.trim().toLowerCase();
		})
		.filter((query) => {
			return query.length > 0;
		});

	return lines.filter((line) => {
		if (line.level !== undefined && !levelSet.has(line.level)) {
			return false;
		}

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

		if (needles.length > 0) {
			const haystack = lineSearchHaystack(line);
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
	});
}

export type { FilterLogViewerLinesOptions };
export { filterLogViewerLines, formatLineData, parseInstant };
