import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import type {
	DataTableColumn,
	DataTableColumnMeta,
} from "./DataTable.types.js";
import {
	COLUMN_FILTER_CLASS,
	COLUMN_FILTER_SELECT_CLASS,
} from "./DataTable.types.js";

/**
 * Narrow unknown to an array without assertion.
 */
function isUnknownArray(value: unknown): value is unknown[] {
	const result = Array.isArray(value);
	return result;
}

/**
 * Read a string-keyed property from an object without assertion.
 */
function readUnknownProp(record: object, key: string): unknown {
	if (!(key in record)) {
		return undefined;
	}

	const map: Record<string, unknown> = {};
	Object.assign(map, record);

	return map[key];
}

/**
 * Parse column meta from TanStack columnDef.meta.
 */
function readColumnMeta(meta: unknown): DataTableColumnMeta | undefined {
	if (meta === null || meta === undefined || typeof meta !== "object") {
		return undefined;
	}
	const result: DataTableColumnMeta = {};
	if ("filterVariant" in meta) {
		const variant = readUnknownProp(meta, "filterVariant");
		if (variant === "text" || variant === "select") {
			result.filterVariant = variant;
		}
	}
	if ("filterOptions" in meta) {
		const options = readUnknownProp(meta, "filterOptions");
		if (isUnknownArray(options)) {
			const parsed: { label: string; value: string }[] = [];
			for (const item of options) {
				if (item === null || typeof item !== "object") {
					continue;
				}

				const label = readUnknownProp(item, "label");
				const value = readUnknownProp(item, "value");
				if (typeof label === "string" && typeof value === "string") {
					parsed.push({ label, value });
				}
			}

			result.filterOptions = parsed;
		}
	}

	return result;
}

/**
 * Render text or select column filter control.
 */
function renderColumnFilter(
	columnId: string,
	filterValue: unknown,
	meta: DataTableColumnMeta | undefined,
	setFilterValue: (value: string) => void,
): ReactNode {
	let filterString = "";
	if (typeof filterValue === "string") {
		filterString = filterValue;
	}

	if (meta?.filterVariant === "select") {
		let options: { label: string; value: string }[] = [];
		if (meta.filterOptions !== undefined) {
			options = meta.filterOptions;
		}

		return (
			<select
				aria-label={`Filter ${columnId}`}
				className={COLUMN_FILTER_SELECT_CLASS}
				value={filterString}
				onChange={(event) => {
					setFilterValue(event.target.value);
				}}
			>
				<option value="">All</option>
				{options.map((option) => {
					return (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					);
				})}
			</select>
		);
	}

	return (
		<input
			type="search"
			aria-label={`Filter ${columnId}`}
			className={COLUMN_FILTER_CLASS}
			value={filterString}
			onChange={(event) => {
				setFilterValue(event.target.value);
			}}
		/>
	);
}

/**
 * Map Veneer columns to TanStack ColumnDef list.
 */
function toColumnDefs<TData>(
	columns: DataTableColumn<TData>[],
): ColumnDef<TData, unknown>[] {
	const defs = columns.map((column) => {
		const base = {
			id: column.id,
			enableSorting: column.enableSorting !== false,
			enableColumnFilter:
				column.enableColumnFilter === true ||
				column.meta?.filterVariant !== undefined,
			enableHiding: column.enableHiding !== false,
			enableResizing: column.enableResizing !== false,
			meta: column.meta,
			size: column.size,
			minSize: column.minSize,
			maxSize: column.maxSize,
			header: () => {
				if (typeof column.header === "function") {
					return column.header({ columnId: column.id });
				}
				return column.header;
			},
			cell: (info: {
				row: { original: TData; id: string };
				getValue: () => unknown;
			}) => {
				if (column.cell !== undefined) {
					return column.cell({
						row: info.row.original,
						value: info.getValue(),
						rowId: info.row.id,
					});
				}

				const value = info.getValue();
				if (value === null || value === undefined) {
					return null;
				}
				if (typeof value === "string") {
					return value;
				}
				if (typeof value === "number" || typeof value === "boolean") {
					return String(value);
				}

				return null;
			},
		};

		if (column.accessorFn !== undefined) {
			return {
				...base,
				accessorFn: column.accessorFn,
			};
		}
		if (column.accessorKey !== undefined) {
			return {
				...base,
				accessorKey: column.accessorKey,
			};
		}

		return base;
	});

	return defs;
}

/**
 * Fixed select-all / row-checkbox column prepended when selection is enabled.
 */
function buildSelectColumnDef<TData>(): ColumnDef<TData, unknown> {
	const selectColumn: ColumnDef<TData, unknown> = {
		id: "__select",
		size: 40,
		minSize: 40,
		maxSize: 40,
		enableSorting: false,
		enableColumnFilter: false,
		enableHiding: false,
		enableResizing: false,
		header: ({ table }) => {
			return (
				<input
					type="checkbox"
					aria-label="Select all rows on this page"
					checked={table.getIsAllPageRowsSelected()}
					ref={(element) => {
						if (element === null) {
							return;
						}
						element.indeterminate =
							table.getIsSomePageRowsSelected();
					}}
					onChange={table.getToggleAllPageRowsSelectedHandler()}
					className="size-4 accent-primary"
				/>
			);
		},
		cell: ({ row }) => {
			return (
				<input
					type="checkbox"
					aria-label={`Select row ${row.id}`}
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onChange={row.getToggleSelectedHandler()}
					className="size-4 accent-primary"
				/>
			);
		},
	};
	return selectColumn;
}

export {
	buildSelectColumnDef,
	readColumnMeta,
	renderColumnFilter,
	toColumnDefs,
};
