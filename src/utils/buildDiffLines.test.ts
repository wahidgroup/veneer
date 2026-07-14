import { describe, expect, it } from "vitest";

import { buildDiffLines } from "./buildDiffLines.js";

describe("buildDiffLines", () => {
	it("emits hunk, removed, and added rows for a one-line change", () => {
		const lines = buildDiffLines("a\nb\nc\n", "a\nx\nc\n", { context: 1 });
		expect(lines[0]?.kind).toBe("hunk");
		expect(lines).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: "removed",
					text: "b",
					oldLineNumber: 2,
				}),
				expect.objectContaining({
					kind: "added",
					text: "x",
					newLineNumber: 2,
				}),
			]),
		);
	});

	it("returns an empty list when texts match", () => {
		expect(buildDiffLines("same\n", "same\n")).toEqual([]);
	});

	it("numbers context lines on both sides", () => {
		const lines = buildDiffLines("one\ntwo\n", "one\ntwo\nthree\n", {
			context: 2,
		});
		const context = lines.filter((line) => {
			return line.kind === "context";
		});
		expect(context.length).toBeGreaterThan(0);
		expect(context[0]?.oldLineNumber).toBeDefined();
		expect(context[0]?.newLineNumber).toBeDefined();
	});
});
