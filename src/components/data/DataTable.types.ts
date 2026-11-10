import type { ComponentProps, ReactNode } from "react";

/**
 * Default rows per page when query omits pageSize.
 */
const DEFAULT_PAGE_SIZE = 25;

/**
 * Upper bound for pageSize clamping.
 */
const MAX_PAGE_SIZE = 100;

/**
 * Allowed page-size select options.
 */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Debounce delay for the toolbar SearchInput.
 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Shared class for text column filters.
 */
const COLUMN_FILTER_CLASS =
	"mt-1 w-full rounded border border-border bg-secondary px-1.5 py-1 text-xs text-foreground outline-none transition-colors hover:border-input focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring";

/**
 * Shared class for select column filters.
 */
const COLUMN_FILTER_SELECT_CLASS = `${COLUMN_FILTER_CLASS} cursor-pointer appearance-none`;

/**
 * Shared class for sortable header buttons.
 */
const SORT_HEADER_CLASS =
	"flex w-full cursor-pointer items-center gap-1 rounded-sm text-left font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * One sort column in a DataTableQuery.
 */
interface DataTableSort {
	id: string;
	desc: boolean;
}

/**
 * One column filter value in a DataTableQuery.
 */
interface DataTableColumnFilter {
	id: string;
	value: unknown;
}

/**
 * Server-driven table query: page, sort, filters, and global search.
 */
interface DataTableQuery {
	pageIndex: number;
	pageSize: number;
	sorting: DataTableSort[];
	columnFilters: DataTableColumnFilter[];
	globalFilter: string;
}

/**
 * Optional per-column filter UI metadata (text or select).
 */
interface DataTableColumnMeta {
	filterVariant?: "text" | "select";
	filterOptions?: { label: string; value: string }[];
}

/**
 * Veneer column definition mapped onto TanStack Table.
 */
interface DataTableColumn<TData> {
	id: string;
	accessorKey?: keyof TData & string;
	accessorFn?: (row: TData) => unknown;
	header: ReactNode | ((ctx: { columnId: string }) => ReactNode);
	cell?: (ctx: { row: TData; value: unknown; rowId: string }) => ReactNode;
	enableSorting?: boolean;
	enableColumnFilter?: boolean;
	enableHiding?: boolean;
	enableResizing?: boolean;
	size?: number;
	minSize?: number;
	maxSize?: number;
	meta?: DataTableColumnMeta;
}

/**
 * Row selection map keyed by stable `getRowId` values.
 */
type DataTableRowSelection = Record<string, boolean>;

/**
 * Shared DataTable props excluding the rowCount discrimination.
 */
interface DataTableSharedProps<TData> extends Omit<ComponentProps<"div">, "children"> {
	columns: DataTableColumn<TData>[];
	data: TData[];
	getRowId: (row: TData) => string;
	manualSorting?: boolean;
	manualFiltering?: boolean;
	query?: DataTableQuery;
	defaultQuery?: Partial<DataTableQuery>;
	onQueryChange?: (query: DataTableQuery) => void;
	enableRowSelection?: boolean;
	rowSelection?: DataTableRowSelection;
	onRowSelectionChange?: (selection: DataTableRowSelection) => void;
	loading?: boolean;
	empty?: ReactNode;
}

/**
 * DataTable props. `rowCount` is required when manual pagination is on
 * (the default); optional when `manualPagination` is false.
 */
type DataTableProps<TData> =
	| (DataTableSharedProps<TData> & {
			manualPagination?: true;
			rowCount: number;
	  })
	| (DataTableSharedProps<TData> & {
			manualPagination: false;
			rowCount?: number;
	  });

export type {
	DataTableColumn,
	DataTableColumnFilter,
	DataTableColumnMeta,
	DataTableProps,
	DataTableQuery,
	DataTableRowSelection,
	DataTableSharedProps,
	DataTableSort,
};
export {
	COLUMN_FILTER_CLASS,
	COLUMN_FILTER_SELECT_CLASS,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	PAGE_SIZE_OPTIONS,
	SEARCH_DEBOUNCE_MS,
	SORT_HEADER_CLASS,
};
