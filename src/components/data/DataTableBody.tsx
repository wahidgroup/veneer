import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { Loading } from "../feedback/Loading.js";
import { computeBodyAriaRowIndex } from "./dataTableAria.js";

interface DataTableBodyProps<TData> {
	loading: boolean | undefined;
	empty: ReactNode | undefined;
	rows: Row<TData>[];
	pageIndex: number;
	pageSize: number;
	headerRowCount: number;
	visibleLeafCount: number;
	placeholderColIndex: number | undefined;
	leafAriaColIndexFor: (columnId: string) => number | undefined;
}

/**
 * Loading / empty / data body rows with APG ARIA row and column indices.
 */
function DataTableBody<TData>({
	loading,
	empty,
	rows,
	pageIndex,
	pageSize,
	headerRowCount,
	visibleLeafCount,
	placeholderColIndex,
	leafAriaColIndexFor,
}: DataTableBodyProps<TData>) {
	const placeholderRowIndex = headerRowCount + 1;

	if (loading === true) {
		return (
			<tr aria-rowindex={placeholderRowIndex}>
				<td colSpan={visibleLeafCount} aria-colindex={placeholderColIndex} className="px-3 py-8 text-center">
					<Loading text="Loading rows" />
				</td>
			</tr>
		);
	}

	if (rows.length === 0) {
		let emptyNode: ReactNode = <span className="text-sm text-muted-foreground">No results.</span>;

		if (empty !== undefined) {
			emptyNode = empty;
		}

		return (
			<tr aria-rowindex={placeholderRowIndex}>
				<td colSpan={visibleLeafCount} aria-colindex={placeholderColIndex} className="px-3 py-8 text-center">
					{emptyNode}
				</td>
			</tr>
		);
	}

	return (
		<>
			{rows.map((row, index) => {
				const ariaRowIndex = computeBodyAriaRowIndex(headerRowCount, pageIndex, pageSize, index);
				return (
					<tr
						key={row.id}
						data-slot="data-table-row"
						aria-rowindex={ariaRowIndex}
						className="border-b border-border hover:bg-muted/40"
					>
						{row.getVisibleCells().map((cell) => {
							return (
								<td
									key={cell.id}
									data-slot="data-table-cell"
									aria-colindex={leafAriaColIndexFor(cell.column.id)}
									className="truncate px-3 py-2 text-sm text-foreground"
									style={{ width: cell.column.getSize() }}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							);
						})}
					</tr>
				);
			})}
		</>
	);
}

export { DataTableBody };
export type { DataTableBodyProps };
