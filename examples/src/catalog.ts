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
				id: "loading",
				label: "Loading",
				description:
					"Spinner, stacked skeleton lines, and single-bone Skeleton shapes.",
			},
			{
				id: "progress-bar",
				label: "ProgressBar",
				description:
					"Leaf bar + ProgressGroup parallel lanes. Demo Start/Reset runs three tasks.",
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
				id: "action-menu",
				label: "ActionMenu",
				description:
					"Portaled row actions with keyboard menu navigation.",
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
					"Multi-line notes and native region select for deploy wizards.",
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
					"Searchable listbox. Type to filter; Arrow / Enter to pick; Esc closes.",
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
				id: "linear",
				label: "Linear deploy",
				description:
					"Region → plan → confirm with progress track, panels, and Back/Next.",
			},
			{
				id: "nodes",
				label: "Multi-node",
				description:
					"Cluster + node:* instance steps + review. Add node expands the track.",
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
		],
	},
	{
		id: "data",
		label: "Data",
		components: [
			{
				id: "server-page",
				label: "Server page",
				description:
					"Server-driven paging, sort, search, and column filters. Mock API returns one page plus rowCount.",
			},
			{
				id: "live-patch",
				label: "Live patch",
				description:
					"applyRowTransaction / useDataTableRows patch the current result set by stable row id.",
			},
			{
				id: "pagination",
				label: "Pagination",
				description:
					"Standalone Prev/Next chrome with optional item range. DataTable reuses the same control.",
			},
			{
				id: "empty",
				label: "Empty table",
				description:
					"DataTable empty slot with EmptyState size sm and a create CTA.",
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
