import type { ComponentType, ReactNode } from "react";

import type { CategoryId } from "../catalog.js";
import { PassthroughProvider } from "./demoChrome.js";
import {
	ComboboxCategoryCanvas,
	ComboboxCategoryKnobs,
	ComboboxCategoryProvider,
} from "./comboboxDemos.js";
import {
	EmptyTableCanvas,
	EmptyTableKnobs,
	LivePatchCanvas,
	LivePatchKnobs,
	PaginationCanvas,
	PaginationKnobs,
	ServerPageCanvas,
	ServerPageKnobs,
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
	ConfirmCanvas,
	ConfirmDemoProvider,
	ConfirmKnobs,
	EmptyStateCanvas,
	EmptyStateKnobs,
	LoadingCanvas,
	LoadingDemoProvider,
	LoadingKnobs,
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
	TopNavCanvas,
	TopNavKnobs,
} from "./shellDemos.js";
import {
	LinearDeployCanvas,
	LinearDeployKnobs,
	MultiNodeCanvas,
	MultiNodeKnobs,
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
	"empty-state": {
		Provider: PassthroughProvider,
		Canvas: EmptyStateCanvas,
		Knobs: EmptyStateKnobs,
	},
};

const OVERLAYS: Record<string, DemoEntry> = {
	modal: {
		Provider: ModalDemoProvider,
		Canvas: ModalCanvas,
		Knobs: ModalKnobs,
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
};

const DATA: Record<string, DemoEntry> = {
	"server-page": {
		Provider: PassthroughProvider,
		Canvas: ServerPageCanvas,
		Knobs: ServerPageKnobs,
	},
	"live-patch": {
		Provider: PassthroughProvider,
		Canvas: LivePatchCanvas,
		Knobs: LivePatchKnobs,
	},
	pagination: {
		Provider: PassthroughProvider,
		Canvas: PaginationCanvas,
		Knobs: PaginationKnobs,
	},
	empty: {
		Provider: PassthroughProvider,
		Canvas: EmptyTableCanvas,
		Knobs: EmptyTableKnobs,
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

	const entry = SHELL[component];
	if (entry !== undefined) {
		return entry;
	}

	return SHELL["app-shell"];
}

export type { DemoEntry };
export { getDemo };
