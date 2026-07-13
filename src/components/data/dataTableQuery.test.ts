import { describe, expect, it } from "vitest";

import {
	buildDefaultQuery,
	buildQueryKey,
	clampPageSize,
	queriesEqual,
	resolveUpdater,
} from "./dataTableQuery.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./DataTable.types.js";

describe("dataTableQuery", () => {
	it("clamps page size into the allowed range", () => {
		expect(clampPageSize(0)).toBe(DEFAULT_PAGE_SIZE);
		expect(clampPageSize(-3)).toBe(DEFAULT_PAGE_SIZE);
		expect(clampPageSize(MAX_PAGE_SIZE + 1)).toBe(MAX_PAGE_SIZE);
		expect(clampPageSize(50)).toBe(50);
	});

	it("builds a clamped default query from partial input", () => {
		const query = buildDefaultQuery({
			pageIndex: 2,
			pageSize: 999,
			globalFilter: "x",
		});
		expect(query.pageIndex).toBe(2);
		expect(query.pageSize).toBe(MAX_PAGE_SIZE);
		expect(query.globalFilter).toBe("x");
		expect(query.sorting).toEqual([]);
		expect(query.columnFilters).toEqual([]);
	});

	it("compares queries structurally", () => {
		const a = buildDefaultQuery({ pageIndex: 1, globalFilter: "a" });
		const b = buildDefaultQuery({ pageIndex: 1, globalFilter: "a" });
		const c = buildDefaultQuery({ pageIndex: 1, globalFilter: "b" });
		expect(queriesEqual(a, b)).toBe(true);
		expect(queriesEqual(a, c)).toBe(false);
	});

	it("builds a stable query key", () => {
		const query = buildDefaultQuery({ pageIndex: 1, pageSize: 25 });
		const key = buildQueryKey(query, 25);
		expect(key.startsWith("1|25|")).toBe(true);
	});

	it("resolves function and value updaters", () => {
		const prev = { a: 1 };
		const fromFn = resolveUpdater((current) => {
			return { a: current.a + 1 };
		}, prev);
		expect(fromFn).toEqual({ a: 2 });

		const fromValue = resolveUpdater({ a: 9 }, prev);
		expect(fromValue).toEqual({ a: 9 });
	});
});
