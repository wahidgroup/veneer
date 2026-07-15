import { describe, expect, it } from "vitest";

import * as dataTable from "./data-table.js";
import * as diff from "./diff.js";
import * as flow from "./flow.js";
import * as flowLayout from "./flow-layout.js";
import * as lib from "./index.js";

/**
 * Runtime export lock. Grow as public API expands.
 */
const EXPECTED_EXPORTS = new Set([
	"ActionMenu",
	"Accordion",
	"AccordionContent",
	"AccordionItem",
	"AccordionTrigger",
	"ActivityRow",
	"AddressDisplay",
	"Alert",
	"alertVariants",
	"APP_SHELL_COMPACT_QUERY",
	"APP_SHELL_MOBILE_MAX_PX",
	"APP_SHELL_MOBILE_QUERY",
	"APP_SHELL_TABLET_MAX_PX",
	"AppShell",
	"Avatar",
	"avatarVariants",
	"Badge",
	"badgeVariants",
	"BtcAmount",
	"Breadcrumbs",
	"Button",
	"buttonVariants",
	"buildPaymentUri",
	"Card",
	"cardVariants",
	"Checkbox",
	"ChipGroup",
	"Collapsible",
	"CollapsibleContent",
	"CollapsibleTrigger",
	"CircularProgress",
	"circularProgressVariants",
	"cn",
	"CodeBlock",
	"Combobox",
	"CommandPalette",
	"ConfirmDialog",
	"ContextMenu",
	"controlVariants",
	"CopyButton",
	"cva",
	"DateTimePicker",
	"DEFAULT_PRESETS",
	"DeltaBadge",
	"DescriptionList",
	"descriptionListVariants",
	"Drawer",
	"drawerPanelVariants",
	"EmptyState",
	"emptyStateVariants",
	"ErrorState",
	"errorStateVariants",
	"FieldError",
	"FieldHint",
	"FeeRateControl",
	"FileUpload",
	"filterFieldOptions",
	"filterLogViewerLines",
	"filterPaletteItems",
	"findOptionLabel",
	"FormField",
	"FormSection",
	"formatBtcSats",
	"SATOSHI_FRACTION_DIGITS",
	"formatMajorDraft",
	"formatMoneyMinor",
	"CRYPTO_CURRENCIES",
	"CRYPTO_CURRENCY_UI",
	"lookupCurrencySpec",
	"lookupCurrencyUiSpec",
	"currencyAdornmentText",
	"currencyFractionDigits",
	"majorAsciiToMinor",
	"majorNumberToMinor",
	"minorToMajorNumber",
	"parseMajorInput",
	"parsePaymentUri",
	"Input",
	"Label",
	"LedgerRow",
	"ledgerAmountVariants",
	"Loading",
	"loadingVariants",
	"LogViewer",
	"MaskedAccount",
	"Modal",
	"MoneyAmount",
	"MoneyInput",
	"BtcInput",
	"NumberInput",
	"Pagination",
	"Portal",
	"Popover",
	"ProgressBar",
	"progressBarTrackVariants",
	"ProgressGroup",
	"compositeProgress",
	"taskFraction",
	"QuotaMeter",
	"quotaMeterTrackVariants",
	"RadioGroup",
	"resolveAppShellViewport",
	"ResourceGraph",
	"ResizablePanel",
	"SearchInput",
	"Select",
	"SegmentedControl",
	"segmentedControlVariants",
	"SeedPhrase",
	"DEFAULT_WORD_SLOT_CH",
	"Separator",
	"separatorVariants",
	"SideNav",
	"SkipLink",
	"Sparkline",
	"sparklineStrokeVariants",
	"Skeleton",
	"skeletonVariants",
	"Slider",
	"StatDisplay",
	"statDisplayValueVariants",
	"StatusBadge",
	"Stepper",
	"StepperActions",
	"variantForDelta",
	"variantForStatus",
	"variantForTxStatus",
	"Tabs",
	"TabsList",
	"TabsPanel",
	"TabsTrigger",
	"TagInput",
	"TextArea",
	"Timeline",
	"Toast",
	"ToastViewport",
	"Toggle",
	"ToolbarSelect",
	"Tooltip",
	"TopNav",
	"TreeView",
	"truncateMiddle",
	"TxStatusBadge",
	"VisuallyHidden",
	"Workflow",
	"WorkflowActions",
	"WorkflowPanel",
	"WorkflowStep",
	"WorkflowTrack",
	"toastVariants",
	"useControllableState",
	"useDebounce",
]);

const EXPECTED_DATA_TABLE_EXPORTS = new Set([
	"DataTable",
	"DEFAULT_PAGE_SIZE",
	"MAX_PAGE_SIZE",
	"applyRowTransaction",
	"buildDefaultQuery",
	"useDataTableRows",
]);

const EXPECTED_DIFF_EXPORTS = new Set([
	"DiffView",
	"PlanSummary",
	"buildDiffLines",
]);

const EXPECTED_FLOW_EXPORTS = new Set([
	"FlowCanvas",
	"GraphEdgeLayer",
	"GraphHandle",
	"GraphNode",
	"GraphSidecar",
	"GraphStatusRegion",
	"GraphViewport",
	"buildStatusMessage",
	"sameValueKindConnection",
	"useGraphViewport",
]);

const EXPECTED_FLOW_LAYOUT_EXPORTS = new Set(["layoutGraph"]);

describe("public API surface", () => {
	it("exposes exactly the expected set of runtime exports", () => {
		const actualKeys = new Set(Object.keys(lib));

		const missing = [...EXPECTED_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_EXPORTS.has(k);
		});
		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});

	it("exposes the data-table subpath runtime exports", () => {
		const actualKeys = new Set(Object.keys(dataTable));

		const missing = [...EXPECTED_DATA_TABLE_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_DATA_TABLE_EXPORTS.has(k);
		});
		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});

	it("exposes the diff subpath runtime exports", () => {
		const actualKeys = new Set(Object.keys(diff));

		const missing = [...EXPECTED_DIFF_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_DIFF_EXPORTS.has(k);
		});
		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});

	it("exposes the flow subpath runtime exports", () => {
		const actualKeys = new Set(Object.keys(flow));

		const missing = [...EXPECTED_FLOW_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_FLOW_EXPORTS.has(k);
		});
		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});

	it("exposes the flow/layout subpath runtime exports", () => {
		const actualKeys = new Set(Object.keys(flowLayout));

		const missing = [...EXPECTED_FLOW_LAYOUT_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_FLOW_LAYOUT_EXPORTS.has(k);
		});
		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});
});
