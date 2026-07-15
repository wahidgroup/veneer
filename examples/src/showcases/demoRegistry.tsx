import type { ComponentType, ReactNode } from "react";

import type { CategoryId } from "../catalog.js";
import { PassthroughProvider } from "./demoChrome.js";
import {
	ComboboxCategoryCanvas,
	ComboboxCategoryKnobs,
	ComboboxCategoryProvider,
} from "./comboboxDemos.js";
import {
	ActivitySurfacesCanvas,
	ActivitySurfacesKnobs,
	ChipGroupCanvas,
	ChipGroupDemoProvider,
	ChipGroupKnobs,
	CodeBlockCanvas,
	CodeBlockDemoProvider,
	CodeBlockKnobs,
	DataTableCanvas,
	DataTableDemoProvider,
	DataTableKnobs,
	DescriptionListCanvas,
	DescriptionListDemoProvider,
	DescriptionListKnobs,
	MoneyChromeCanvas,
	MoneyChromeKnobs,
	PaginationCanvas,
	PaginationDemoProvider,
	PaginationKnobs,
	ResourceGraphCanvas,
	ResourceGraphKnobs,
	SeedPhraseCanvas,
	SeedPhraseDemoProvider,
	SeedPhraseKnobs,
	StatDisplayCanvas,
	StatDisplayDemoProvider,
	StatDisplayKnobs,
	TimelineCanvas,
	TimelineDemoProvider,
	TimelineKnobs,
	TreeViewCanvas,
	TreeViewDemoProvider,
	TreeViewKnobs,
} from "./dataDemos.js";
import {
	FlowCanvasCanvas,
	FlowCanvasDemoProvider,
	FlowCanvasKnobs,
} from "./flowDemos.js";
import {
	ChoicesCanvas,
	ChoicesDemoProvider,
	ChoicesKnobs,
	ColorPickerCanvas,
	ColorPickerDemoProvider,
	ColorPickerKnobs,
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
	MoneyInputCanvas,
	MoneyInputDemoProvider,
	MoneyInputKnobs,
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
	AccordionCanvas,
	AccordionKnobs,
	AlertCanvas,
	AlertDemoProvider,
	AlertKnobs,
	AvatarCanvas,
	AvatarKnobs,
	BadgeCanvas,
	BadgeDemoProvider,
	BadgeKnobs,
	ButtonCanvas,
	ButtonDemoProvider,
	ButtonKnobs,
	CardCanvas,
	CardKnobs,
	CommandPaletteCanvas,
	CommandPaletteDemoProvider,
	CommandPaletteKnobs,
	ConfirmCanvas,
	ConfirmDemoProvider,
	ConfirmKnobs,
	ContextMenuCanvas,
	ContextMenuKnobs,
	CopyButtonCanvas,
	CopyButtonKnobs,
	DrawerCanvas,
	DrawerDemoProvider,
	DrawerKnobs,
	EmptyStateCanvas,
	EmptyStateKnobs,
	ErrorStateCanvas,
	ErrorStateKnobs,
	LoadingCanvas,
	LoadingDemoProvider,
	LoadingKnobs,
	ModalCanvas,
	ModalDemoProvider,
	ModalKnobs,
	PopoverCanvas,
	PopoverDemoProvider,
	PopoverKnobs,
	ProgressBarCanvas,
	ProgressBarKnobs,
	ProgressJobDemoProvider,
	QuotaMeterCanvas,
	QuotaMeterDemoProvider,
	QuotaMeterKnobs,
	ResizablePanelCanvas,
	ResizablePanelDemoProvider,
	ResizablePanelKnobs,
	SeparatorCanvas,
	SeparatorKnobs,
	TabsCanvas,
	TabsKnobs,
	ToastCanvas,
	ToastDemoProvider,
	ToastKnobs,
	TooltipCanvas,
	TooltipDemoProvider,
	TooltipKnobs,
	VisuallyHiddenCanvas,
	VisuallyHiddenKnobs,
} from "./primitivesDemos.js";
import {
	AppShellCanvas,
	AppShellKnobs,
	BreadcrumbsCanvas,
	BreadcrumbsKnobs,
	SegmentedControlCanvas,
	SegmentedControlDemoProvider,
	SegmentedControlKnobs,
	SideNavCanvas,
	SideNavKnobs,
	SkipLinkCanvas,
	SkipLinkKnobs,
	StepperCanvas,
	StepperKnobs,
	ToolbarSelectCanvas,
	ToolbarSelectKnobs,
	TopNavCanvas,
	TopNavKnobs,
} from "./shellDemos.js";
import {
	DiffViewCanvas,
	DiffViewKnobs,
	LogViewerCanvas,
	LogViewerDemoProvider,
	LogViewerKnobs,
	PlanSummaryCanvas,
	PlanSummaryKnobs,
	WorkflowCanvas,
	WorkflowDemoProvider,
	WorkflowKnobs,
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
		Provider: ProgressJobDemoProvider,
		Canvas: ProgressBarCanvas,
		Knobs: ProgressBarKnobs,
	},
	"quota-meter": {
		Provider: QuotaMeterDemoProvider,
		Canvas: QuotaMeterCanvas,
		Knobs: QuotaMeterKnobs,
	},
	"visually-hidden": {
		Provider: PassthroughProvider,
		Canvas: VisuallyHiddenCanvas,
		Knobs: VisuallyHiddenKnobs,
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
	avatar: {
		Provider: PassthroughProvider,
		Canvas: AvatarCanvas,
		Knobs: AvatarKnobs,
	},
	separator: {
		Provider: PassthroughProvider,
		Canvas: SeparatorCanvas,
		Knobs: SeparatorKnobs,
	},
	accordion: {
		Provider: PassthroughProvider,
		Canvas: AccordionCanvas,
		Knobs: AccordionKnobs,
	},
	"resizable-panel": {
		Provider: ResizablePanelDemoProvider,
		Canvas: ResizablePanelCanvas,
		Knobs: ResizablePanelKnobs,
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
	popover: {
		Provider: PopoverDemoProvider,
		Canvas: PopoverCanvas,
		Knobs: PopoverKnobs,
	},
	"command-palette": {
		Provider: CommandPaletteDemoProvider,
		Canvas: CommandPaletteCanvas,
		Knobs: CommandPaletteKnobs,
	},
	"action-menu": {
		Provider: ActionMenuDemoProvider,
		Canvas: ActionMenuCanvas,
		Knobs: ActionMenuKnobs,
	},
	"context-menu": {
		Provider: PassthroughProvider,
		Canvas: ContextMenuCanvas,
		Knobs: ContextMenuKnobs,
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
	"money-input": {
		Provider: MoneyInputDemoProvider,
		Canvas: MoneyInputCanvas,
		Knobs: MoneyInputKnobs,
	},
	"color-picker": {
		Provider: ColorPickerDemoProvider,
		Canvas: ColorPickerCanvas,
		Knobs: ColorPickerKnobs,
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
	"segmented-control": {
		Provider: SegmentedControlDemoProvider,
		Canvas: SegmentedControlCanvas,
		Knobs: SegmentedControlKnobs,
	},
	stepper: {
		Provider: PassthroughProvider,
		Canvas: StepperCanvas,
		Knobs: StepperKnobs,
	},
	"toolbar-select": {
		Provider: PassthroughProvider,
		Canvas: ToolbarSelectCanvas,
		Knobs: ToolbarSelectKnobs,
	},
};

const WORKFLOW: Record<string, DemoEntry> = {
	workflow: {
		Provider: WorkflowDemoProvider,
		Canvas: WorkflowCanvas,
		Knobs: WorkflowKnobs,
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
	"log-viewer": {
		Provider: LogViewerDemoProvider,
		Canvas: LogViewerCanvas,
		Knobs: LogViewerKnobs,
	},
};

const DATA: Record<string, DemoEntry> = {
	"data-table": {
		Provider: DataTableDemoProvider,
		Canvas: DataTableCanvas,
		Knobs: DataTableKnobs,
	},
	pagination: {
		Provider: PaginationDemoProvider,
		Canvas: PaginationCanvas,
		Knobs: PaginationKnobs,
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
	"money-chrome": {
		Provider: PassthroughProvider,
		Canvas: MoneyChromeCanvas,
		Knobs: MoneyChromeKnobs,
	},
	"activity-surfaces": {
		Provider: PassthroughProvider,
		Canvas: ActivitySurfacesCanvas,
		Knobs: ActivitySurfacesKnobs,
	},
	"seed-phrase": {
		Provider: SeedPhraseDemoProvider,
		Canvas: SeedPhraseCanvas,
		Knobs: SeedPhraseKnobs,
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
	"tree-view": {
		Provider: TreeViewDemoProvider,
		Canvas: TreeViewCanvas,
		Knobs: TreeViewKnobs,
	},
	"resource-graph": {
		Provider: PassthroughProvider,
		Canvas: ResourceGraphCanvas,
		Knobs: ResourceGraphKnobs,
	},
	"flow-canvas": {
		Provider: FlowCanvasDemoProvider,
		Canvas: FlowCanvasCanvas,
		Knobs: FlowCanvasKnobs,
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

		return WORKFLOW.workflow;
	}
	if (category === "data") {
		const entry = DATA[component];
		if (entry !== undefined) {
			return entry;
		}

		return DATA["data-table"];
	}

	const _exhaustive: never = category;
	return _exhaustive;
}

export type { DemoEntry };
export { getDemo };
