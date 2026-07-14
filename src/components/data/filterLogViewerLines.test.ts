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

describe("filterLogViewerLines", () => {
	it("ORs multiple query chips", () => {
		const next = filterLogViewerLines(SAMPLE_LINES, {
			queries: ["boot", "failed"],
		});
		expect(next.map((line) => line.id)).toEqual(["1", "3"]);
	});

	it("matches query chips against line data JSON", () => {
		const next = filterLogViewerLines(SAMPLE_LINES, {
			queries: ["req-9"],
		});
		expect(next.map((line) => line.id)).toEqual(["3"]);
	});

	it("filters by level", () => {
		const next = filterLogViewerLines(SAMPLE_LINES, {
			levels: ["error"],
		});
		expect(next.map((line) => line.id)).toEqual(["3"]);
	});

	it("excludes lines without at when a time bound is set", () => {
		const next = filterLogViewerLines(
			[...SAMPLE_LINES, { id: "4", text: "no timestamp", level: "info" }],
			{ from: "2020-01-01T00:00" },
		);
		expect(next.map((line) => line.id)).toEqual(["1", "2", "3"]);
	});
});
