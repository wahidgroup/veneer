import { Canvas, RailPanel } from "./demoChrome.js";

function AppShellCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				This examples app is the live AppShell: TopNav header, sticky
				SideNav and Controls rail, and page-level scroll for main.
				Toggle the menu to collapse the left nav; use the panel control
				to collapse the rail.
			</p>
		</Canvas>
	);
}

function AppShellKnobs() {
	return (
		<RailPanel
			title="AppShell"
			description="Live AppShell with sticky side panes and document scroll. Header, sidebar, main, and controls rail."
		/>
	);
}

function TopNavCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				TopNav brand is @wahidgroup/veneer. Menu button toggles SideNav
				collapse. End slot holds the theme Moon/Sun control.
			</p>
		</Canvas>
	);
}

function TopNavKnobs() {
	return (
		<RailPanel
			title="TopNav"
			description="Brand, optional menu toggle, start/center/end slots. Theme control sits in end."
		/>
	);
}

function SideNavCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				Left SideNav switches categories (Primitives, Forms, Combobox,
				Shell). Active item uses aria-current. Collapsed mode keeps
				aria-label from the item label.
			</p>
		</Canvas>
	);
}

function SideNavKnobs() {
	return (
		<RailPanel
			title="SideNav"
			description="Left category list. Collapse via TopNav menu for icon rail."
		/>
	);
}

function BreadcrumbsCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				Breadcrumbs above the component tabs track Examples, the active
				category, and the active component. Last crumb is plain text.
			</p>
		</Canvas>
	);
}

function BreadcrumbsKnobs() {
	return (
		<RailPanel
			title="Breadcrumbs"
			description="Trail above component tabs: Examples > category > component."
		/>
	);
}

export {
	AppShellCanvas,
	AppShellKnobs,
	BreadcrumbsCanvas,
	BreadcrumbsKnobs,
	SideNavCanvas,
	SideNavKnobs,
	TopNavCanvas,
	TopNavKnobs,
};
