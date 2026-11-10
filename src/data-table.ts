/**
 * @packageDocumentation
 * `@wahidgroup/veneer/data-table`: DataTable and row helpers.
 *
 * Peer: `@tanstack/react-table` (optional for the root package; required here).
 */

export { DataTable, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, buildDefaultQuery } from "./components/data/DataTable.js";
export type {
	DataTableColumn,
	DataTableColumnFilter,
	DataTableColumnMeta,
	DataTableProps,
	DataTableQuery,
	DataTableRowSelection,
	DataTableSort,
} from "./components/data/DataTable.js";
export { applyRowTransaction } from "./components/data/applyRowTransaction.js";
export type { RowTransaction } from "./components/data/applyRowTransaction.js";
export { useDataTableRows } from "./components/data/useDataTableRows.js";
