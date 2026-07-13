import type { Column, Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Columns3 } from "lucide-react";

import { Button } from "../forms/Button.js";
import { SearchInput } from "../forms/SearchInput.js";
import { Select } from "../forms/Select.js";
import { clampPageSize } from "./dataTableQuery.js";
import { PAGE_SIZE_OPTIONS, SEARCH_DEBOUNCE_MS } from "./DataTable.types.js";

interface DataTableToolbarProps<TData> {
	baseId: string;
	globalFilter: string;
	columnsOpen: boolean;
	setColumnsOpen: (open: boolean) => void;
	hideableColumns: Column<TData, unknown>[];
	pageSize: number;
	table: Table<TData>;
}

/**
 * Search, column visibility toggle, and page-size select.
 */
function DataTableToolbar<TData>({
	baseId,
	globalFilter,
	columnsOpen,
	setColumnsOpen,
	hideableColumns,
	pageSize,
	table,
}: DataTableToolbarProps<TData>) {
	let columnsPanel: ReactNode = null;
	if (columnsOpen) {
		columnsPanel = (
			<div
				id={`${baseId}-columns`}
				role="group"
				aria-label="Toggle columns"
				className="absolute right-0 z-dropdown mt-1 min-w-44 rounded-md border border-border bg-card p-2 shadow-md"
			>
				{hideableColumns.map((column) => {
					return (
						<label
							key={column.id}
							className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
						>
							<input
								type="checkbox"
								checked={column.getIsVisible()}
								onChange={column.getToggleVisibilityHandler()}
								className="size-4 accent-primary"
							/>
							<span className="truncate">{column.id}</span>
						</label>
					);
				})}
			</div>
		);
	}

	return (
		<div
			data-slot="data-table-toolbar"
			className="flex flex-wrap items-center gap-3"
		>
			<div className="min-h-8 min-w-[12rem] flex-1">
				<SearchInput
					id={`${baseId}-search`}
					value={globalFilter}
					debounceMs={SEARCH_DEBOUNCE_MS}
					placeholder="Search table"
					onValueChange={(value) => {
						if (value === globalFilter) {
							return;
						}
						table.setGlobalFilter(value);
					}}
				/>
			</div>
			<div className="relative shrink-0">
				<Button
					type="button"
					variant="outlined"
					size="sm"
					className="h-8"
					aria-expanded={columnsOpen}
					aria-controls={`${baseId}-columns`}
					onClick={() => {
						setColumnsOpen(!columnsOpen);
					}}
				>
					<Columns3 className="size-4" aria-hidden="true" />
					Columns
				</Button>
				{columnsPanel}
			</div>
			<div className="w-36 shrink-0">
				<Select
					id={`${baseId}-page-size`}
					aria-label="Rows per page"
					className="h-8 py-1.5 pr-10 text-xs"
					value={String(pageSize)}
					options={PAGE_SIZE_OPTIONS.map((size) => {
						return {
							value: String(size),
							label: `${String(size)} / page`,
						};
					})}
					onChange={(event) => {
						const size = Number(event.target.value);
						table.setPageSize(clampPageSize(size));
					}}
				/>
			</div>
		</div>
	);
}

export { DataTableToolbar };
export type { DataTableToolbarProps };
