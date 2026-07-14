import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
	Boxes,
	FormInput,
	Layers,
	LayoutTemplate,
	ListOrdered,
	ListTree,
	Moon,
	PanelRight,
	PanelRightClose,
	Sun,
	Table2,
} from "lucide-react";

import {
	AppShell,
	Breadcrumbs,
	Button,
	SideNav,
	SkipLink,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
	TopNav,
} from "@wahidgroup/veneer";

import { getDemo } from "./showcases/demoRegistry.js";
import { ApiDemoBadge } from "./showcases/demoChrome.js";
import { ShellChromeProvider, useShellChrome } from "./shellChromeContext.js";
import {
	CATALOG,
	firstComponentId,
	getCategory,
	getComponent,
	type CategoryId,
} from "./catalog.js";

type ThemeMode = "light" | "dark";

function readSystemTheme(): ThemeMode {
	if (typeof window === "undefined") {
		return "dark";
	}
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		return "dark";
	}

	return "light";
}

function categoryIcon(id: CategoryId): ReactNode {
	if (id === "primitives") {
		return <Boxes className="size-4 shrink-0" aria-hidden="true" />;
	}
	if (id === "overlays") {
		return <Layers className="size-4 shrink-0" aria-hidden="true" />;
	}
	if (id === "forms") {
		return <FormInput className="size-4 shrink-0" aria-hidden="true" />;
	}
	if (id === "combobox") {
		return <ListTree className="size-4 shrink-0" aria-hidden="true" />;
	}
	if (id === "workflow") {
		return <ListOrdered className="size-4 shrink-0" aria-hidden="true" />;
	}
	if (id === "data") {
		return <Table2 className="size-4 shrink-0" aria-hidden="true" />;
	}

	return <LayoutTemplate className="size-4 shrink-0" aria-hidden="true" />;
}

function parseCategoryId(value: string): CategoryId | null {
	if (value === "primitives") {
		return "primitives";
	}
	if (value === "overlays") {
		return "overlays";
	}
	if (value === "forms") {
		return "forms";
	}
	if (value === "combobox") {
		return "combobox";
	}
	if (value === "shell") {
		return "shell";
	}
	if (value === "workflow") {
		return "workflow";
	}
	if (value === "data") {
		return "data";
	}

	return null;
}

function categoryShowsTabs(categoryId: CategoryId): boolean {
	const category = getCategory(categoryId);
	if (category.showTabs === false) {
		return false;
	}

	return true;
}

/** Demo chrome provider around the live AppShell host. */
function App() {
	return (
		<ShellChromeProvider>
			<AppFrame />
		</ShellChromeProvider>
	);
}

/**
 * Live AppShell host: category SideNav, optional component Tabs, knobs rail, theme toggle.
 */
function AppFrame() {
	const shell = useShellChrome();
	const [category, setCategory] = useState<CategoryId>("primitives");
	const [component, setComponent] = useState(() => {
		return firstComponentId("primitives");
	});
	const [theme, setTheme] = useState<ThemeMode>(readSystemTheme);
	const [themePinned, setThemePinned] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [railCollapsed, setRailCollapsed] = useState(false);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	useEffect(() => {
		if (themePinned) {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		function onSystemThemeChange() {
			setTheme(readSystemTheme());
		}

		media.addEventListener("change", onSystemThemeChange);
		return () => {
			media.removeEventListener("change", onSystemThemeChange);
		};
	}, [themePinned]);

	const activeCategory = getCategory(category);
	const activeComponent = getComponent(category, component);
	const showTabs = categoryShowsTabs(category);
	const demo = getDemo(category, component);
	const DemoProvider = demo.Provider;
	const DemoCanvas = demo.Canvas;
	const DemoKnobs = demo.Knobs;

	let themeLabel = "Switch to dark theme";
	let themeIcon: ReactNode = <Moon className="size-4" aria-hidden="true" />;
	if (theme === "dark") {
		themeLabel = "Switch to light theme";
		themeIcon = <Sun className="size-4" aria-hidden="true" />;
	}

	let railLabel = "Collapse controls";
	let railIcon: ReactNode = (
		<PanelRightClose className="size-4" aria-hidden="true" />
	);
	if (railCollapsed) {
		railLabel = "Expand controls";
		railIcon = <PanelRight className="size-4" aria-hidden="true" />;
	}

	const breadcrumbItems = [
		{ label: "Examples" },
		{ label: activeCategory.label },
	];
	if (showTabs) {
		breadcrumbItems.push({ label: activeComponent.label });
	}

	let mainBody: ReactNode;
	if (showTabs) {
		mainBody = (
			<Tabs
				value={component}
				onValueChange={(next) => {
					setComponent(next);
				}}
			>
				<TabsList aria-label="Components">
					{activeCategory.components.map((item) => {
						let badge: ReactNode = null;
						if (item.apiDriven === true) {
							badge = <ApiDemoBadge />;
						}

						return (
							<TabsTrigger
								key={item.id}
								value={item.id}
								aria-label={item.label}
								className="inline-flex items-center gap-1.5"
							>
								{item.label}
								{badge}
							</TabsTrigger>
						);
					})}
				</TabsList>
				{activeCategory.components.map((item) => {
					let panel: ReactNode = null;
					if (item.id === component) {
						panel = <DemoCanvas />;
					}

					return (
						<TabsPanel key={item.id} value={item.id}>
							{panel}
						</TabsPanel>
					);
				})}
			</Tabs>
		);
	} else {
		mainBody = <DemoCanvas />;
	}

	const sideItems = CATALOG.map((item) => {
		return {
			id: item.id,
			label: item.label,
			href: `#${item.id}`,
			icon: categoryIcon(item.id),
			active: item.id === category,
		};
	});

	return (
		<>
			<SkipLink />
			<DemoProvider key={`${category}:${component}`}>
				<AppShell
					sidebarCollapsed={sidebarCollapsed}
					onSidebarCollapsedChange={setSidebarCollapsed}
					railCollapsed={railCollapsed}
					onRailCollapsedChange={setRailCollapsed}
					railPosition={shell.railPosition}
					header={
						<TopNav
							brand="@wahidgroup/veneer"
							menuExpanded={!sidebarCollapsed}
							onMenuClick={() => {
								setSidebarCollapsed(!sidebarCollapsed);
							}}
							end={
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										aria-label={themeLabel}
										onClick={() => {
											setThemePinned(true);
											if (theme === "dark") {
												setTheme("light");
												return;
											}
											setTheme("dark");
										}}
									>
										{themeIcon}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label={railLabel}
										aria-pressed={!railCollapsed}
										aria-expanded={!railCollapsed}
										onClick={() => {
											setRailCollapsed(!railCollapsed);
										}}
									>
										{railIcon}
									</Button>
								</div>
							}
						/>
					}
					sidebar={
						<SideNav
							collapsed={sidebarCollapsed}
							items={sideItems}
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

											const next = parseCategoryId(
												href.replace("#", ""),
											);
											if (next === null) {
												return;
											}

											setCategory(next);
											setComponent(
												firstComponentId(next),
											);
										}}
										{...rest}
									>
										{children}
									</a>
								);
							}}
						/>
					}
					rail={<DemoKnobs />}
				>
					<div className="flex min-h-full flex-col">
						<div className="flex flex-1 flex-col gap-4 p-4">
							<Breadcrumbs items={breadcrumbItems} />
							{mainBody}
						</div>
						<footer className="shrink-0 border-t border-border px-4 py-3 text-xs text-muted-foreground">
							© 2026 Wahid Group, LLC.
						</footer>
					</div>
				</AppShell>
			</DemoProvider>
		</>
	);
}

export { App };
