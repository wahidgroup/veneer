import type { Updater } from "@tanstack/react-table";

import type {
	DataTableColumnFilter,
	DataTableQuery,
	DataTableSort,
} from "./DataTable.types.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./DataTable.types.js";

/**
 * Clamp pageSize into [1, MAX_PAGE_SIZE], defaulting invalid lows.
 */
function clampPageSize(size: number): number {
	if (size < 1) {
		return DEFAULT_PAGE_SIZE;
	}
	if (size > MAX_PAGE_SIZE) {
		return MAX_PAGE_SIZE;
	}

	return size;
}

/**
 * Build a clamped DataTableQuery from optional partial defaults.
 */
function buildDefaultQuery(partial?: Partial<DataTableQuery>): DataTableQuery {
	let pageSize = DEFAULT_PAGE_SIZE;
	if (partial?.pageSize !== undefined) {
		pageSize = clampPageSize(partial.pageSize);
	}

	let pageIndex = 0;
	if (partial?.pageIndex !== undefined) {
		pageIndex = partial.pageIndex;
	}

	let sorting: DataTableSort[] = [];
	if (partial?.sorting !== undefined) {
		sorting = partial.sorting;
	}

	let columnFilters: DataTableColumnFilter[] = [];
	if (partial?.columnFilters !== undefined) {
		columnFilters = partial.columnFilters;
	}

	let globalFilter = "";
	if (partial?.globalFilter !== undefined) {
		globalFilter = partial.globalFilter;
	}

	const query: DataTableQuery = {
		pageIndex,
		pageSize,
		sorting,
		columnFilters,
		globalFilter,
	};
	return query;
}

/**
 * Resolve a TanStack Updater against previous state.
 */
function resolveUpdater<T extends object>(updater: Updater<T>, prev: T): T {
	if (typeof updater === "function") {
		const next = updater(prev);
		return next;
	}

	return updater;
}

/**
 * Structural equality for DataTableQuery (reference equality on filter values).
 */
function queriesEqual(a: DataTableQuery, b: DataTableQuery): boolean {
	if (a.pageIndex !== b.pageIndex) {
		return false;
	}
	if (a.pageSize !== b.pageSize) {
		return false;
	}
	if (a.globalFilter !== b.globalFilter) {
		return false;
	}
	if (a.sorting.length !== b.sorting.length) {
		return false;
	}

	for (let i = 0; i < a.sorting.length; i += 1) {
		const left = a.sorting[i];
		const right = b.sorting[i];
		if (left === undefined || right === undefined) {
			return false;
		}
		if (left.id !== right.id || left.desc !== right.desc) {
			return false;
		}
	}

	if (a.columnFilters.length !== b.columnFilters.length) {
		return false;
	}

	for (let i = 0; i < a.columnFilters.length; i += 1) {
		const left = a.columnFilters[i];
		const right = b.columnFilters[i];
		if (left === undefined || right === undefined) {
			return false;
		}
		if (left.id !== right.id) {
			return false;
		}
		if (left.value !== right.value) {
			return false;
		}
	}

	return true;
}

/**
 * Stable string key for query identity (selection prune boundary).
 */
function buildQueryKey(query: DataTableQuery, pageSize: number): string {
	const key = [
		String(query.pageIndex),
		String(pageSize),
		JSON.stringify(query.sorting),
		JSON.stringify(query.columnFilters),
		query.globalFilter,
	].join("|");
	return key;
}

export {
	buildDefaultQuery,
	buildQueryKey,
	clampPageSize,
	queriesEqual,
	resolveUpdater,
};
