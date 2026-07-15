import { describe, expect, it } from "vitest";

import type { LogViewerLine } from "./LogViewer.js";
import { filterLogViewerLines } from "./filterLogViewerLines.js";

const SAMPLE_LINES: LogViewerLine[] = [
	{
		id: "1",
		text: "boot ok",
		level: "info",
		at: "2026-07-13T10:00:00.000Z",
		data: { event: "boot", host: "web-1" },
	},
	{
		id: "2",
		text: "cache miss",
		level: "debug",
		at: "2026-07-13T10:01:00.000Z",
	},
	{
		id: "3",
		text: "apply failed",
		level: "error",
		at: "2026-07-13T10:02:00.000Z",
		data: { event: "apply", reason: "timeout", requestId: "req-9" },
	},
];

const LINE_WITHOUT_TIMESTAMP: LogViewerLine = {
	id: "4",
	text: "no timestamp",
	level: "info",
};

describe("filterLogViewerLines", () => {
	it.each([
		{
			label: "ORs multiple query chips",
			lines: SAMPLE_LINES,
			filter: { queries: ["boot", "failed"] },
			expectedIds: ["1", "3"],
		},
		{
			label: "matches query chips against line data JSON",
			lines: SAMPLE_LINES,
			filter: { queries: ["req-9"] },
			expectedIds: ["3"],
		},
		{
			label: "filters by level",
			lines: SAMPLE_LINES,
			filter: { levels: ["error" as const] },
			expectedIds: ["3"],
		},
		{
			label: "excludes lines without at when a time bound is set",
			lines: [...SAMPLE_LINES, LINE_WITHOUT_TIMESTAMP],
			filter: { from: "2020-01-01T00:00" },
			expectedIds: ["1", "2", "3"],
		},
	])("$label", ({ lines, filter, expectedIds }) => {
		const next = filterLogViewerLines(lines, filter);
		const ids = next.map((line) => line.id);
		expect(ids).toEqual(expectedIds);
	});
});
