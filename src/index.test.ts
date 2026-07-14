import { describe, expect, it } from "vitest";

import * as dataTable from "./data-table.js";
import * as diff from "./diff.js";
import * as lib from "./index.js";

/**
 * Runtime export lock. Grow as public API expands.
 */
const EXPECTED_EXPORTS = new Set([
	"ActionMenu",
	"Alert",
	"alertVariants",
	"APP_SHELL_COMPACT_QUERY",
	"APP_SHELL_MOBILE_MAX_PX",
	"APP_SHELL_MOBILE_QUERY",
	"APP_SHELL_TABLET_MAX_PX",
	"AppShell",
	"Badge",
	"badgeVariants",
	"Breadcrumbs",
	"Button",
	"buttonVariants",
	"Card",
	"cardVariants",
	"Checkbox",
	"cn",
	"Combobox",
	"ConfirmDialog",
	"controlVariants",
	"CopyButton",
	"cva",
	"DateTimePicker",
	"DescriptionList",
	"descriptionListVariants",
	"Drawer",
	"drawerPanelVariants",
	"EmptyState",
	"emptyStateVariants",
	"FieldError",
	"FieldHint",
	"FileUpload",
	"FormField",
	"FormSection",
	"Input",
	"Label",
	"Loading",
	"loadingVariants",
	"Modal",
	"NumberInput",
	"Pagination",
	"Portal",
	"ProgressBar",
	"progressBarTrackVariants",
	"ProgressGroup",
	"compositeProgress",
	"taskFraction",
	"RadioGroup",
	"resolveAppShellViewport",
	"SearchInput",
	"Select",
	"SideNav",
	"SkipLink",
	"Skeleton",
	"skeletonVariants",
	"Slider",
	"StatDisplay",
	"statDisplayValueVariants",
	"StatusBadge",
	"variantForStatus",
	"Tabs",
	"TabsList",
	"TabsPanel",
	"TabsTrigger",
	"TagInput",
	"TextArea",
	"Toast",
	"ToastViewport",
	"Toggle",
	"ToolbarSelect",
	"Tooltip",
	"TopNav",
	"Workflow",
	"WorkflowActions",
	"WorkflowPanel",
	"WorkflowStep",
	"WorkflowTrack",
	"toastVariants",
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
});
