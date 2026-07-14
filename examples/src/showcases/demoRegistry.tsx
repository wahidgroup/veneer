import type { ComponentType, ReactNode } from "react";

import type { CategoryId } from "../catalog.js";
import { PassthroughProvider } from "./demoChrome.js";
import {
	ComboboxCategoryCanvas,
	ComboboxCategoryKnobs,
	ComboboxCategoryProvider,
} from "./comboboxDemos.js";
import {
	ChipGroupCanvas,
	ChipGroupDemoProvider,
	ChipGroupKnobs,
	CodeBlockCanvas,
	CodeBlockDemoProvider,
	CodeBlockKnobs,
	DescriptionListCanvas,
	DescriptionListDemoProvider,
	DescriptionListKnobs,
	EmptyTableCanvas,
	EmptyTableDemoProvider,
	EmptyTableKnobs,
	LivePatchCanvas,
	LivePatchDemoProvider,
	LivePatchKnobs,
	PaginationCanvas,
	PaginationDemoProvider,
	PaginationKnobs,
	ServerPageCanvas,
	ServerPageDemoProvider,
	ServerPageKnobs,
	StatDisplayCanvas,
	StatDisplayDemoProvider,
	StatDisplayKnobs,
	TimelineCanvas,
	TimelineDemoProvider,
	TimelineKnobs,
} from "./dataDemos.js";
import {
	ChoicesCanvas,
	ChoicesDemoProvider,
	ChoicesKnobs,
	DeployCanvas,
	DeployDemoProvider,
	DeployKnobs,
	FieldErrorCanvas,
	FieldErrorKnobs,
	FormFieldCanvas,
	FormFieldDemoProvider,
	FormFieldKnobs,
	FormsComboboxCanvas,
	FormsComboboxDemoProvider,
	FormsComboboxKnobs,
	SearchCanvas,
	SearchDemoProvider,
	SearchKnobs,
	TextSelectCanvas,
	TextSelectDemoProvider,
	TextSelectKnobs,
} from "./formsDemos.js";
import {
	ActionMenuCanvas,
	ActionMenuDemoProvider,
	ActionMenuKnobs,
	AlertCanvas,
	AlertDemoProvider,
	AlertKnobs,
	BadgeCanvas,
	BadgeDemoProvider,
	BadgeKnobs,
	ButtonCanvas,
	ButtonDemoProvider,
	ButtonKnobs,
	CardCanvas,
	CardKnobs,
	ConfirmCanvas,
	ConfirmDemoProvider,
	ConfirmKnobs,
	DrawerCanvas,
	DrawerDemoProvider,
	DrawerKnobs,
	EmptyStateCanvas,
	EmptyStateKnobs,
	ErrorStateCanvas,
	ErrorStateKnobs,
	CopyButtonCanvas,
	CopyButtonKnobs,
	StatusBadgeCanvas,
	StatusBadgeKnobs,
	LoadingCanvas,
	LoadingDemoProvider,
	LoadingKnobs,
	ProgressBarCanvas,
	ProgressBarKnobs,
	ModalCanvas,
	ModalDemoProvider,
	ModalKnobs,
	TabsCanvas,
	TabsKnobs,
	ToastCanvas,
	ToastDemoProvider,
	ToastKnobs,
	TooltipCanvas,
	TooltipDemoProvider,
	TooltipKnobs,
} from "./primitivesDemos.js";
import {
	AppShellCanvas,
	AppShellKnobs,
	BreadcrumbsCanvas,
	BreadcrumbsKnobs,
	SideNavCanvas,
	SideNavKnobs,
	SkipLinkCanvas,
	SkipLinkKnobs,
	TopNavCanvas,
	TopNavKnobs,
	ToolbarSelectCanvas,
	ToolbarSelectKnobs,
} from "./shellDemos.js";
import {
	LinearDeployCanvas,
	LinearDeployKnobs,
	MultiNodeCanvas,
	MultiNodeKnobs,
	DiffViewCanvas,
	DiffViewKnobs,
	PlanSummaryCanvas,
	PlanSummaryKnobs,
} from "./workflowDemos.js";

interface DemoEntry {
	Provider: ComponentType<{ children: ReactNode }>;
	Canvas: ComponentType;
	Knobs: ComponentType;
}

const PRIMITIVES: Record<string, DemoEntry> = {
	alert: {
		Provider: AlertDemoProvider,
		Canvas: AlertCanvas,
		Knobs: AlertKnobs,
	},
	button: {
		Provider: ButtonDemoProvider,
		Canvas: ButtonCanvas,
		Knobs: ButtonKnobs,
	},
	card: {
		Provider: PassthroughProvider,
		Canvas: CardCanvas,
		Knobs: CardKnobs,
	},
	badge: {
		Provider: BadgeDemoProvider,
		Canvas: BadgeCanvas,
		Knobs: BadgeKnobs,
	},
	loading: {
		Provider: LoadingDemoProvider,
		Canvas: LoadingCanvas,
		Knobs: LoadingKnobs,
	},
	"progress-bar": {
		Provider: PassthroughProvider,
		Canvas: ProgressBarCanvas,
		Knobs: ProgressBarKnobs,
	},
	"empty-state": {
		Provider: PassthroughProvider,
		Canvas: EmptyStateCanvas,
		Knobs: EmptyStateKnobs,
	},
	"error-state": {
		Provider: PassthroughProvider,
		Canvas: ErrorStateCanvas,
		Knobs: ErrorStateKnobs,
	},
	"copy-button": {
		Provider: PassthroughProvider,
		Canvas: CopyButtonCanvas,
		Knobs: CopyButtonKnobs,
	},
	"status-badge": {
		Provider: PassthroughProvider,
		Canvas: StatusBadgeCanvas,
		Knobs: StatusBadgeKnobs,
	},
};

const OVERLAYS: Record<string, DemoEntry> = {
	modal: {
		Provider: ModalDemoProvider,
		Canvas: ModalCanvas,
		Knobs: ModalKnobs,
	},
	drawer: {
		Provider: DrawerDemoProvider,
		Canvas: DrawerCanvas,
		Knobs: DrawerKnobs,
	},
	"confirm-dialog": {
		Provider: ConfirmDemoProvider,
		Canvas: ConfirmCanvas,
		Knobs: ConfirmKnobs,
	},
	tooltip: {
		Provider: TooltipDemoProvider,
		Canvas: TooltipCanvas,
		Knobs: TooltipKnobs,
	},
	"action-menu": {
		Provider: ActionMenuDemoProvider,
		Canvas: ActionMenuCanvas,
		Knobs: ActionMenuKnobs,
	},
	toast: {
		Provider: ToastDemoProvider,
		Canvas: ToastCanvas,
		Knobs: ToastKnobs,
	},
};

const FORMS: Record<string, DemoEntry> = {
	"form-field": {
		Provider: FormFieldDemoProvider,
		Canvas: FormFieldCanvas,
		Knobs: FormFieldKnobs,
	},
	"text-select": {
		Provider: TextSelectDemoProvider,
		Canvas: TextSelectCanvas,
		Knobs: TextSelectKnobs,
	},
	combobox: {
		Provider: FormsComboboxDemoProvider,
		Canvas: FormsComboboxCanvas,
		Knobs: FormsComboboxKnobs,
	},
	choices: {
		Provider: ChoicesDemoProvider,
		Canvas: ChoicesCanvas,
		Knobs: ChoicesKnobs,
	},
	search: {
		Provider: SearchDemoProvider,
		Canvas: SearchCanvas,
		Knobs: SearchKnobs,
	},
	"deploy-options": {
		Provider: DeployDemoProvider,
		Canvas: DeployCanvas,
		Knobs: DeployKnobs,
	},
	"field-error": {
		Provider: PassthroughProvider,
		Canvas: FieldErrorCanvas,
		Knobs: FieldErrorKnobs,
	},
};

const SHELL: Record<string, DemoEntry> = {
	"app-shell": {
		Provider: PassthroughProvider,
		Canvas: AppShellCanvas,
		Knobs: AppShellKnobs,
	},
	"top-nav": {
		Provider: PassthroughProvider,
		Canvas: TopNavCanvas,
		Knobs: TopNavKnobs,
	},
	"side-nav": {
		Provider: PassthroughProvider,
		Canvas: SideNavCanvas,
		Knobs: SideNavKnobs,
	},
	"skip-link": {
		Provider: PassthroughProvider,
		Canvas: SkipLinkCanvas,
		Knobs: SkipLinkKnobs,
	},
	breadcrumbs: {
		Provider: PassthroughProvider,
		Canvas: BreadcrumbsCanvas,
		Knobs: BreadcrumbsKnobs,
	},
	tabs: {
		Provider: PassthroughProvider,
		Canvas: TabsCanvas,
		Knobs: TabsKnobs,
	},
	"toolbar-select": {
		Provider: PassthroughProvider,
		Canvas: ToolbarSelectCanvas,
		Knobs: ToolbarSelectKnobs,
	},
};

const WORKFLOW: Record<string, DemoEntry> = {
	linear: {
		Provider: PassthroughProvider,
		Canvas: LinearDeployCanvas,
		Knobs: LinearDeployKnobs,
	},
	nodes: {
		Provider: PassthroughProvider,
		Canvas: MultiNodeCanvas,
		Knobs: MultiNodeKnobs,
	},
	"diff-view": {
		Provider: PassthroughProvider,
		Canvas: DiffViewCanvas,
		Knobs: DiffViewKnobs,
	},
	"plan-summary": {
		Provider: PassthroughProvider,
		Canvas: PlanSummaryCanvas,
		Knobs: PlanSummaryKnobs,
	},
};

const DATA: Record<string, DemoEntry> = {
	"server-page": {
		Provider: ServerPageDemoProvider,
		Canvas: ServerPageCanvas,
		Knobs: ServerPageKnobs,
	},
	"live-patch": {
		Provider: LivePatchDemoProvider,
		Canvas: LivePatchCanvas,
		Knobs: LivePatchKnobs,
	},
	pagination: {
		Provider: PaginationDemoProvider,
		Canvas: PaginationCanvas,
		Knobs: PaginationKnobs,
	},
	empty: {
		Provider: EmptyTableDemoProvider,
		Canvas: EmptyTableCanvas,
		Knobs: EmptyTableKnobs,
	},
	"description-list": {
		Provider: DescriptionListDemoProvider,
		Canvas: DescriptionListCanvas,
		Knobs: DescriptionListKnobs,
	},
	"stat-display": {
		Provider: StatDisplayDemoProvider,
		Canvas: StatDisplayCanvas,
		Knobs: StatDisplayKnobs,
	},
	"code-block": {
		Provider: CodeBlockDemoProvider,
		Canvas: CodeBlockCanvas,
		Knobs: CodeBlockKnobs,
	},
	"chip-group": {
		Provider: ChipGroupDemoProvider,
		Canvas: ChipGroupCanvas,
		Knobs: ChipGroupKnobs,
	},
	timeline: {
		Provider: TimelineDemoProvider,
		Canvas: TimelineCanvas,
		Knobs: TimelineKnobs,
	},
};

function getDemo(category: CategoryId, component: string): DemoEntry {
	if (category === "primitives") {
		const entry = PRIMITIVES[component];
		if (entry !== undefined) {
			return entry;
		}

		return PRIMITIVES.alert;
	}
	if (category === "overlays") {
		const entry = OVERLAYS[component];
		if (entry !== undefined) {
			return entry;
		}

		return OVERLAYS.modal;
	}
	if (category === "forms") {
		const entry = FORMS[component];
		if (entry !== undefined) {
			return entry;
		}

		return FORMS["form-field"];
	}
	if (category === "combobox") {
		return {
			Provider: ComboboxCategoryProvider,
			Canvas: ComboboxCategoryCanvas,
			Knobs: ComboboxCategoryKnobs,
		};
	}
	if (category === "shell") {
		const entry = SHELL[component];
		if (entry !== undefined) {
			return entry;
		}

		return SHELL["app-shell"];
	}
	if (category === "workflow") {
		const entry = WORKFLOW[component];
		if (entry !== undefined) {
			return entry;
		}

		return WORKFLOW.linear;
	}
	if (category === "data") {
		const entry = DATA[component];
		if (entry !== undefined) {
			return entry;
		}

		return DATA["server-page"];
	}

	const _exhaustive: never = category;
	return _exhaustive;
}

export type { DemoEntry };
export { getDemo };
