import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { readColumnMeta, renderColumnFilter } from "./dataTableColumns.js";
import { SORT_HEADER_CLASS } from "./DataTable.types.js";

interface DataTableHeaderCellProps<TData> {
	header: Header<TData, unknown>;
	ariaColIndex: number | undefined;
}

/**
 * One header cell: sort control, optional filter, optional resize handle.
 */
function DataTableHeaderCell<TData>({
	header,
	ariaColIndex,
}: DataTableHeaderCellProps<TData>) {
	const canSort = header.column.getCanSort();
	const sorted = header.column.getIsSorted();

	let sortIcon: ReactNode = (
		<ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />
	);
	let ariaSort: "none" | "ascending" | "descending" | undefined;
	if (canSort) {
		ariaSort = "none";
	}
	if (sorted === "asc") {
		sortIcon = <ArrowUp className="size-3.5" aria-hidden="true" />;
		ariaSort = "ascending";
	} else if (sorted === "desc") {
		sortIcon = <ArrowDown className="size-3.5" aria-hidden="true" />;
		ariaSort = "descending";
	}

	let headerInner: ReactNode = null;
	if (!header.isPlaceholder) {
		headerInner = flexRender(
			header.column.columnDef.header,
			header.getContext(),
		);
	}

	let headerNode: ReactNode = (
		<div className="flex items-center gap-1 font-medium">{headerInner}</div>
	);
	if (canSort) {
		headerNode = (
			<button
				type="button"
				className={SORT_HEADER_CLASS}
				onClick={header.column.getToggleSortingHandler()}
			>
				{headerInner}
				{sortIcon}
			</button>
		);
	}

	const meta = readColumnMeta(header.column.columnDef.meta);
	let filterNode: ReactNode = null;
	if (header.column.getCanFilter()) {
		filterNode = renderColumnFilter(
			header.column.id,
			header.column.getFilterValue(),
			meta,
			(value) => {
				header.column.setFilterValue(value);
			},
		);
	}

	let resizeHandle: ReactNode = null;
	if (header.column.getCanResize()) {
		let resizeClass =
			"absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 hover:opacity-100";
		if (header.column.getIsResizing()) {
			resizeClass =
				"absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-primary opacity-100";
		}

		resizeHandle = (
			<button
				type="button"
				aria-label={`Resize column ${header.column.id}`}
				onMouseDown={header.getResizeHandler()}
				onTouchStart={header.getResizeHandler()}
				className={resizeClass}
			/>
		);
	}

	return (
		<th
			data-slot="data-table-columnheader"
			aria-sort={ariaSort}
			aria-colindex={ariaColIndex}
			className="relative px-3 py-2 text-left text-sm text-foreground"
			style={{
				width: header.getSize(),
			}}
		>
			{headerNode}
			{filterNode}
			{resizeHandle}
		</th>
	);
}

export { DataTableHeaderCell };
export type { DataTableHeaderCellProps };
