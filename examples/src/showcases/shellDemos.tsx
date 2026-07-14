import { useState } from "react";

import { SkipLink, ToolbarSelect, TopNav } from "@wahidgroup/veneer";

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

function SkipLinkCanvas() {
	return (
		<Canvas>
			<DemoRow label="Focus to reveal">
				<div className="relative w-full max-w-md rounded-md border border-border p-4">
					<SkipLink href="#skip-demo-main" />
					<p className="mb-3 text-sm text-muted-foreground">
						Tab into this panel. SkipLink appears on focus, then
						activates focus on the main landmark below.
					</p>
					<a
						href="#skip-demo-main"
						className="mr-3 text-sm text-primary underline"
					>
						Nav link
					</a>
					<main
						id="skip-demo-main"
						tabIndex={-1}
						className="mt-3 rounded-md border border-border bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Main content receives focus after skip.
					</main>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function SkipLinkKnobs() {
	return (
		<RailPanel
			title="SkipLink"
			description="Bypass link to main (G1). Place first in the page. AppShell main defaults to id=main and tabindex=-1."
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
			description="Ghost chrome listbox. Compose two for account + region in TopNav start, not a domain AccountRegionSwitcher."
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
	SkipLinkCanvas,
	SkipLinkKnobs,
	TopNavCanvas,
	TopNavKnobs,
	ToolbarSelectCanvas,
	ToolbarSelectKnobs,
};
