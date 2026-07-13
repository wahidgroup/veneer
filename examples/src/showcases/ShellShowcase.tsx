import { useState } from "react";
import { Boxes, Home, Settings } from "lucide-react";

import {
	AppShell,
	Breadcrumbs,
	Button,
	SideNav,
	TopNav,
} from "@wahidgroup/veneer";

import { DemoRow, ShowcaseSection } from "./ShowcaseSection.js";

/**
 * AppShell + TopNav + SideNav + Breadcrumbs composition demo.
 */
function ShellShowcase() {
	const [collapsed, setCollapsed] = useState(false);
	const [activeId, setActiveId] = useState("overview");

	const items = [
		{
			id: "overview",
			label: "Overview",
			href: "#overview",
			icon: <Home className="size-4 shrink-0" aria-hidden="true" />,
			active: activeId === "overview",
		},
		{
			id: "stacks",
			label: "Stacks",
			href: "#stacks",
			icon: <Boxes className="size-4 shrink-0" aria-hidden="true" />,
			active: activeId === "stacks",
		},
		{
			id: "settings",
			label: "Settings",
			href: "#settings",
			icon: <Settings className="size-4 shrink-0" aria-hidden="true" />,
			active: activeId === "settings",
		},
	];

	return (
		<ShowcaseSection
			title="App shell"
			description="Frame with TopNav menu toggle, SideNav rail, and Breadcrumbs in main."
		>
			<div className="h-[28rem] overflow-hidden rounded-md border border-border">
				<AppShell
					sidebarCollapsed={collapsed}
					header={
						<TopNav
							brand="Veneer Console"
							onMenuClick={() => {
								setCollapsed(!collapsed);
							}}
							end={
								<Button variant="ghost" size="sm">
									Account
								</Button>
							}
						/>
					}
					sidebar={
						<SideNav
							collapsed={collapsed}
							items={items}
							renderLink={({
								href,
								children,
								className,
								...rest
							}) => {
								return (
									<a
										href={href}
										className={className}
										onClick={(event) => {
											event.preventDefault();
											if (href === "#overview") {
												setActiveId("overview");
												return;
											}
											if (href === "#stacks") {
												setActiveId("stacks");
												return;
											}
											if (href === "#settings") {
												setActiveId("settings");
											}
										}}
										{...rest}
									>
										{children}
									</a>
								);
							}}
						/>
					}
				>
					<div className="flex flex-col gap-4 p-4">
						<Breadcrumbs
							items={[
								{ label: "Org", href: "#org" },
								{ label: "Project", href: "#project" },
								{ label: "Overview" },
							]}
						/>
						<p className="text-sm text-muted-foreground">
							Main content scrolls inside the shell. Use the menu
							button to collapse the sidebar.
						</p>
					</div>
				</AppShell>
			</div>
			<DemoRow label="State">
				<span className="text-sm text-muted-foreground">
					Sidebar collapsed: {String(collapsed)} · Active: {activeId}
				</span>
			</DemoRow>
		</ShowcaseSection>
	);
}

export { ShellShowcase };
