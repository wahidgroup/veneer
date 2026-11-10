import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DataTableColumn, DataTableQuery } from "./DataTable.js";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { applyRowTransaction } from "./applyRowTransaction.js";
import { DataTable } from "./DataTable.js";

afterEach(() => {
	vi.useRealTimers();
});

interface Person {
	id: string;
	name: string;
	role: string;
}

const PEOPLE: Person[] = Array.from({ length: 25 }, (_, index) => {
	const id = String(index + 1);
	const roles = ["admin", "ops", "dev"] as const;
	const role = roles[index % roles.length] ?? "ops";
	return {
		id,
		name: `Person-${id}`,
		role,
	};
});

const COLUMNS: DataTableColumn<Person>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: "Name",
		enableColumnFilter: true,
		meta: { filterVariant: "text" },
	},
	{
		id: "role",
		accessorKey: "role",
		header: "Role",
		enableColumnFilter: true,
		meta: {
			filterVariant: "select",
			filterOptions: [
				{ label: "Admin", value: "admin" },
				{ label: "Ops", value: "ops" },
				{ label: "Dev", value: "dev" },
			],
		},
	},
];

function getRowId(row: Person): string {
	return row.id;
}

function pageSlice(rows: Person[], query: DataTableQuery): { data: Person[]; rowCount: number } {
	let filtered = rows;
	if (query.globalFilter.length > 0) {
		const needle = query.globalFilter.toLowerCase();
		filtered = filtered.filter((row) => {
			return row.name.toLowerCase().includes(needle) || row.role.toLowerCase().includes(needle);
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
			if (filter.id === "role") {
				return row.role.toLowerCase() === value;
			}

			return true;
		});
	}
	const sorted = [...filtered];
	if (query.sorting.length > 0) {
		const sort = query.sorting[0];
		if (sort !== undefined) {
			sorted.sort((left, right) => {
				let leftValue = "";
				let rightValue = "";
				if (sort.id === "name") {
					leftValue = left.name;
					rightValue = right.name;
				} else if (sort.id === "role") {
					leftValue = left.role;
					rightValue = right.role;
				}

				let cmp = leftValue.localeCompare(rightValue);
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

function ServerTable({ onQueryChange }: { onQueryChange?: (query: DataTableQuery) => void }) {
	const [query, setQuery] = useState<DataTableQuery>({
		pageIndex: 0,
		pageSize: 10,
		sorting: [],
		columnFilters: [],
		globalFilter: "",
	});
	const page = pageSlice(PEOPLE, query);

	return (
		<DataTable
			columns={COLUMNS}
			data={page.data}
			rowCount={page.rowCount}
			getRowId={getRowId}
			query={query}
			onQueryChange={(next) => {
				setQuery(next);
				if (onQueryChange !== undefined) {
					onQueryChange(next);
				}
			}}
		/>
	);
}

describe("DataTable", () => {
	it("emits onQueryChange when paging next", async () => {
		const user = userEvent.setup();
		const queries: DataTableQuery[] = [];

		render(
			<ServerTable
				onQueryChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(queries.at(-1)?.pageIndex).toBe(1);
		expect(screen.getByText("Person-11")).toBeInTheDocument();
		expect(screen.queryByText("Person-1")).not.toBeInTheDocument();
	});

	it("emits sort query when header clicked", async () => {
		const user = userEvent.setup();
		const queries: DataTableQuery[] = [];

		render(
			<ServerTable
				onQueryChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Name/ }));
		expect(queries.at(-1)?.sorting).toEqual([{ id: "name", desc: false }]);
		expect(queries.at(-1)?.pageIndex).toBe(0);
	});

	it("emits sort query when header Enter pressed", async () => {
		const user = userEvent.setup();
		const queries: DataTableQuery[] = [];

		render(
			<ServerTable
				onQueryChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		const nameHeader = screen.getByRole("button", { name: /Name/ });
		nameHeader.focus();

		await user.keyboard("{Enter}");
		expect(queries.at(-1)?.sorting).toEqual([{ id: "name", desc: false }]);
	});

	it("emits column filter query", async () => {
		const user = userEvent.setup();
		const queries: DataTableQuery[] = [];

		render(
			<ServerTable
				onQueryChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		await user.selectOptions(screen.getByLabelText("Filter role"), "admin");
		expect(queries.at(-1)?.columnFilters).toEqual([{ id: "role", value: "admin" }]);
		expect(screen.getByText("Person-1")).toBeInTheDocument();
		expect(screen.queryByText("Person-2")).not.toBeInTheDocument();
	});

	it("renders only provided data rows and page math from rowCount", () => {
		render(
			<DataTable
				columns={COLUMNS}
				data={PEOPLE.slice(0, 10)}
				rowCount={25}
				getRowId={getRowId}
				defaultQuery={{ pageSize: 10 }}
			/>,
		);
		expect(screen.getByText("Person-1")).toBeInTheDocument();
		expect(screen.getByText("Person-10")).toBeInTheDocument();
		expect(screen.queryByText("Person-11")).not.toBeInTheDocument();
		expect(screen.getByText("1–10 of 25")).toBeInTheDocument();
		expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
	});

	it("pages a local array when manualPagination is false", async () => {
		const user = userEvent.setup();
		const localRows: Person[] = Array.from({ length: 15 }, (_, index) => {
			return {
				id: String(index + 1),
				name: `Person-${String(index + 1)}`,
				role: "ops",
			};
		});

		render(
			<DataTable
				columns={COLUMNS}
				data={localRows}
				getRowId={getRowId}
				manualPagination={false}
				manualSorting={false}
				manualFiltering={false}
				defaultQuery={{ pageSize: 10 }}
			/>,
		);
		expect(screen.getByText("Person-1")).toBeInTheDocument();
		expect(screen.queryByText("Person-11")).not.toBeInTheDocument();
		expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(screen.getByText("Person-11")).toBeInTheDocument();
		expect(screen.queryByText("Person-1")).not.toBeInTheDocument();
		expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
	});

	it("keeps selection across id-stable data replace and drops removed ids", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [rows, setRows] = useState(PEOPLE.slice(0, 2));
			const [selection, setSelection] = useState<Record<string, boolean>>({});

			return (
				<div>
					<button
						type="button"
						onClick={() => {
							setRows([
								{ id: "1", name: "Person-1b", role: "admin" },
								{ id: "2", name: "Person-2b", role: "ops" },
							]);
						}}
					>
						Patch stable
					</button>
					<button
						type="button"
						onClick={() => {
							const next = applyRowTransaction(rows, { remove: ["1"] }, getRowId);
							setRows(next);
						}}
					>
						Remove first
					</button>
					<DataTable
						columns={COLUMNS}
						data={rows}
						rowCount={rows.length}
						getRowId={getRowId}
						enableRowSelection
						rowSelection={selection}
						onRowSelectionChange={setSelection}
						defaultQuery={{ pageSize: 10 }}
					/>
					<span data-testid="selected">
						{Object.keys(selection)
							.filter((id) => {
								return selection[id] === true;
							})
							.join(",")}
					</span>
				</div>
			);
		}

		render(<Harness />);

		await user.click(screen.getByLabelText("Select row 1"));
		expect(screen.getByTestId("selected")).toHaveTextContent("1");

		await user.click(screen.getByRole("button", { name: "Patch stable" }));
		expect(screen.getByText("Person-1b")).toBeInTheDocument();
		expect(screen.getByTestId("selected")).toHaveTextContent("1");
		expect(screen.getByLabelText("Select row 1")).toBeChecked();

		await user.click(screen.getByRole("button", { name: "Remove first" }));
		expect(screen.queryByText("Person-1b")).not.toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByTestId("selected")).toHaveTextContent("");
		});
	});

	it("emits onQueryChange when search debounces", async () => {
		vi.useFakeTimers();
		const queries: DataTableQuery[] = [];

		render(
			<ServerTable
				onQueryChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		fireEvent.change(screen.getByLabelText("Search table"), {
			target: { value: "Person" },
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(299);
		});
		expect(queries.at(-1)?.globalFilter).not.toBe("Person");

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1);
		});
		expect(queries.at(-1)?.globalFilter).toBe("Person");
		expect(queries.at(-1)?.pageIndex).toBe(0);
	});

	it("indexes empty and loading placeholder rows for APG", () => {
		const { container, rerender } = render(
			<DataTable columns={COLUMNS} data={[]} rowCount={0} getRowId={getRowId} loading />,
		);

		const table = container.querySelector('[data-slot="data-table-grid"]');
		expect(table?.getAttribute("aria-rowcount")).toBe("2");

		const loadingRow = container.querySelector('[data-slot="data-table-body"] tr');
		expect(loadingRow?.getAttribute("aria-rowindex")).toBe("2");
		expect(screen.getByRole("status")).toHaveTextContent("Loading rows");

		rerender(
			<DataTable
				columns={COLUMNS}
				data={[]}
				rowCount={0}
				getRowId={getRowId}
				empty={<span>Nothing here</span>}
			/>,
		);
		expect(table?.getAttribute("aria-rowcount")).toBe("2");

		const emptyRow = container.querySelector('[data-slot="data-table-body"] tr');
		expect(emptyRow?.getAttribute("aria-rowindex")).toBe("2");
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("announces aria-colcount when a column is hidden", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<DataTable columns={COLUMNS} data={PEOPLE.slice(0, 1)} rowCount={1} getRowId={getRowId} />,
		);

		const table = container.querySelector('[data-slot="data-table-grid"]');
		expect(table?.getAttribute("aria-colcount")).toBeNull();

		await user.click(screen.getByRole("button", { name: "Columns" }));
		await user.click(screen.getByRole("checkbox", { name: "role" }));
		expect(table?.getAttribute("aria-colcount")).toBe("2");

		const nameHeader = container.querySelector('[data-slot="data-table-columnheader"]');
		expect(nameHeader?.getAttribute("aria-colindex")).toBe("1");

		const bodyCell = container.querySelector('[data-slot="data-table-cell"]');
		expect(bodyCell?.getAttribute("aria-colindex")).toBe("1");
	});

	it("shows loading and empty states", () => {
		const { rerender } = render(<DataTable columns={COLUMNS} data={[]} rowCount={0} getRowId={getRowId} loading />);
		expect(screen.getByRole("status")).toHaveTextContent("Loading rows");

		rerender(
			<DataTable
				columns={COLUMNS}
				data={[]}
				rowCount={0}
				getRowId={getRowId}
				empty={<span>Nothing here</span>}
			/>,
		);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("has no axe violations on default render", async () => {
		await expectNoA11yViolations(
			<DataTable
				columns={COLUMNS}
				data={PEOPLE.slice(0, 2)}
				rowCount={2}
				getRowId={getRowId}
				defaultQuery={{ pageSize: 2 }}
			/>,
		);
	});

	it("hides selection column unless enableRowSelection is set", () => {
		render(
			<DataTable
				columns={COLUMNS}
				data={PEOPLE.slice(0, 2)}
				rowCount={2}
				getRowId={getRowId}
				defaultQuery={{ pageSize: 2 }}
			/>,
		);
		expect(screen.queryByLabelText("Select all rows on this page")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Select row 1")).not.toBeInTheDocument();
	});

	it("exposes table semantics with aria-rowcount", () => {
		const { container } = render(
			<DataTable columns={COLUMNS} data={PEOPLE.slice(0, 1)} rowCount={1} getRowId={getRowId} />,
		);

		const table = container.querySelector('[data-slot="data-table-grid"]');
		expect(table?.getAttribute("aria-rowcount")).toBe("2");

		const headerRow = container.querySelector('[data-slot="data-table-header"] tr');
		expect(headerRow?.getAttribute("aria-rowindex")).toBe("1");

		const bodyRow = container.querySelector('[data-slot="data-table-row"]');
		expect(bodyRow?.getAttribute("aria-rowindex")).toBe("2");
		expect(container.querySelectorAll('[data-slot="data-table-columnheader"]').length).toBeGreaterThan(0);
		expect(container.querySelectorAll('[data-slot="data-table-cell"]').length).toBeGreaterThan(0);
	});
});
