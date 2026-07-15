import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type {
	StatDisplayTone,
	StatusBadgeStatus,
	TreeViewEndAlign,
	TreeViewItem,
} from "@wahidgroup/veneer";
import type {
	DataTableColumn,
	DataTableQuery,
} from "@wahidgroup/veneer/data-table";
import { DataTable, useDataTableRows } from "@wahidgroup/veneer/data-table";
import {
	AddressDisplay,
	Badge,
	BtcAmount,
	Button,
	ChipGroup,
	CodeBlock,
	CopyButton,
	DescriptionList,
	EmptyState,
	MaskedAccount,
	MoneyAmount,
	Pagination,
	ResourceGraph,
	SearchInput,
	Select,
	StatDisplay,
	StatusBadge,
	Timeline,
	Toggle,
	TreeView,
	ActivityRow,
	buildPaymentUri,
	FeeRateControl,
	LedgerRow,
	parsePaymentUri,
	SeedPhrase,
	SegmentedControl,
	Sparkline,
	TxStatusBadge,
} from "@wahidgroup/veneer";

import type { TableListParams, TableRow } from "../api/client.js";
import type { TableServerMessage } from "../api/tables-ws.js";
import { connectTables } from "../api/tables-ws.js";
import { Canvas, DemoRow, DemoSectionHeader, RailPanel } from "./demoChrome.js";
import {
	addTableRows,
	listTableRows,
	removeTableRows,
	resetTable,
	startTableStream,
	stopTableStream,
} from "../api/client.js";

type InventoryRow = TableRow;

const INVENTORY_TABLE_ID = "inventory";

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

function toListParams(query: DataTableQuery): TableListParams {
	const params: TableListParams = {
		page: query.pageIndex + 1,
		limit: query.pageSize,
	};

	if (query.globalFilter.trim().length > 0) {
		params.search = query.globalFilter.trim();
	}

	const sort = query.sorting[0];
	if (sort !== undefined) {
		params.sortBy = sort.id;
		params.sortDesc = sort.desc;
	}

	for (const filter of query.columnFilters) {
		if (typeof filter.value !== "string") {
			continue;
		}
		if (filter.value.length === 0) {
			continue;
		}
		if (filter.id === "name") {
			params.filterName = filter.value;
		} else if (filter.id === "region") {
			params.filterRegion = filter.value;
		} else if (filter.id === "status") {
			params.filterStatus = filter.value;
		}
	}

	return params;
}

interface DataTableDemoValue {
	pageSize: number;
	setPageSize: (value: number) => void;
	empty: boolean;
	setEmpty: (value: boolean) => void;
	liveRows: boolean;
	setLiveRows: (value: boolean) => void;
	autoPatch: boolean;
	setAutoPatch: (value: boolean) => void;
}

const DataTableDemoContext = createContext<DataTableDemoValue | null>(null);

function useDataTableDemo() {
	const value = useContext(DataTableDemoContext);
	if (value === null) {
		throw new Error("DataTableDemoProvider required");
	}

	return value;
}

function DataTableDemoProvider({ children }: { children: ReactNode }) {
	const [pageSize, setPageSize] = useState(25);
	const [empty, setEmpty] = useState(false);
	const [liveRows, setLiveRows] = useState(false);
	const [autoPatch, setAutoPatch] = useState(true);

	return (
		<DataTableDemoContext.Provider
			value={{
				pageSize,
				setPageSize,
				empty,
				setEmpty,
				liveRows,
				setLiveRows,
				autoPatch,
				setAutoPatch,
			}}
		>
			{children}
		</DataTableDemoContext.Provider>
	);
}

const DATA_TABLE_PAGE_SIZE_OPTIONS = [
	{ value: "10", label: "10" },
	{ value: "25", label: "25" },
	{ value: "50", label: "50" },
];

function DataTableServerCanvas() {
	const demo = useDataTableDemo();
	const [query, setQuery] = useState<DataTableQuery>({
		pageIndex: 0,
		pageSize: demo.pageSize,
		sorting: [],
		columnFilters: [],
		globalFilter: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState<{
		data: InventoryRow[];
		rowCount: number;
	}>(() => {
		return { data: [], rowCount: 0 };
	});

	useEffect(() => {
		setQuery((prev) => {
			if (prev.pageSize === demo.pageSize) {
				return prev;
			}

			return { ...prev, pageSize: demo.pageSize, pageIndex: 0 };
		});
	}, [demo.pageSize]);

	useEffect(() => {
		let cancelled = false;

		setLoading(true);
		setError(null);

		void listTableRows(INVENTORY_TABLE_ID, toListParams(query))
			.then((result) => {
				if (cancelled) {
					return;
				}

				setPage({
					data: result.items,
					rowCount: result.pagination.total,
				});
				setLoading(false);
			})
			.catch((cause: unknown) => {
				if (cancelled) {
					return;
				}

				let message = "Failed to load table";
				if (cause instanceof Error) {
					message = cause.message;
				}

				setError(message);
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [query]);

	let errorNode: ReactNode = null;
	if (error !== null) {
		errorNode = (
			<p className="mb-2 text-sm text-destructive" role="alert">
				{error}
			</p>
		);
	}

	return (
		<>
			{errorNode}
			<DataTable
				columns={COLUMNS}
				data={page.data}
				rowCount={page.rowCount}
				getRowId={getRowId}
				query={query}
				onQueryChange={setQuery}
				manualPagination
				manualSorting
				manualFiltering
				enableRowSelection
				loading={loading}
			/>
		</>
	);
}

function DataTableLiveCanvas() {
	const demo = useDataTableDemo();
	const { rows, apply, setRows } = useDataTableRows<InventoryRow>(
		[],
		getRowId,
	);

	useEffect(() => {
		const session = connectTables({
			onMessage(message: TableServerMessage) {
				if (message.type === "snapshot") {
					setRows(message.rows);
					return;
				}

				apply(message.transaction);
			},
		});

		session.sendSubscribe({ tableId: INVENTORY_TABLE_ID });

		return () => {
			session.close();
			void stopTableStream(INVENTORY_TABLE_ID).catch(() => {
				/* ignore unmount stop errors */
			});
		};
	}, [apply, setRows]);

	useEffect(() => {
		if (!demo.autoPatch) {
			void stopTableStream(INVENTORY_TABLE_ID).catch(() => {
				/* ignore */
			});
			return;
		}

		void startTableStream(INVENTORY_TABLE_ID).catch(() => {
			/* ignore */
		});

		return () => {
			void stopTableStream(INVENTORY_TABLE_ID).catch(() => {
				/* ignore */
			});
		};
	}, [demo.autoPatch]);

	return (
		<>
			<div className="mb-3 flex flex-wrap gap-2">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						const id = `live-${String(Date.now())}`;
						void addTableRows(INVENTORY_TABLE_ID, [
							{
								id,
								name: `node-${id.slice(-4)}`,
								region: "us-east-1",
								status: "healthy",
								cpu: 12,
							},
						]).catch(() => {
							/* ignore */
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

						void removeTableRows(INVENTORY_TABLE_ID, [
							rows[0].id,
						]).catch(() => {
							/* ignore */
						});
					}}
				>
					Remove first
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						void resetTable(INVENTORY_TABLE_ID).catch(() => {
							/* ignore */
						});
					}}
				>
					Reset
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
		</>
	);
}

function DataTableEmptyCanvas() {
	return (
		<DataTable
			columns={COLUMNS}
			data={[]}
			rowCount={0}
			getRowId={getRowId}
			defaultQuery={{ pageSize: 10 }}
			empty={
				<EmptyState
					size="sm"
					title="No stacks"
					action={
						<Button type="button" size="sm">
							Create stack
						</Button>
					}
				>
					Create a stack to populate this inventory.
				</EmptyState>
			}
		/>
	);
}

function DataTableCanvas() {
	const demo = useDataTableDemo();

	let body: ReactNode;
	if (demo.empty) {
		body = <DataTableEmptyCanvas />;
	} else if (demo.liveRows) {
		body = <DataTableLiveCanvas />;
	} else {
		body = <DataTableServerCanvas />;
	}

	let description =
		"Nest inventory list with full server query. Knobs switch empty / live-patch modes.";
	if (demo.empty) {
		description =
			"Empty slot uses EmptyState. Toggle Empty off to restore Nest rows.";
	} else if (demo.liveRows) {
		description =
			"Client-side rows + Nest WS patches. Add / Remove / Reset mutate inventory.";
	}

	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col">
				<DemoSectionHeader
					title="API playground"
					description={description}
					apiDriven
				/>
				<Canvas>{body}</Canvas>
			</section>
		</div>
	);
}

function DataTableKnobs() {
	const demo = useDataTableDemo();

	let pageSizeRow: ReactNode = null;
	if (!demo.empty && !demo.liveRows) {
		pageSizeRow = (
			<DemoRow
				label="Page size"
				description="Resets to page 0 when changed. 87 Nest inventory rows."
			>
				<Select
					id="data-table-page-size"
					options={DATA_TABLE_PAGE_SIZE_OPTIONS}
					value={String(demo.pageSize)}
					aria-label="Page size"
					onChange={(value) => {
						demo.setPageSize(Number(value));
					}}
				/>
			</DemoRow>
		);
	}

	let liveRowsRows: ReactNode = null;
	if (!demo.empty && demo.liveRows) {
		liveRowsRows = (
			<DemoRow
				label="Auto patch"
				description="POST /v1/tables/inventory/stream/start|stop. Server ticks ~1.5s."
			>
				<Toggle
					label="Auto patch"
					checked={demo.autoPatch}
					onCheckedChange={demo.setAutoPatch}
				/>
			</DemoRow>
		);
	}

	return (
		<RailPanel
			title="DataTable"
			description="Server mode: Nest list with full query + chip search. Live: WS snapshot/patch."
		>
			<DemoRow
				label="Empty"
				description="Render EmptyState through the empty prop."
			>
				<Toggle
					label="Empty"
					checked={demo.empty}
					onCheckedChange={demo.setEmpty}
				/>
			</DemoRow>
			<DemoRow
				label="Live rows"
				description="WS /v1/tables + HTTP add/remove/reset/stream."
			>
				<Toggle
					label="Live rows"
					checked={demo.liveRows}
					disabled={demo.empty}
					onCheckedChange={demo.setLiveRows}
				/>
			</DemoRow>
			{pageSizeRow}
			{liveRowsRows}
		</RailPanel>
	);
}

const PAGE_ITEMS = Array.from({ length: 87 }, (_, index) => {
	const id = String(index + 1);
	return `node-${id.padStart(3, "0")}`;
});

interface PaginationDemoValue {
	pageSize: number;
	setPageSize: (value: number) => void;
	showRange: boolean;
	setShowRange: (value: boolean) => void;
}

const PaginationDemoContext = createContext<PaginationDemoValue | null>(null);

function usePaginationDemo() {
	const value = useContext(PaginationDemoContext);
	if (value === null) {
		throw new Error("PaginationDemoProvider required");
	}

	return value;
}

function PaginationDemoProvider({ children }: { children: ReactNode }) {
	const [pageSize, setPageSize] = useState(5);
	const [showRange, setShowRange] = useState(true);

	return (
		<PaginationDemoContext.Provider
			value={{ pageSize, setPageSize, showRange, setShowRange }}
		>
			{children}
		</PaginationDemoContext.Provider>
	);
}

const PAGINATION_PAGE_SIZE_OPTIONS = [
	{ value: "5", label: "5" },
	{ value: "10", label: "10" },
	{ value: "25", label: "25" },
];

function PaginationCanvas() {
	const demo = usePaginationDemo();
	const [pageIndex, setPageIndex] = useState(0);
	const [prevPageSize, setPrevPageSize] = useState(demo.pageSize);

	let activePageIndex = pageIndex;
	if (demo.pageSize !== prevPageSize) {
		setPrevPageSize(demo.pageSize);
		setPageIndex(0);
		activePageIndex = 0;
	}

	const pageCount = Math.max(1, Math.ceil(PAGE_ITEMS.length / demo.pageSize));
	const start = activePageIndex * demo.pageSize;
	const visible = PAGE_ITEMS.slice(start, start + demo.pageSize);

	let pageSizeProp: number | undefined;
	let itemCountProp: number | undefined;
	if (demo.showRange) {
		pageSizeProp = demo.pageSize;
		itemCountProp = PAGE_ITEMS.length;
	}

	return (
		<Canvas>
			<ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-foreground">
				{visible.map((name) => {
					return <li key={name}>{name}</li>;
				})}
			</ul>
			<Pagination
				pageIndex={activePageIndex}
				pageCount={pageCount}
				pageSize={pageSizeProp}
				itemCount={itemCountProp}
				aria-label="Inventory"
				onPageChange={setPageIndex}
			/>
		</Canvas>
	);
}

function PaginationKnobs() {
	const demo = usePaginationDemo();

	return (
		<RailPanel
			title="Pagination"
			description="Controlled Prev/Next with optional item range. DataTable footer uses the same component."
		>
			<DemoRow
				label="Page size"
				description="Items per page in the list."
			>
				<Select
					id="pagination-page-size"
					options={PAGINATION_PAGE_SIZE_OPTIONS}
					value={String(demo.pageSize)}
					aria-label="Pagination page size"
					onChange={(value) => {
						demo.setPageSize(Number(value));
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Range"
				description="Pass itemCount + pageSize to show the item range label."
			>
				<Toggle
					label="Show range"
					checked={demo.showRange}
					onCheckedChange={demo.setShowRange}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface DescriptionListDemoValue {
	columns: 1 | 2;
	setColumns: (value: 1 | 2) => void;
}

const DescriptionListDemoContext =
	createContext<DescriptionListDemoValue | null>(null);

function useDescriptionListDemo() {
	const value = useContext(DescriptionListDemoContext);
	if (value === null) {
		throw new Error("DescriptionListDemoProvider required");
	}

	return value;
}

function DescriptionListDemoProvider({ children }: { children: ReactNode }) {
	const [columns, setColumns] = useState<1 | 2>(2);

	return (
		<DescriptionListDemoContext.Provider value={{ columns, setColumns }}>
			{children}
		</DescriptionListDemoContext.Provider>
	);
}

const DESCRIPTION_COLUMNS_OPTIONS = [
	{ value: "1", label: "1 column" },
	{ value: "2", label: "2 columns" },
];

function DescriptionListCanvas() {
	const demo = useDescriptionListDemo();

	return (
		<Canvas>
			<DescriptionList
				columns={demo.columns}
				className="w-full max-w-2xl"
				items={[
					{ term: "Name", description: "prod-api" },
					{ term: "Region", description: "us-east-1" },
					{
						term: "ARN",
						description: (
							<span className="inline-flex items-center gap-2">
								<span className="font-mono text-xs">
									arn:aws:cloudformation:us-east-1:123:stack/prod-api
								</span>
								<CopyButton value="arn:aws:cloudformation:us-east-1:123:stack/prod-api" />
							</span>
						),
					},
					{
						term: "Status",
						description: (
							<StatusBadge status="running">Running</StatusBadge>
						),
					},
				]}
			/>
		</Canvas>
	);
}

function DescriptionListKnobs() {
	const demo = useDescriptionListDemo();

	return (
		<RailPanel
			title="DescriptionList"
			description="dl/dt/dd resource attributes. Compose CopyButton and StatusBadge in descriptions."
		>
			<DemoRow label="Columns" description="Grid columns for the list.">
				<Select
					id="description-columns"
					options={DESCRIPTION_COLUMNS_OPTIONS}
					value={String(demo.columns)}
					aria-label="Description list columns"
					onChange={(value) => {
						if (value === "2") {
							demo.setColumns(2);
							return;
						}
						demo.setColumns(1);
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface StatDisplayDemoValue {
	tone: StatDisplayTone;
	setTone: (value: StatDisplayTone) => void;
	showBadge: boolean;
	setShowBadge: (value: boolean) => void;
	showHint: boolean;
	setShowHint: (value: boolean) => void;
}

const StatDisplayDemoContext = createContext<StatDisplayDemoValue | null>(null);

function useStatDisplayDemo() {
	const value = useContext(StatDisplayDemoContext);
	if (value === null) {
		throw new Error("StatDisplayDemoProvider required");
	}

	return value;
}

function StatDisplayDemoProvider({ children }: { children: ReactNode }) {
	const [tone, setTone] = useState<StatDisplayTone>("success");
	const [showBadge, setShowBadge] = useState(true);
	const [showHint, setShowHint] = useState(false);

	return (
		<StatDisplayDemoContext.Provider
			value={{
				tone,
				setTone,
				showBadge,
				setShowBadge,
				showHint,
				setShowHint,
			}}
		>
			{children}
		</StatDisplayDemoContext.Provider>
	);
}

const STAT_TONE_OPTIONS = [
	{ value: "default", label: "Default" },
	{ value: "success", label: "Success" },
	{ value: "warning", label: "Warning" },
	{ value: "danger", label: "Danger" },
];

function StatDisplayCanvas() {
	const demo = useStatDisplayDemo();

	let badge: ReactNode = undefined;
	if (demo.showBadge) {
		let badgeVariant: "success" | "warning" | "danger" | "default" =
			"default";
		if (demo.tone === "success") {
			badgeVariant = "success";
		} else if (demo.tone === "warning") {
			badgeVariant = "warning";
		} else if (demo.tone === "danger") {
			badgeVariant = "danger";
		}
		badge = <Badge variant={badgeVariant}>+12%</Badge>;
	}

	let hint: ReactNode = undefined;
	if (demo.showHint) {
		hint = "Across all regions";
	}

	return (
		<Canvas>
			<DemoRow label="Playground">
				<div className="w-full max-w-xs">
					<StatDisplay
						label="Deployments (24h)"
						value="128"
						tone={demo.tone}
						badge={badge}
						hint={hint}
					/>
				</div>
			</DemoRow>
			<DemoRow label="Tone reference">
				<div className="grid w-full max-w-3xl gap-3 sm:grid-cols-2">
					<StatDisplay
						label="Active stacks"
						value="42"
						hint="Across all regions"
					/>
					<StatDisplay
						label="Deployments (24h)"
						value="128"
						tone="success"
						badge={<Badge variant="success">+12%</Badge>}
					/>
					<StatDisplay
						label="Drifted resources"
						value="7"
						tone="warning"
						hint="Needs review"
					/>
					<StatDisplay
						label="Failed runs"
						value="3"
						tone="danger"
						badge={<Badge variant="danger">-2</Badge>}
					/>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function StatDisplayKnobs() {
	const demo = useStatDisplayDemo();

	return (
		<RailPanel
			title="StatDisplay"
			description="Metric tiles on Card size sm. Tone styles value; pair with Badge or built-in caption (WCAG 1.4.1)."
		>
			<DemoRow label="Tone" description="Playground tile tone.">
				<Select
					id="stat-tone"
					options={STAT_TONE_OPTIONS}
					value={demo.tone}
					aria-label="Stat tone"
					onChange={(value) => {
						const next = value;
						if (
							next === "default" ||
							next === "success" ||
							next === "warning" ||
							next === "danger"
						) {
							demo.setTone(next);
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Badge"
				description="Compose a Badge in the badge slot."
			>
				<Toggle
					label="Show badge"
					checked={demo.showBadge}
					onCheckedChange={demo.setShowBadge}
				/>
			</DemoRow>
			<DemoRow
				label="Hint"
				description="Supporting hint under the value."
			>
				<Toggle
					label="Show hint"
					checked={demo.showHint}
					onCheckedChange={demo.setShowHint}
				/>
			</DemoRow>
		</RailPanel>
	);
}

const SAMPLE_HCL = `resource "aws_s3_bucket" "logs" {\n\tbucket = "prod-api-logs"\n\ttags = {\n\t\tEnvironment = "prod"\n\t}\n}`;

const SAMPLE_BASH = "echo deploy\n\t./scripts/rollout.sh";

const SAMPLE_JSON = `{\n\t"stack": "prod-api",\n\t"region": "us-east-1"\n}`;

type CodeBlockLanguage = "hcl" | "bash" | "json" | "none";

interface CodeBlockDemoValue {
	language: CodeBlockLanguage;
	setLanguage: (value: CodeBlockLanguage) => void;
	showCopy: boolean;
	setShowCopy: (value: boolean) => void;
	showLineNumbers: boolean;
	setShowLineNumbers: (value: boolean) => void;
	tabSize: number;
	setTabSize: (value: number) => void;
}

const CodeBlockDemoContext = createContext<CodeBlockDemoValue | null>(null);

function useCodeBlockDemo() {
	const value = useContext(CodeBlockDemoContext);
	if (value === null) {
		throw new Error("CodeBlockDemoProvider required");
	}

	return value;
}

function CodeBlockDemoProvider({ children }: { children: ReactNode }) {
	const [language, setLanguage] = useState<CodeBlockLanguage>("hcl");
	const [showCopy, setShowCopy] = useState(true);
	const [showLineNumbers, setShowLineNumbers] = useState(true);
	const [tabSize, setTabSize] = useState(2);

	return (
		<CodeBlockDemoContext.Provider
			value={{
				language,
				setLanguage,
				showCopy,
				setShowCopy,
				showLineNumbers,
				setShowLineNumbers,
				tabSize,
				setTabSize,
			}}
		>
			{children}
		</CodeBlockDemoContext.Provider>
	);
}

const CODE_LANGUAGE_OPTIONS = [
	{ value: "hcl", label: "hcl" },
	{ value: "bash", label: "bash" },
	{ value: "json", label: "json" },
	{ value: "none", label: "(none)" },
];

const CODE_TAB_SIZE_OPTIONS = [
	{ value: "2", label: "2" },
	{ value: "4", label: "4" },
	{ value: "8", label: "8" },
];

function CodeBlockCanvas() {
	const demo = useCodeBlockDemo();

	let code = SAMPLE_HCL;
	if (demo.language === "bash") {
		code = SAMPLE_BASH;
	} else if (demo.language === "json") {
		code = SAMPLE_JSON;
	} else if (demo.language === "none") {
		code = SAMPLE_HCL;
	}

	let language: string | undefined;
	if (demo.language !== "none") {
		language = demo.language;
	}

	return (
		<Canvas>
			<div className="w-full max-w-2xl">
				<CodeBlock
					language={language}
					code={code}
					showCopy={demo.showCopy}
					showLineNumbers={demo.showLineNumbers}
					tabSize={demo.tabSize}
					aria-label="Code sample"
				/>
			</div>
		</Canvas>
	);
}

function CodeBlockKnobs() {
	const demo = useCodeBlockDemo();

	return (
		<RailPanel
			title="CodeBlock"
			description="Plain pre/code chrome. language is a toolbar label only; CopyButton when showCopy; optional showLineNumbers; tabSize is CSS tab-size."
		>
			<DemoRow
				label="Language"
				description="Toolbar label; picks sample code."
			>
				<Select
					id="code-language"
					options={CODE_LANGUAGE_OPTIONS}
					value={demo.language}
					aria-label="Code language"
					onChange={(value) => {
						const next = value;
						if (
							next === "hcl" ||
							next === "bash" ||
							next === "json" ||
							next === "none"
						) {
							demo.setLanguage(next);
						}
					}}
				/>
			</DemoRow>
			<DemoRow label="Copy" description="Show CopyButton in the toolbar.">
				<Toggle
					label="Show copy"
					checked={demo.showCopy}
					onCheckedChange={demo.setShowCopy}
				/>
			</DemoRow>
			<DemoRow
				label="Line numbers"
				description="Aria-hidden gutter beside each line."
			>
				<Toggle
					label="Show line numbers"
					checked={demo.showLineNumbers}
					onCheckedChange={demo.setShowLineNumbers}
				/>
			</DemoRow>
			<DemoRow
				label="Tab size"
				description="CSS tab-size for literal tab characters in the sample."
			>
				<Select
					id="code-tab-size"
					options={CODE_TAB_SIZE_OPTIONS}
					value={String(demo.tabSize)}
					aria-label="Tab size"
					onChange={(value) => {
						demo.setTabSize(Number(value));
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface ChipGroupDemoValue {
	showClearAll: boolean;
	setShowClearAll: (value: boolean) => void;
	dismissible: boolean;
	setDismissible: (value: boolean) => void;
}

const ChipGroupDemoContext = createContext<ChipGroupDemoValue | null>(null);

function useChipGroupDemo() {
	const value = useContext(ChipGroupDemoContext);
	if (value === null) {
		throw new Error("ChipGroupDemoProvider required");
	}

	return value;
}

function ChipGroupDemoProvider({ children }: { children: ReactNode }) {
	const [showClearAll, setShowClearAll] = useState(true);
	const [dismissible, setDismissible] = useState(true);

	return (
		<ChipGroupDemoContext.Provider
			value={{
				showClearAll,
				setShowClearAll,
				dismissible,
				setDismissible,
			}}
		>
			{children}
		</ChipGroupDemoContext.Provider>
	);
}

function ChipGroupCanvas() {
	const demo = useChipGroupDemo();
	const [items, setItems] = useState([
		{ id: "us-east-1", label: "us-east-1", pressed: true },
		{ id: "eu-west-1", label: "eu-west-1", pressed: false },
		{ id: "ap-south-1", label: "ap-south-1", pressed: true },
		{ id: "sa-east-1", label: "sa-east-1", pressed: false },
	]);

	const chipItems = items.map((item) => {
		return { ...item, dismissible: demo.dismissible };
	});

	let onClearAll: (() => void) | undefined;
	if (demo.showClearAll) {
		onClearAll = () => {
			setItems((prev) => {
				return prev.map((item) => {
					return { ...item, pressed: false };
				});
			});
		};
	}

	let onDismiss: ((id: string) => void) | undefined;
	if (demo.dismissible) {
		onDismiss = (id) => {
			setItems((prev) => {
				return prev.filter((item) => {
					return item.id !== id;
				});
			});
		};
	}

	return (
		<Canvas>
			<div className="flex w-full max-w-2xl flex-col gap-3">
				<p className="text-sm text-muted-foreground">
					Region filters for the inventory table. Press to toggle;
					dismissible chips can be removed.
				</p>
				<ChipGroup
					aria-label="Region filters"
					items={chipItems}
					onPressedChange={(id, pressed) => {
						setItems((prev) => {
							return prev.map((item) => {
								if (item.id !== id) {
									return item;
								}

								return { ...item, pressed };
							});
						});
					}}
					onDismiss={onDismiss}
					onClearAll={onClearAll}
				/>
			</div>
		</Canvas>
	);
}

function ChipGroupKnobs() {
	const demo = useChipGroupDemo();

	return (
		<RailPanel
			title="ChipGroup"
			description="Multi-select filter chips. aria-pressed toggles; optional dismiss and Clear all."
		>
			<DemoRow
				label="Clear all"
				description="Show the Clear all control (clears pressed flags)."
			>
				<Toggle
					label="Show clear all"
					checked={demo.showClearAll}
					onCheckedChange={demo.setShowClearAll}
				/>
			</DemoRow>
			<DemoRow
				label="Dismissible"
				description="Mark all chips dismissible and wire onDismiss."
			>
				<Toggle
					label="Dismissible"
					checked={demo.dismissible}
					onCheckedChange={demo.setDismissible}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface TimelineDemoValue {
	showStatuses: boolean;
	setShowStatuses: (value: boolean) => void;
	showDescriptions: boolean;
	setShowDescriptions: (value: boolean) => void;
}

const TimelineDemoContext = createContext<TimelineDemoValue | null>(null);

function useTimelineDemo() {
	const value = useContext(TimelineDemoContext);
	if (value === null) {
		throw new Error("TimelineDemoProvider required");
	}

	return value;
}

function TimelineDemoProvider({ children }: { children: ReactNode }) {
	const [showStatuses, setShowStatuses] = useState(true);
	const [showDescriptions, setShowDescriptions] = useState(true);

	return (
		<TimelineDemoContext.Provider
			value={{
				showStatuses,
				setShowStatuses,
				showDescriptions,
				setShowDescriptions,
			}}
		>
			{children}
		</TimelineDemoContext.Provider>
	);
}

interface DeployEvent {
	id: string;
	title: string;
	timestamp: string;
	description: string;
	status: StatusBadgeStatus;
}

const DEPLOY_EVENTS: DeployEvent[] = [
	{
		id: "plan",
		title: "Plan applied",
		timestamp: "Today · 09:12 UTC",
		description: "42 resources planned; 0 to destroy.",
		status: "success",
	},
	{
		id: "apply",
		title: "Apply started",
		timestamp: "Today · 09:13 UTC",
		description: "Worker pool us-east-1a.",
		status: "running",
	},
	{
		id: "drift",
		title: "Drift detected",
		timestamp: "Today · 09:18 UTC",
		description: "aws_security_group.web differs from state.",
		status: "drifted",
	},
	{
		id: "retry",
		title: "Apply retried",
		timestamp: "Today · 09:22 UTC",
		description: "Retry after lock release.",
		status: "pending",
	},
	{
		id: "fail",
		title: "Apply failed",
		timestamp: "Today · 09:24 UTC",
		description: "Timeout waiting for instance status checks.",
		status: "danger",
	},
];

function TimelineCanvas() {
	const demo = useTimelineDemo();

	const items = DEPLOY_EVENTS.map((event) => {
		let description: string | undefined = event.description;
		if (!demo.showDescriptions) {
			description = undefined;
		}

		let status: StatusBadgeStatus | undefined = event.status;
		if (!demo.showStatuses) {
			status = undefined;
		}

		return {
			id: event.id,
			title: event.title,
			timestamp: event.timestamp,
			description,
			status,
		};
	});

	return (
		<Canvas>
			<div className="w-full max-w-md">
				<p className="mb-4 text-sm text-muted-foreground">
					Deploy history for workspace prod-east. Ordered list with
					rail; StatusBadge when status is set.
				</p>
				<Timeline aria-label="Deploy history" items={items} />
			</div>
		</Canvas>
	);
}

function TimelineKnobs() {
	const demo = useTimelineDemo();

	return (
		<RailPanel title="Timeline" description="Chronological events.">
			<DemoRow
				label="Statuses"
				description="Show StatusBadge on each event."
			>
				<Toggle
					label="Show statuses"
					checked={demo.showStatuses}
					onCheckedChange={demo.setShowStatuses}
				/>
			</DemoRow>
			<DemoRow
				label="Descriptions"
				description="Show secondary description under each timestamp."
			>
				<Toggle
					label="Show descriptions"
					checked={demo.showDescriptions}
					onCheckedChange={demo.setShowDescriptions}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface TreeViewDemoValue {
	showDisabled: boolean;
	setShowDisabled: (value: boolean) => void;
	endAlign: TreeViewEndAlign;
	setEndAlign: (value: TreeViewEndAlign) => void;
}

const TreeViewDemoContext = createContext<TreeViewDemoValue | null>(null);

function useTreeViewDemo() {
	const value = useContext(TreeViewDemoContext);
	if (value === null) {
		throw new Error("TreeViewDemoProvider required");
	}

	return value;
}

function TreeViewDemoProvider({ children }: { children: ReactNode }) {
	const [showDisabled, setShowDisabled] = useState(true);
	const [endAlign, setEndAlign] = useState<TreeViewEndAlign>("snug");

	return (
		<TreeViewDemoContext.Provider
			value={{
				showDisabled,
				setShowDisabled,
				endAlign,
				setEndAlign,
			}}
		>
			{children}
		</TreeViewDemoContext.Provider>
	);
}

const NETWORK_TREE: TreeViewItem[] = [
	{
		id: "vpc",
		label: "vpc-prod",
		end: (
			<Badge size="sm" variant="info">
				3 AZ
			</Badge>
		),
		children: [
			{
				id: "subnet-public",
				label: "subnet-public-a",
				end: (
					<StatusBadge status="success" size="sm">
						Healthy
					</StatusBadge>
				),
				children: [
					{ id: "eni-web", label: "eni-web-1" },
					{
						id: "eni-lb",
						label: "eni-lb-1",
						end: (
							<Badge size="sm" variant="primary">
								alb
							</Badge>
						),
					},
				],
			},
			{
				id: "subnet-private",
				label: "subnet-private-a",
				end: (
					<StatusBadge status="warning" size="sm">
						Drifted
					</StatusBadge>
				),
				children: [
					{ id: "eni-app", label: "eni-app-1" },
					{ id: "eni-db", label: "eni-db-1", disabled: true },
				],
			},
		],
	},
	{
		id: "igw",
		label: "igw-main",
	},
	{
		id: "rtb",
		label: "rtb-public",
		children: [{ id: "route-default", label: "0.0.0.0/0 -> igw-main" }],
	},
];

function TreeViewCanvas() {
	const demo = useTreeViewDemo();
	const [expandedIds, setExpandedIds] = useState(["vpc", "subnet-public"]);
	const [lastActivated, setLastActivated] = useState<string | null>(null);

	const items = NETWORK_TREE.map((root) => {
		if (root.id !== "vpc" || root.children === undefined) {
			return root;
		}

		const children = root.children.map((subnet) => {
			if (subnet.children === undefined) {
				return subnet;
			}

			let kids = subnet.children;
			if (!demo.showDisabled) {
				kids = subnet.children.filter((child) => {
					return child.disabled !== true;
				});
			}

			return { ...subnet, children: kids };
		});

		return { ...root, children };
	});

	let activatedLine = "Activate an end node (Enter / click).";
	if (lastActivated !== null) {
		activatedLine = `Last activated: ${lastActivated}`;
	}

	return (
		<Canvas>
			<div className="w-full max-w-md">
				<p className="mb-3 text-sm text-muted-foreground">
					VPC inventory tree. Optional `end` slot (`endAlign`: snug |
					justify) holds Badge / StatusBadge. Arrow keys navigate
					while typeahead uses label only.
				</p>
				<p className="mb-3 text-xs text-muted-foreground">
					{activatedLine}
				</p>
				<TreeView
					aria-label="Network inventory"
					items={items}
					endAlign={demo.endAlign}
					expandedIds={expandedIds}
					onExpandedIdsChange={setExpandedIds}
					onActivate={(id) => {
						setLastActivated(id);
					}}
				/>
			</div>
		</Canvas>
	);
}

const TREE_END_ALIGN_OPTIONS = [
	{ value: "snug", label: "Snug" },
	{ value: "justify", label: "Justify" },
];

function TreeViewKnobs() {
	const demo = useTreeViewDemo();

	return (
		<RailPanel
			title="TreeView"
			description="APG tree. No multi-select / aria-selected in v1."
		>
			<DemoRow
				label="End align"
				description="Snug places pills after the label; justify pushes to the row edge."
			>
				<Select
					id="tree-end-align"
					options={TREE_END_ALIGN_OPTIONS}
					value={demo.endAlign}
					aria-label="End align"
					onChange={(value) => {
						if (value === "snug") {
							demo.setEndAlign("snug");
							return;
						}

						demo.setEndAlign("justify");
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Disabled node"
				description="Include eni-db-1 as aria-disabled in the private subnet."
			>
				<Toggle
					label="Show disabled"
					checked={demo.showDisabled}
					onCheckedChange={demo.setShowDisabled}
				/>
			</DemoRow>
		</RailPanel>
	);
}

const GRAPH_NODES = [
	{ id: "vpc", label: "VPC" },
	{ id: "subnet", label: "Subnet" },
	{ id: "sg", label: "SG" },
	{ id: "eni", label: "ENI" },
];

const GRAPH_EDGES = [
	{ from: "vpc", to: "subnet", label: "contains" },
	{ from: "subnet", to: "sg", label: "assoc" },
	{ from: "sg", to: "eni", label: "attach" },
];

function ResourceGraphCanvas() {
	const [selectedId, setSelectedId] = useState("subnet");

	return (
		<Canvas>
			<div className="w-full max-w-2xl">
				<ResourceGraph
					aria-label="Network dependencies"
					nodes={GRAPH_NODES}
					edges={GRAPH_EDGES}
					selectedId={selectedId}
					onNodeSelect={setSelectedId}
				/>
			</div>
			<p className="text-sm text-muted-foreground">
				Selected: {selectedId}
			</p>
		</Canvas>
	);
}

function ResourceGraphKnobs() {
	return (
		<RailPanel
			title="ResourceGraph"
			description="SVG map + DescriptionList of edges. Click or arrow+Enter to select."
		/>
	);
}

function MoneyChromeCanvas() {
	return (
		<Canvas>
			<DemoRow label="MoneyAmount">
				<MoneyAmount amountMinor={1999} currency="USD" locale="en-US" />
				<MoneyAmount amountMinor={1980} currency="JPY" locale="en-US" />
			</DemoRow>
			<DemoRow label="BtcAmount">
				<BtcAmount amountSats={15000} unit="sats" locale="en-US" />
				<BtcAmount amountSats={100} unit="btc" locale="en-US" />
			</DemoRow>
			<DemoRow label="AddressDisplay">
				<AddressDisplay address="bc1q123456789012345678901234567890" />
			</DemoRow>
			<DemoRow label="MaskedAccount">
				<MaskedAccount value="DE89370400440532013000" />
				<MaskedAccount
					value="DE89370400440532013000"
					masked={false}
					format="iban"
				/>
			</DemoRow>
		</Canvas>
	);
}

function MoneyChromeKnobs() {
	return (
		<RailPanel
			title="Money & identity"
			description="Display-only finance/crypto chrome. Amounts use integer minor units / sats; copy always uses the full value."
		/>
	);
}

function ActivitySurfacesCanvas() {
	const built = buildPaymentUri({
		address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
		amountSats: 1999,
		label: "Invoice",
	});

	let uriPreview = "build failed";
	if (built.ok) {
		uriPreview = built.value;
	}

	const parsed = parsePaymentUri(uriPreview);
	let parseLabel = "parse failed";
	if (parsed.ok && parsed.value.amountSats !== undefined) {
		parseLabel = `${String(parsed.value.amountSats)} sats`;
	}

	return (
		<Canvas>
			<DemoRow label="FeeRateControl">
				<FeeRateControl aria-label="Fee rate" defaultValue={10} />
			</DemoRow>
			<DemoRow label="ActivityRow">
				<ActivityRow
					direction="in"
					title="Received"
					subtitle="2 min ago"
					amount={<BtcAmount amountSats={25000} unit="sats" />}
					status={
						<TxStatusBadge status="confirming" confirmations={2}>
							Confirming
						</TxStatusBadge>
					}
				/>
			</DemoRow>
			<DemoRow label="LedgerRow">
				<ul className="w-full max-w-md divide-y divide-border rounded-md border border-border">
					<LedgerRow
						description="Payroll"
						amountMinor={-12500}
						currency="USD"
						balanceMinor={87500}
					/>
					<LedgerRow
						description="Refund"
						amountMinor={2500}
						currency="USD"
						balanceMinor={90000}
					/>
				</ul>
			</DemoRow>
			<DemoRow label="Sparkline">
				<Sparkline
					values={[4, 8, 6, 12, 9, 14, 11]}
					aria-label="Weekly volume"
				/>
			</DemoRow>
			<DemoRow label="PaymentUri">
				<code className="block max-w-full break-all text-xs text-muted-foreground">
					{uriPreview}
					{" -> "}
					{parseLabel}
				</code>
			</DemoRow>
		</Canvas>
	);
}

function ActivitySurfacesKnobs() {
	return (
		<RailPanel
			title="Activity surfaces"
			description="FeeRateControl, ActivityRow, LedgerRow, Sparkline, PaymentUri parse/build."
		/>
	);
}

const SEED_DEMO_WORDS = [
	"abandon",
	"ability",
	"able",
	"about",
	"above",
	"absent",
	"absorb",
	"abstract",
	"absurd",
	"abuse",
	"access",
	"accident",
	"account",
	"accuse",
	"achieve",
	"acid",
	"acoustic",
	"acquire",
	"across",
	"act",
	"action",
	"actor",
	"actress",
	"actual",
] as const;

type SeedDemoWordCount = "12" | "15" | "18" | "24";

function SeedPhraseDemoProvider({ children }: { children: ReactNode }) {
	const [wordCount, setWordCount] = useState<SeedDemoWordCount>("12");

	return (
		<SeedPhraseDemoContext.Provider value={{ wordCount, setWordCount }}>
			{children}
		</SeedPhraseDemoContext.Provider>
	);
}

const SeedPhraseDemoContext = createContext<{
	wordCount: SeedDemoWordCount;
	setWordCount: (value: SeedDemoWordCount) => void;
} | null>(null);

function useSeedPhraseDemo() {
	const value = useContext(SeedPhraseDemoContext);
	if (value === null) {
		throw new Error("SeedPhraseDemoProvider required");
	}

	return value;
}

function SeedPhraseCanvas() {
	const demo = useSeedPhraseDemo();
	const count = Number(demo.wordCount);
	const words = SEED_DEMO_WORDS.slice(0, count);

	return (
		<Canvas>
			<DemoRow label={`Reveal + copy (${String(count)} words)`}>
				<SeedPhrase words={words} showCopy defaultRevealed={false} />
			</DemoRow>
		</Canvas>
	);
}

function SeedPhraseKnobs() {
	const demo = useSeedPhraseDemo();

	return (
		<RailPanel
			title="SeedPhrase"
			description="n-words via words.length. Fixed ch slots keep hide/reveal size stable."
		>
			<DemoRow label="Word count">
				<SegmentedControl
					aria-label="Seed phrase word count"
					size="sm"
					options={[
						{ value: "12", label: "12" },
						{ value: "15", label: "15" },
						{ value: "18", label: "18" },
						{ value: "24", label: "24" },
					]}
					value={demo.wordCount}
					onValueChange={(value) => {
						if (value === "12") {
							demo.setWordCount("12");
							return;
						}
						if (value === "15") {
							demo.setWordCount("15");
							return;
						}
						if (value === "18") {
							demo.setWordCount("18");
							return;
						}
						if (value === "24") {
							demo.setWordCount("24");
						}
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

export type { InventoryRow };
export {
	DataTableDemoProvider,
	DataTableCanvas,
	DataTableKnobs,
	PaginationDemoProvider,
	PaginationCanvas,
	PaginationKnobs,
	DescriptionListDemoProvider,
	DescriptionListCanvas,
	DescriptionListKnobs,
	StatDisplayDemoProvider,
	StatDisplayCanvas,
	StatDisplayKnobs,
	CodeBlockDemoProvider,
	CodeBlockCanvas,
	CodeBlockKnobs,
	ChipGroupDemoProvider,
	ChipGroupCanvas,
	ChipGroupKnobs,
	TimelineDemoProvider,
	TimelineCanvas,
	TimelineKnobs,
	TreeViewDemoProvider,
	TreeViewCanvas,
	TreeViewKnobs,
	ResourceGraphCanvas,
	ResourceGraphKnobs,
	MoneyChromeCanvas,
	MoneyChromeKnobs,
	ActivitySurfacesCanvas,
	ActivitySurfacesKnobs,
	SeedPhraseCanvas,
	SeedPhraseDemoProvider,
	SeedPhraseKnobs,
};
