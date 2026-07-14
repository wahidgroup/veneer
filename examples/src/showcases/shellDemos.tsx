import { useState } from "react";

import { ToolbarSelect, TopNav } from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

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

function ToolbarSelectCanvas() {
	const [account, setAccount] = useState("acct-prod");
	const [region, setRegion] = useState("us-east-1");

	return (
		<Canvas>
			<DemoRow label="TopNav start compose">
				<TopNav
					brand={
						<span className="text-sm font-semibold">console</span>
					}
					start={
						<div className="flex items-center gap-1">
							<ToolbarSelect
								aria-label="Account"
								value={account}
								onChange={setAccount}
								options={[
									{
										value: "acct-prod",
										label: "Prod",
										description: "111122223333",
									},
									{
										value: "acct-stage",
										label: "Staging",
										description: "444455556666",
									},
								]}
							/>
							<ToolbarSelect
								aria-label="Region"
								value={region}
								onChange={setRegion}
								options={[
									{
										value: "us-east-1",
										label: "N. Virginia",
										description: "us-east-1",
									},
									{
										value: "eu-west-1",
										label: "Ireland",
										description: "eu-west-1",
									},
									{
										value: "ap-southeast-1",
										label: "Singapore",
										description: "ap-southeast-1",
									},
								]}
							/>
						</div>
					}
					className="w-full max-w-2xl rounded-md border border-border"
				/>
			</DemoRow>
		</Canvas>
	);
}

function ToolbarSelectKnobs() {
	return (
		<RailPanel
			title="ToolbarSelect"
			description="Ghost chrome listbox. Compose two for account + region in TopNav start — not a domain AccountRegionSwitcher."
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
	ToolbarSelectCanvas,
	ToolbarSelectKnobs,
};
