import { describe, expect, it } from "vitest";

import {
	computeAriaRowCount,
	computeBodyAriaRowIndex,
	leafAriaColIndex,
	shouldAnnounceColIndices,
} from "./dataTableAria.js";

describe("dataTableAria", () => {
	it("adds one body slot when resolved row count is zero", () => {
		const count = computeAriaRowCount(0, 1);
		expect(count).toBe(2);
	});

	it("sums data rows and header rows when data is present", () => {
		const count = computeAriaRowCount(10, 1);
		expect(count).toBe(11);
	});

	it("computes absolute body ARIA row index from page offset", () => {
		const index = computeBodyAriaRowIndex(1, 2, 25, 0);
		expect(index).toBe(52);
	});

	it("announces col indices only when some leaf columns are hidden", () => {
		expect(shouldAnnounceColIndices(2, 3)).toBe(true);
		expect(shouldAnnounceColIndices(3, 3)).toBe(false);
	});

	it("returns 1-based leaf ARIA column index when announcing", () => {
		const columns = [{ id: "a" }, { id: "b" }, { id: "c" }];
		expect(leafAriaColIndex(columns, "b", true)).toBe(2);
		expect(leafAriaColIndex(columns, "b", false)).toBeUndefined();
		expect(leafAriaColIndex(columns, "missing", true)).toBeUndefined();
	});
});
