import { useEffect, useMemo, useState } from "react";

import type { DataTableColumn, DataTableQuery } from "@wahidgroup/veneer";
import {
	Badge,
	Button,
	DataTable,
	Pagination,
	applyRowTransaction,
	useDataTableRows,
} from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

interface InventoryRow {
	id: string;
	name: string;
	region: string;
	status: "healthy" | "degraded" | "down";
	cpu: number;
}

const ALL_ROWS: InventoryRow[] = Array.from({ length: 87 }, (_, index) => {
	const id = String(index + 1);
	const regions = ["us-east-1", "eu-west-1", "ap-southeast-1"] as const;
	const statuses = ["healthy", "degraded", "down"] as const;
	const region = regions[index % regions.length] ?? "us-east-1";
	const status = statuses[index % statuses.length] ?? "healthy";

	return {
		id,
		name: `node-${id.padStart(3, "0")}`,
		region,
		status,
		cpu: (index * 7) % 100,
	};
});

const COLUMNS: DataTableColumn<InventoryRow>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: "Name",
		enableColumnFilter: true,
		meta: { filterVariant: "text" },
	},
	{
		id: "region",
		accessorKey: "region",
		header: "Region",
		enableColumnFilter: true,
		meta: {
			filterVariant: "select",
			filterOptions: [
				{ label: "US East", value: "us-east-1" },
				{ label: "EU West", value: "eu-west-1" },
				{ label: "AP Southeast", value: "ap-southeast-1" },
			],
		},
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Status",
		enableColumnFilter: true,
		meta: {
			filterVariant: "select",
			filterOptions: [
				{ label: "Healthy", value: "healthy" },
				{ label: "Degraded", value: "degraded" },
				{ label: "Down", value: "down" },
			],
		},
		cell: ({ value }) => {
			const status = String(value);
			let variant: "success" | "warning" | "danger" = "success";
			if (status === "degraded") {
				variant = "warning";
			} else if (status === "down") {
				variant = "danger";
			}
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		id: "cpu",
		accessorKey: "cpu",
		header: "CPU %",
	},
];

function getRowId(row: InventoryRow): string {
	return row.id;
}

/**
 * In-memory stand-in for a paged inventory API.
 */
function queryInventory(
	source: InventoryRow[],
	query: DataTableQuery,
): { data: InventoryRow[]; rowCount: number } {
	let filtered = source;

	if (query.globalFilter.length > 0) {
		const needle = query.globalFilter.toLowerCase();
		filtered = filtered.filter((row) => {
			return (
				row.name.toLowerCase().includes(needle) ||
				row.region.toLowerCase().includes(needle) ||
				row.status.toLowerCase().includes(needle)
			);
		});
	}

	for (const filter of query.columnFilters) {
		if (typeof filter.value !== "string") {
			continue;
		}
		if (filter.value.length === 0) {
			continue;
		}

		const value = filter.value.toLowerCase();
		filtered = filtered.filter((row) => {
			if (filter.id === "name") {
				return row.name.toLowerCase().includes(value);
			}
			if (filter.id === "region") {
				return row.region.toLowerCase() === value;
			}
			if (filter.id === "status") {
				return row.status.toLowerCase() === value;
			}

			return true;
		});
	}

	const sorted = [...filtered];
	if (query.sorting.length > 0) {
		const sort = query.sorting[0];
		if (sort !== undefined) {
			sorted.sort((left, right) => {
				let cmp = 0;
				if (sort.id === "name") {
					cmp = left.name.localeCompare(right.name);
				} else if (sort.id === "region") {
					cmp = left.region.localeCompare(right.region);
				} else if (sort.id === "status") {
					cmp = left.status.localeCompare(right.status);
				} else if (sort.id === "cpu") {
					cmp = left.cpu - right.cpu;
				}
				if (sort.desc) {
					cmp = -cmp;
				}

				return cmp;
			});
		}
	}

	const start = query.pageIndex * query.pageSize;
	return {
		data: sorted.slice(start, start + query.pageSize),
		rowCount: sorted.length,
	};
}

function ServerPageCanvas() {
	const [query, setQuery] = useState<DataTableQuery>({
		pageIndex: 0,
		pageSize: 25,
		sorting: [],
		columnFilters: [],
		globalFilter: "",
	});
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(() => {
		return queryInventory(ALL_ROWS, query);
	});

	useEffect(() => {
		setLoading(true);
		const timer = window.setTimeout(() => {
			setPage(queryInventory(ALL_ROWS, query));
			setLoading(false);
		}, 180);

		return () => {
			window.clearTimeout(timer);
		};
	}, [query]);

	return (
		<Canvas>
			<DataTable
				columns={COLUMNS}
				data={page.data}
				rowCount={page.rowCount}
				getRowId={getRowId}
				query={query}
				onQueryChange={setQuery}
				enableRowSelection
				loading={loading}
			/>
		</Canvas>
	);
}

function ServerPageKnobs() {
	return (
		<RailPanel
			title="Server page"
			description="Mock API slices, sorts, and filters in memory. DataTable only receives the current page plus rowCount."
		>
			<DemoRow
				label="Model"
				description="manualPagination / sorting / filtering default on. Change page, sort, or filters and watch the query drive a refetch."
			>
				<span className="text-sm text-muted-foreground">
					87 source rows · page size capped at 100
				</span>
			</DemoRow>
		</RailPanel>
	);
}

function LivePatchCanvas() {
	const initial = useMemo(() => {
		return ALL_ROWS.slice(0, 8);
	}, []);
	const { rows, apply, setRows } = useDataTableRows(initial, getRowId);

	useEffect(() => {
		let step = 0;
		const timer = window.setInterval(() => {
			setRows((prev) => {
				if (prev.length === 0) {
					return prev;
				}

				const target = prev[step % prev.length];
				step += 1;
				if (target === undefined) {
					return prev;
				}

				return applyRowTransaction(
					prev,
					{
						update: [
							{
								...target,
								cpu: (target.cpu + 11) % 100,
							},
						],
					},
					getRowId,
				);
			});
		}, 1500);
		return () => {
			window.clearInterval(timer);
		};
	}, [setRows]);

	return (
		<Canvas>
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						const id = `live-${String(Date.now())}`;
						apply({
							add: [
								{
									id,
									name: `node-${id.slice(-4)}`,
									region: "us-east-1",
									status: "healthy",
									cpu: 12,
								},
							],
						});
					}}
				>
					Add row
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						if (rows[0] === undefined) {
							return;
						}
						apply({ remove: [rows[0].id] });
					}}
				>
					Remove first
				</Button>
			</div>
			<DataTable
				columns={COLUMNS}
				data={rows}
				getRowId={getRowId}
				manualPagination={false}
				manualSorting={false}
				manualFiltering={false}
				enableRowSelection
				defaultQuery={{ pageSize: 10 }}
			/>
		</Canvas>
	);
}

function LivePatchKnobs() {
	return (
		<RailPanel
			title="Live patch"
			description="useDataTableRows + applyRowTransaction patch the current result set. Selection stays stable when ids do."
		>
			<DemoRow label="Stream">
				<span className="text-sm text-muted-foreground">
					CPU ticks every 1.5s on a rotating row
				</span>
			</DemoRow>
		</RailPanel>
	);
}

const PAGE_SIZE = 5;
const PAGE_ITEMS = ALL_ROWS.map((row) => {
	return row.name;
});

function PaginationCanvas() {
	const [pageIndex, setPageIndex] = useState(0);
	const pageCount = Math.max(1, Math.ceil(PAGE_ITEMS.length / PAGE_SIZE));
	const start = pageIndex * PAGE_SIZE;
	const visible = PAGE_ITEMS.slice(start, start + PAGE_SIZE);

	return (
		<Canvas>
			<ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-foreground">
				{visible.map((name) => {
					return <li key={name}>{name}</li>;
				})}
			</ul>
			<Pagination
				pageIndex={pageIndex}
				pageCount={pageCount}
				pageSize={PAGE_SIZE}
				itemCount={PAGE_ITEMS.length}
				aria-label="Inventory"
				onPageChange={setPageIndex}
			/>
		</Canvas>
	);
}

function PaginationKnobs() {
	return (
		<RailPanel
			title="Pagination"
			description="Controlled Prev/Next with optional item range. DataTable footer uses the same component; page size stays in the table toolbar."
		>
			<DemoRow label="Props">
				<span className="text-sm text-muted-foreground">
					pageIndex (0-based) · pageCount · itemCount + pageSize for
					range
				</span>
			</DemoRow>
		</RailPanel>
	);
}

export type { InventoryRow };
export {
	ServerPageCanvas,
	ServerPageKnobs,
	LivePatchCanvas,
	LivePatchKnobs,
	PaginationCanvas,
	PaginationKnobs,
};
