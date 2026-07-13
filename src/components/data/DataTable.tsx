import type {
	ColumnDef,
	ColumnFiltersState,
	ColumnResizeMode,
	PaginationState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useId, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import type { DataTableProps, DataTableQuery } from "./DataTable.types.js";
import { cn } from "../../utils/cn.js";
import { Pagination } from "../navigation/Pagination.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./DataTable.types.js";
import { DataTableBody } from "./DataTableBody.js";
import { DataTableHeaderCell } from "./DataTableHeaderCell.js";
import { DataTableToolbar } from "./DataTableToolbar.js";
import { buildSelectColumnDef, toColumnDefs } from "./dataTableColumns.js";
import { useDataTableSelection } from "./useDataTableSelection.js";
import {
	computeAriaRowCount,
	leafAriaColIndex,
	shouldAnnounceColIndices,
} from "./dataTableAria.js";
import {
	buildDefaultQuery,
	clampPageSize,
	queriesEqual,
	resolveUpdater,
} from "./dataTableQuery.js";

/**
 * Server-first data table. Default mode treats `data` as one page and emits
 * `onQueryChange` for paging, sort, search, and column filters. Use
 * `manualPagination={false}` (and related flags) only for tiny local lists.
 */
function DataTable<TData>({
	columns,
	data,
	getRowId,
	rowCount,
	manualPagination,
	manualSorting,
	manualFiltering,
	query: controlledQuery,
	defaultQuery,
	onQueryChange,
	enableRowSelection,
	rowSelection: controlledSelection,
	onRowSelectionChange,
	loading,
	empty,
	className,
	...rest
}: DataTableProps<TData>) {
	let isManualPagination = manualPagination;
	isManualPagination ??= true;
	let isManualSorting = manualSorting;
	isManualSorting ??= true;
	let isManualFiltering = manualFiltering;
	isManualFiltering ??= true;
	let selectionEnabled = enableRowSelection;
	selectionEnabled ??= false;

	const baseId = useId();
	const isQueryControlled = controlledQuery !== undefined;

	const [uncontrolledQuery, setUncontrolledQuery] = useState(() => {
		return buildDefaultQuery(defaultQuery);
	});

	let activeQuery = uncontrolledQuery;
	if (isQueryControlled) {
		activeQuery = controlledQuery;
	}

	const pageSize = clampPageSize(activeQuery.pageSize);

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		{},
	);
	const [columnsOpen, setColumnsOpen] = useState(false);

	const { rowSelection, onRowSelectionChange: handleRowSelectionChange } =
		useDataTableSelection({
			controlledSelection,
			onRowSelectionChange,
			activeQuery,
			pageSize,
			data,
			getRowId,
		});

	const setQuery = (next: DataTableQuery) => {
		const clamped: DataTableQuery = {
			...next,
			pageSize: clampPageSize(next.pageSize),
		};
		if (!isQueryControlled) {
			setUncontrolledQuery(clamped);
		}
		if (onQueryChange !== undefined) {
			onQueryChange(clamped);
		}
	};

	const patchQuery = (partial: Partial<DataTableQuery>) => {
		const next: DataTableQuery = {
			...activeQuery,
			...partial,
		};
		if (queriesEqual(activeQuery, next)) {
			return;
		}
		setQuery(next);
	};

	const columnDefs = useMemo(() => {
		const defs = toColumnDefs(columns);
		if (!selectionEnabled) {
			return defs;
		}

		const selectColumn = buildSelectColumnDef<TData>();
		const withSelect: ColumnDef<TData, unknown>[] = [selectColumn, ...defs];
		return withSelect;
	}, [columns, selectionEnabled]);

	const sortingState: SortingState = activeQuery.sorting.map((item) => {
		return { id: item.id, desc: item.desc };
	});

	const columnFiltersState: ColumnFiltersState =
		activeQuery.columnFilters.map((item) => {
			return { id: item.id, value: item.value };
		});

	const paginationState: PaginationState = {
		pageIndex: activeQuery.pageIndex,
		pageSize,
	};

	let resolvedRowCount = data.length;
	if (isManualPagination) {
		if (rowCount !== undefined) {
			resolvedRowCount = rowCount;
		}
	}

	const pageCount = Math.max(1, Math.ceil(resolvedRowCount / pageSize) || 1);
	const columnResizeMode: ColumnResizeMode = "onChange";

	let tablePageCount: number | undefined;
	if (isManualPagination) {
		tablePageCount = pageCount;
	}

	// TanStack Table returns unstable function identities
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns: columnDefs,
		getRowId: (original) => {
			return getRowId(original);
		},
		state: {
			sorting: sortingState,
			columnFilters: columnFiltersState,
			globalFilter: activeQuery.globalFilter,
			pagination: paginationState,
			columnVisibility,
			rowSelection,
		},
		manualPagination: isManualPagination,
		manualSorting: isManualSorting,
		manualFiltering: isManualFiltering,
		pageCount: tablePageCount,
		columnResizeMode,
		enableRowSelection: selectionEnabled,
		autoResetPageIndex: false,
		onSortingChange: (updater) => {
			const nextSorting = resolveUpdater(updater, sortingState);
			patchQuery({
				sorting: nextSorting.map((item) => {
					return { id: item.id, desc: item.desc };
				}),
				pageIndex: 0,
			});
		},
		onColumnFiltersChange: (updater) => {
			const nextFilters = resolveUpdater(updater, columnFiltersState);
			patchQuery({
				columnFilters: nextFilters.map((item) => {
					return { id: item.id, value: item.value };
				}),
				pageIndex: 0,
			});
		},
		onGlobalFilterChange: (value) => {
			let next = "";
			if (typeof value === "string") {
				next = value;
			}
			patchQuery({ globalFilter: next, pageIndex: 0 });
		},
		onPaginationChange: (updater) => {
			const nextPage = resolveUpdater(updater, paginationState);
			patchQuery({
				pageIndex: nextPage.pageIndex,
				pageSize: clampPageSize(nextPage.pageSize),
			});
		},
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: handleRowSelectionChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	useEffect(() => {
		if (activeQuery.pageIndex < pageCount) {
			return;
		}
		if (pageCount < 1) {
			return;
		}
		patchQuery({ pageIndex: pageCount - 1 });
		// Intentionally sync only when pageIndex is past the last page.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- patchQuery identity changes each render
	}, [activeQuery.pageIndex, pageCount]);

	const hideableColumns = table.getAllLeafColumns().filter((column) => {
		const hideable = column.id !== "__select" && column.getCanHide();
		return hideable;
	});

	const allLeafColumns = table.getAllLeafColumns();
	const visibleLeafColumns = table.getVisibleLeafColumns();
	const announceColIndices = shouldAnnounceColIndices(
		visibleLeafColumns.length,
		allLeafColumns.length,
	);
	let ariaColCount: number | undefined;
	if (announceColIndices) {
		ariaColCount = allLeafColumns.length;
	}

	function leafAriaColIndexFor(columnId: string): number | undefined {
		const colIndex = leafAriaColIndex(
			allLeafColumns,
			columnId,
			announceColIndices,
		);
		return colIndex;
	}

	let placeholderColIndex: number | undefined;
	if (announceColIndices) {
		const firstVisible = visibleLeafColumns[0];
		if (firstVisible !== undefined) {
			placeholderColIndex = leafAriaColIndexFor(firstVisible.id);
		}
	}

	const headerGroups = table.getHeaderGroups();
	const headerRowCount = headerGroups.length;
	const ariaRowCount = computeAriaRowCount(resolvedRowCount, headerRowCount);

	return (
		<div
			data-slot="data-table"
			className={cn("flex w-full min-w-0 flex-col gap-3", className)}
			{...rest}
		>
			<DataTableToolbar
				baseId={baseId}
				globalFilter={activeQuery.globalFilter}
				columnsOpen={columnsOpen}
				setColumnsOpen={setColumnsOpen}
				hideableColumns={hideableColumns}
				pageSize={pageSize}
				table={table}
			/>

			<div
				data-slot="data-table-frame"
				className="w-full min-w-0 overflow-auto rounded-md border border-border"
			>
				<table
					data-slot="data-table-grid"
					aria-rowcount={ariaRowCount}
					aria-colcount={ariaColCount}
					className="w-full table-fixed border-collapse"
					style={{ minWidth: table.getCenterTotalSize() }}
				>
					<thead
						data-slot="data-table-header"
						className="sticky top-0 z-10 bg-card"
					>
						{headerGroups.map((headerGroup, headerIndex) => {
							return (
								<tr
									key={headerGroup.id}
									aria-rowindex={headerIndex + 1}
									className="border-b border-border"
								>
									{headerGroup.headers.map((header) => {
										return (
											<DataTableHeaderCell
												key={header.id}
												header={header}
												ariaColIndex={leafAriaColIndexFor(
													header.column.id,
												)}
											/>
										);
									})}
								</tr>
							);
						})}
					</thead>
					<tbody data-slot="data-table-body">
						<DataTableBody
							loading={loading}
							empty={empty}
							rows={table.getRowModel().rows}
							pageIndex={activeQuery.pageIndex}
							pageSize={pageSize}
							headerRowCount={headerRowCount}
							visibleLeafCount={visibleLeafColumns.length}
							placeholderColIndex={placeholderColIndex}
							leafAriaColIndexFor={leafAriaColIndexFor}
						/>
					</tbody>
				</table>
			</div>

			<Pagination
				pageIndex={activeQuery.pageIndex}
				pageCount={pageCount}
				pageSize={pageSize}
				itemCount={resolvedRowCount}
				disabled={loading}
				onPageChange={(next) => {
					table.setPageIndex(next);
				}}
			/>
		</div>
	);
}

export type {
	DataTableColumn,
	DataTableColumnFilter,
	DataTableColumnMeta,
	DataTableProps,
	DataTableQuery,
	DataTableRowSelection,
	DataTableSort,
} from "./DataTable.types.js";
export { DataTable, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, buildDefaultQuery };
