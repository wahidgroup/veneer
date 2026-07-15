type CategoryId =
	| "primitives"
	| "overlays"
	| "forms"
	| "combobox"
	| "shell"
	| "workflow"
	| "data";

interface CatalogComponent {
	id: string;
	label: string;
	description: string;
	/** When true, examples UI shows an API badge on the section/tab title. */
	apiDriven?: boolean;
}

interface CatalogCategory {
	id: CategoryId;
	label: string;
	/** When false, category renders one stacked page (no component Tabs). */
	showTabs?: boolean;
	components: CatalogComponent[];
}

const CATALOG: CatalogCategory[] = [
	{
		id: "primitives",
		label: "Primitives",
		components: [
			{
				id: "alert",
				label: "Alert",
				description:
					"Static inline notice for page or panel context. Prefer Toast for ephemeral feedback.",
			},
			{
				id: "button",
				label: "Button",
				description:
					"Primary actions for consoles and forms. Prefer filled for the main CTA.",
			},
			{
				id: "card",
				label: "Card",
				description:
					"Non-interactive panel chrome for grouping related content.",
			},
			{
				id: "badge",
				label: "Badge",
				description:
					"Status and metadata chips for inventory tables and headers.",
			},
			{
				id: "avatar",
				label: "Avatar",
				description:
					"User / contact identity with image or initials fallback.",
			},
			{
				id: "separator",
				label: "Separator",
				description:
					"Thematic hr break. Horizontal default; vertical for toolbars.",
			},
			{
				id: "accordion",
				label: "Accordion",
				description:
					"APG accordion + Collapsible atom for settings / dense panels.",
			},
			{
				id: "resizable-panel",
				label: "ResizablePanel",
				description:
					"Two-pane split with keyboard-resizable separator.",
			},
			{
				id: "delta-badge",
				label: "DeltaBadge",
				description:
					"+/− change chip with visible prefix (not color-only).",
			},
			{
				id: "tx-status-badge",
				label: "TxStatusBadge",
				description:
					"Unconfirmed / confirming / confirmed / failed for chain activity.",
			},
			{
				id: "loading",
				label: "Loading",
				description:
					"Spinner, stacked skeleton lines, and single-bone Skeleton shapes.",
			},
			{
				id: "progress-bar",
				label: "ProgressBar",
				description:
					"Leaf bar + ProgressGroup. Nest job Start/Stop/Reset + size/indeterminate knobs.",
				apiDriven: true,
			},
			{
				id: "circular-progress",
				label: "CircularProgress",
				description:
					"Compact progress ring. Nest job animation + size/indeterminate knobs.",
				apiDriven: true,
			},
			{
				id: "quota-meter",
				label: "QuotaMeter",
				description:
					"Soft-limit gauge (role=meter). Nest consume/release + size/label knobs.",
				apiDriven: true,
			},
			{
				id: "visually-hidden",
				label: "VisuallyHidden",
				description:
					"Clip-path hide for screen-reader-only context text.",
			},
			{
				id: "empty-state",
				label: "EmptyState",
				description:
					"No-results / first-run CTA. Use size sm inside DataTable empty.",
			},
			{
				id: "error-state",
				label: "ErrorState",
				description:
					"Failure vs forbidden chrome. Distinct from EmptyState; Retry / Request access.",
			},
			{
				id: "copy-button",
				label: "CopyButton",
				description:
					"Copy ARN/ID to clipboard with brief copied affordance.",
			},
			{
				id: "status-badge",
				label: "StatusBadge",
				description:
					"Running / Failed / Drifted chips mapped onto Badge tones.",
			},
		],
	},
	{
		id: "overlays",
		label: "Overlays",
		components: [
			{
				id: "modal",
				label: "Modal",
				description:
					"Dialog with backdrop, Esc, focus trap, and scroll lock.",
			},
			{
				id: "drawer",
				label: "Drawer",
				description:
					"Edge sheet dialog (APG modal). Open from a list row; side top|right|bottom|left.",
			},
			{
				id: "confirm-dialog",
				label: "ConfirmDialog",
				description:
					"Modal confirm with optional typed phrase for destroy.",
			},
			{
				id: "tooltip",
				label: "Tooltip",
				description:
					"Hover or focus to reveal truncated IDs and hints.",
			},
			{
				id: "popover",
				label: "Popover",
				description:
					"Non-modal floating panel for interactive extras. Esc / outside dismiss.",
			},
			{
				id: "command-palette",
				label: "CommandPalette",
				description:
					"Modal jump/command list. Nest catalog + title/placeholder/empty knobs.",
				apiDriven: true,
			},
			{
				id: "action-menu",
				label: "ActionMenu",
				description:
					"Portaled row actions with keyboard menu navigation.",
			},
			{
				id: "context-menu",
				label: "ContextMenu",
				description:
					"Right-click APG menu. Esc and outside click dismiss.",
			},
			{
				id: "toast",
				label: "Toast",
				description:
					"Knobs feed the next push. Stack inherits viewport corner.",
			},
		],
	},
	{
		id: "forms",
		label: "Forms",
		components: [
			{
				id: "form-field",
				label: "FormField",
				description:
					"Compose Label / hint / error around controls. Invalid state uses semantic danger tokens.",
			},
			{
				id: "text-select",
				label: "TextArea + Select",
				description:
					"Multi-line notes and region listbox for deploy wizards.",
			},
			{
				id: "combobox",
				label: "Combobox",
				description:
					"Searchable listbox. Same component for single and multi.",
			},
			{
				id: "choices",
				label: "Checkbox / Radio / Toggle",
				description:
					"Boolean and exclusive choices for network placement and feature flags.",
			},
			{
				id: "search",
				label: "SearchInput",
				description:
					"Debounced search for inventory filters. Clear control appears when non-empty.",
			},
			{
				id: "deploy-options",
				label: "Deploy options",
				description:
					"TagInput, NumberInput, Slider, DateTimePicker, FileUpload.",
			},
			{
				id: "money-input",
				label: "MoneyInput",
				description:
					"FormField + amount entry (fiat + built-in BTC). BtcInput + SegmentedControl for unit.",
			},
			{
				id: "field-error",
				label: "FieldError",
				description:
					"Use when composing custom layouts outside FormField.",
			},
		],
	},
	{
		id: "combobox",
		label: "Combobox",
		showTabs: false,
		components: [
			{
				id: "single",
				label: "Single select",
				description:
					'Nest typeahead (`filterMode="remote"` + `onSearchChange`) with add/remove/reset option mutations.',
				apiDriven: true,
			},
			{
				id: "multi",
				label: "Multi select",
				description:
					"Same component with multiple. Selected values render as removable chips.",
			},
			{
				id: "states",
				label: "States",
				description:
					"Loading panel, non-searchable list, and disabled control.",
			},
		],
	},
	{
		id: "shell",
		label: "Shell",
		components: [
			{
				id: "app-shell",
				label: "AppShell",
				description:
					"Live AppShell with sticky side panes and document scroll. Rail position End|Bottom; collapsible sidebar and controls rail.",
			},
			{
				id: "top-nav",
				label: "TopNav",
				description:
					"Brand, optional menu toggle, start/center/end slots. Theme control sits in end.",
			},
			{
				id: "side-nav",
				label: "SideNav",
				description:
					"Left category list. Collapse via TopNav menu for icon rail.",
			},
			{
				id: "skip-link",
				label: "SkipLink",
				description:
					"Bypass link to main (G1). First Tab reveals the link; AppShell main is id=main.",
			},
			{
				id: "breadcrumbs",
				label: "Breadcrumbs",
				description:
					"Trail above the canvas: Examples > category (> component when tabs are used).",
			},
			{
				id: "tabs",
				label: "Tabs",
				description:
					"Underline tablist + panels. Arrow keys move selection.",
			},
			{
				id: "segmented-control",
				label: "SegmentedControl",
				description:
					"Exclusive radiogroup strip for unit switches and view modes.",
			},
			{
				id: "stepper",
				label: "Stepper",
				description:
					"Linear form wizard steps (checkout / KYC). Not Workflow.",
			},
			{
				id: "toolbar-select",
				label: "ToolbarSelect",
				description:
					"Ghost chrome single-select for TopNav (account / region compose).",
			},
		],
	},
	{
		id: "workflow",
		label: "Workflow",
		components: [
			{
				id: "workflow",
				label: "Workflow",
				description:
					"Deploy flow knobs: linear vs multi-node, orientation, add/remove node. Track uses markers, connectors, labels under.",
			},
			{
				id: "diff-view",
				label: "DiffView",
				description:
					"Line diffs (code/docs) and tree diffs (IaC resources + attributes).",
			},
			{
				id: "plan-summary",
				label: "PlanSummary",
				description:
					"Create/update/destroy/replace counts with kind filters over DiffView tree.",
			},
			{
				id: "log-viewer",
				label: "LogViewer",
				description:
					"Live-tail panel: Nest stream + WS filters; follow/pause, level chips, copy.",
				apiDriven: true,
			},
		],
	},
	{
		id: "data",
		label: "Data",
		components: [
			{
				id: "data-table",
				label: "DataTable",
				description:
					"Nest list with full server query; live WS patches; empty slot.",
				apiDriven: true,
			},
			{
				id: "pagination",
				label: "Pagination",
				description:
					"Standalone Prev/Next chrome with optional item range. DataTable reuses the same control.",
			},
			{
				id: "description-list",
				label: "DescriptionList",
				description:
					"Resource attribute key/value pairs for detail panels.",
			},
			{
				id: "stat-display",
				label: "StatDisplay",
				description:
					"Metric tiles on Card. Tone styles value text and pairs with Badge or caption.",
			},
			{
				id: "money-chrome",
				label: "Money & identity",
				description:
					"MoneyAmount, BtcAmount, AddressDisplay, MaskedAccount. Display-only finance/crypto chrome.",
			},
			{
				id: "activity-surfaces",
				label: "Activity surfaces",
				description:
					"ActivityRow, LedgerRow, FeeRateControl, Sparkline, PaymentUri helpers.",
			},
			{
				id: "code-block",
				label: "CodeBlock",
				description:
					"Read-only plain code with optional language, line numbers, and CopyButton.",
			},
			{
				id: "chip-group",
				label: "ChipGroup",
				description:
					"Multi-select filter chips with aria-pressed toggles and optional dismiss.",
			},
			{
				id: "timeline",
				label: "Timeline",
				description:
					"Ordered deploy/event history with rail and optional StatusBadge.",
			},
			{
				id: "tree-view",
				label: "TreeView",
				description:
					"Nested network/inventory tree with APG keyboard and expand.",
			},
			{
				id: "resource-graph",
				label: "ResourceGraph",
				description:
					"SVG dependency map with accessible edge list. No canvas/pan-zoom in v1.",
			},
			{
				id: "flow-canvas",
				label: "FlowCanvas",
				description:
					"API-backed deposit-split playground: typed ports, elk layout, knob triggers (@wahidgroup/veneer/flow).",
				apiDriven: true,
			},
			{
				id: "seed-phrase",
				label: "SeedPhrase",
				description: "Backup word grid presentation only.",
			},
		],
	},
];

function getCategory(id: CategoryId): CatalogCategory {
	for (const category of CATALOG) {
		if (category.id === id) {
			return category;
		}
	}

	return CATALOG[0];
}

function getComponent(
	categoryId: CategoryId,
	componentId: string,
): CatalogComponent {
	const category = getCategory(categoryId);
	for (const component of category.components) {
		if (component.id === componentId) {
			return component;
		}
	}

	return category.components[0];
}

function firstComponentId(categoryId: CategoryId): string {
	return getCategory(categoryId).components[0].id;
}

export type { CategoryId, CatalogCategory, CatalogComponent };
export { CATALOG, firstComponentId, getCategory, getComponent };
