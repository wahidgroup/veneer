import { useEffect, useState } from "react";

import {
	Button,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
} from "@wahidgroup/veneer";

import { ComboboxShowcase } from "./showcases/ComboboxShowcase.js";
import { FormsShowcase } from "./showcases/FormsShowcase.js";
import { PrimitivesShowcase } from "./showcases/PrimitivesShowcase.js";
import { ShellShowcase } from "./showcases/ShellShowcase.js";

type CategoryId = "primitives" | "forms" | "combobox" | "shell";

interface Category {
	id: CategoryId;
	label: string;
	description: string;
}

const CATEGORIES: Category[] = [
	{
		id: "primitives",
		label: "Primitives",
		description:
			"Button, Badge, Loading, Tabs, Modal, ConfirmDialog, Tooltip, ActionMenu, Toast",
	},
	{
		id: "forms",
		label: "Forms",
		description: "Inputs, tags, files, schedule, toggles, search",
	},
	{
		id: "combobox",
		label: "Combobox",
		description: "Search select, multi chips, loading / invalid / disabled",
	},
	{
		id: "shell",
		label: "Shell",
		description: "AppShell, TopNav, SideNav, Breadcrumbs",
	},
];

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

/**
 * Category-switcher shell for Veneer showcases.
 */
function App() {
	const [category, setCategory] = useState<CategoryId>("primitives");
	const [theme, setTheme] = useState<ThemeMode>(readSystemTheme);
	const [themePinned, setThemePinned] = useState(false);

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

	let nextTheme: ThemeMode = "dark";
	if (theme === "dark") {
		nextTheme = "light";
	}

	let activeDescription = "";
	for (const item of CATEGORIES) {
		if (item.id === category) {
			activeDescription = item.description;
		}
	}

	return (
		<div className="min-h-full">
			<Tabs
				value={category}
				onValueChange={(next) => {
					if (next === "primitives") {
						setCategory("primitives");
						return;
					}
					if (next === "forms") {
						setCategory("forms");
						return;
					}
					if (next === "combobox") {
						setCategory("combobox");
						return;
					}
					if (next === "shell") {
						setCategory("shell");
					}
				}}
			>
				<header className="border-b border-border bg-card">
					<div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
						<div className="flex flex-col gap-1">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								@wahidgroup/veneer
							</p>
							<h1 className="text-2xl font-semibold text-foreground">
								Examples
							</h1>
							<p className="text-sm text-muted-foreground">
								{activeDescription}
							</p>
						</div>
						<Button
							variant="outlined"
							onClick={() => {
								setThemePinned(true);
								setTheme(nextTheme);
							}}
						>
							Theme: {theme}
						</Button>
					</div>
					<nav className="mx-auto max-w-5xl px-4">
						<TabsList aria-label="Component categories">
							{CATEGORIES.map((item) => {
								return (
									<TabsTrigger key={item.id} value={item.id}>
										{item.label}
									</TabsTrigger>
								);
							})}
						</TabsList>
					</nav>
				</header>
				<main className="mx-auto max-w-5xl px-4 pb-16">
					<TabsPanel value="primitives">
						<PrimitivesShowcase />
					</TabsPanel>
					<TabsPanel value="forms">
						<FormsShowcase />
					</TabsPanel>
					<TabsPanel value="combobox">
						<ComboboxShowcase />
					</TabsPanel>
					<TabsPanel value="shell">
						<ShellShowcase />
					</TabsPanel>
				</main>
			</Tabs>
		</div>
	);
}

export { App };
