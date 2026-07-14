import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import type {
	DataTableColumn,
	DataTableQuery,
} from "@wahidgroup/veneer/data-table";
import type {
	StatDisplayTone,
	StatusBadgeStatus,
	TreeViewEndAlign,
	TreeViewItem,
} from "@wahidgroup/veneer";
import {
	Badge,
	Button,
	ChipGroup,
	CodeBlock,
	CopyButton,
	DescriptionList,
	EmptyState,
	Pagination,
	Select,
	StatDisplay,
	StatusBadge,
	Timeline,
	Toggle,
	TreeView,
} from "@wahidgroup/veneer";
import {
	DataTable,
	applyRowTransaction,
	useDataTableRows,
} from "@wahidgroup/veneer/data-table";

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

interface DataTableDemoValue {
	pageSize: number;
	setPageSize: (value: number) => void;
	empty: boolean;
	setEmpty: (value: boolean) => void;
	liveRows: boolean;
	setLiveRows: (value: boolean) => void;
	autoPatch: boolean;
	setAutoPatch: (value: boolean) => void;
	intervalMs: number;
	setIntervalMs: (value: number) => void;
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
	const [intervalMs, setIntervalMs] = useState(1500);

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
				intervalMs,
				setIntervalMs,
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

const DATA_TABLE_PATCH_INTERVAL_OPTIONS = [
	{ value: "500", label: "500 ms" },
	{ value: "1500", label: "1.5 s" },
	{ value: "3000", label: "3 s" },
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
	const [page, setPage] = useState(() => {
		return queryInventory(ALL_ROWS, query);
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
	);
}

function DataTableLiveCanvas() {
	const demo = useDataTableDemo();
	const initial = useMemo(() => {
		return ALL_ROWS.slice(0, 8);
	}, []);
	const { rows, apply, setRows } = useDataTableRows(initial, getRowId);

	useEffect(() => {
		if (!demo.autoPatch) {
			return;
		}

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
		}, demo.intervalMs);
		return () => {
			window.clearInterval(timer);
		};
	}, [demo.autoPatch, demo.intervalMs, setRows]);

	return (
		<>
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

	return <Canvas>{body}</Canvas>;
}

function DataTableKnobs() {
	const demo = useDataTableDemo();

	let pageSizeRow: ReactNode = null;
	if (!demo.empty && !demo.liveRows) {
		pageSizeRow = (
			<DemoRow
				label="Page size"
				description="Resets to page 0 when changed. 87 source rows."
			>
				<Select
					id="data-table-page-size"
					options={DATA_TABLE_PAGE_SIZE_OPTIONS}
					value={String(demo.pageSize)}
					aria-label="Page size"
					onChange={(event) => {
						demo.setPageSize(Number(event.target.value));
					}}
				/>
			</DemoRow>
		);
	}

	let liveRowsRows: ReactNode = null;
	if (!demo.empty && demo.liveRows) {
		liveRowsRows = (
			<>
				<DemoRow
					label="Auto patch"
					description="Rotate CPU updates via useDataTableRows."
				>
					<Toggle
						label="Auto patch"
						checked={demo.autoPatch}
						onCheckedChange={demo.setAutoPatch}
					/>
				</DemoRow>
				<DemoRow
					label="Interval"
					description="Tick rate when auto patch is on."
				>
					<Select
						id="data-table-patch-interval"
						options={DATA_TABLE_PATCH_INTERVAL_OPTIONS}
						value={String(demo.intervalMs)}
						aria-label="Patch interval"
						disabled={!demo.autoPatch}
						onChange={(event) => {
							demo.setIntervalMs(Number(event.target.value));
						}}
					/>
				</DemoRow>
			</>
		);
	}

	return (
		<RailPanel
			title="DataTable"
			description="Server page, live row patches (useDataTableRows), or empty slot."
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
				description="Client buffer with useDataTableRows + applyRowTransaction."
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

const PAGE_ITEMS = ALL_ROWS.map((row) => {
	return row.name;
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
					onChange={(event) => {
						demo.setPageSize(Number(event.target.value));
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
					onChange={(event) => {
						if (event.target.value === "2") {
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
					onChange={(event) => {
						const next = event.target.value;
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
					onChange={(event) => {
						const next = event.target.value;
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
					onChange={(event) => {
						demo.setTabSize(Number(event.target.value));
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
		children: [{ id: "route-default", label: "0.0.0.0/0 → igw-main" }],
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
					onChange={(event) => {
						if (event.target.value === "snug") {
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
};
