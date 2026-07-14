import { describe, expect, it } from "vitest";
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
	"Checkbox",
	"cn",
	"Combobox",
	"ConfirmDialog",
	"controlVariants",
	"CopyButton",
	"cva",
	"DataTable",
	"DateTimePicker",
	"DEFAULT_PAGE_SIZE",
	"DescriptionList",
	"descriptionListVariants",
	"DiffView",
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
	"MAX_PAGE_SIZE",
	"Modal",
	"NumberInput",
	"Pagination",
	"PlanSummary",
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
	"Skeleton",
	"skeletonVariants",
	"Slider",
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
	"applyRowTransaction",
	"buildDefaultQuery",
	"buildDiffLines",
	"toastVariants",
	"useDataTableRows",
	"useDebounce",
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
});
