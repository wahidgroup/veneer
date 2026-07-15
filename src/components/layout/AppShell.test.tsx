import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import {
	APP_SHELL_COMPACT_QUERY,
	APP_SHELL_MOBILE_MAX_PX,
	APP_SHELL_MOBILE_QUERY,
	APP_SHELL_TABLET_MAX_PX,
	AppShell,
	resolveAppShellViewport,
} from "./AppShell.js";

type QueryMap = Record<string, boolean>;

function ignoreLegacyMatchMediaListener(): void {
	return;
}

/**
 * jsdom MediaQueryList stand-in. Tracks listeners and re-reads `matches`
 * from the shared map (same contract AppShell relies on).
 */
function installMatchMedia(map: QueryMap) {
	const previous = window.matchMedia;
	const listeners = new Map<string, Set<EventListener>>();

	window.matchMedia = (query: string) => {
		return {
			get matches() {
				return map[query] === true;
			},
			media: query,
			onchange: null,
			addListener: ignoreLegacyMatchMediaListener,
			removeListener: ignoreLegacyMatchMediaListener,
			addEventListener(type: string, listener: EventListener) {
				if (type !== "change") {
					return;
				}
				let bucket = listeners.get(query);
				if (bucket === undefined) {
					bucket = new Set();
					listeners.set(query, bucket);
				}
				bucket.add(listener);
			},
			removeEventListener(type: string, listener: EventListener) {
				if (type !== "change") {
					return;
				}
				listeners.get(query)?.delete(listener);
			},
			dispatchEvent() {
				return false;
			},
		};
	};

	return {
		set(query: string, matches: boolean) {
			map[query] = matches;
			const bucket = listeners.get(query);
			if (bucket === undefined) {
				return;
			}
			const event = new Event("change");
			for (const listener of bucket) {
				listener(event);
			}
		},
		restore() {
			window.matchMedia = previous;
		},
	};
}

function ControlledShell({
	initialSidebarCollapsed,
	initialRailCollapsed,
	children,
}: {
	initialSidebarCollapsed?: boolean;
	initialRailCollapsed?: boolean;
	children?: ReactNode;
}) {
	let sidebarStart = initialSidebarCollapsed;
	sidebarStart ??= false;
	let railStart = initialRailCollapsed;
	railStart ??= false;

	const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarStart);
	const [railCollapsed, setRailCollapsed] = useState(railStart);

	return (
		<AppShell
			sidebarCollapsed={sidebarCollapsed}
			onSidebarCollapsedChange={setSidebarCollapsed}
			railCollapsed={railCollapsed}
			onRailCollapsedChange={setRailCollapsed}
			sidebar={<div>Nav</div>}
			rail={<div>Knobs</div>}
			header={<div>Header</div>}
		>
			{children}
			Main
		</AppShell>
	);
}

describe("resolveAppShellViewport", () => {
	it("classifies mobile, tablet, and comfort by Tailwind md/lg ceilings", () => {
		expect(resolveAppShellViewport(0)).toBe("mobile");
		expect(resolveAppShellViewport(APP_SHELL_MOBILE_MAX_PX)).toBe("mobile");
		expect(resolveAppShellViewport(APP_SHELL_MOBILE_MAX_PX + 1)).toBe(
			"tablet",
		);
		expect(resolveAppShellViewport(APP_SHELL_TABLET_MAX_PX)).toBe("tablet");
		expect(resolveAppShellViewport(APP_SHELL_TABLET_MAX_PX + 1)).toBe(
			"comfort",
		);
	});
});

describe("AppShell", () => {
	let media: ReturnType<typeof installMatchMedia>;

	beforeEach(() => {
		media = installMatchMedia({
			[APP_SHELL_MOBILE_QUERY]: false,
			[APP_SHELL_COMPACT_QUERY]: false,
		});
	});

	afterEach(() => {
		media.restore();
		document.body.replaceChildren();
	});

	it("renders landmarks for header, sidebar, and main", () => {
		render(
			<AppShell header={<div>Brand</div>} sidebar={<div>Nav</div>}>
				<p>Content</p>
			</AppShell>,
		);

		expect(screen.getByRole("banner")).toHaveTextContent("Brand");
		expect(screen.getByRole("complementary")).toHaveTextContent("Nav");
		expect(screen.getByRole("main")).toHaveTextContent("Content");
		expect(screen.getByRole("main")).toHaveAttribute("id", "main");
		expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
	});

	it("renders the controls rail when provided", () => {
		render(
			<AppShell sidebar={<div>Nav</div>} rail={<div>Knobs</div>}>
				<p>Content</p>
			</AppShell>,
		);

		expect(
			screen.getByRole("complementary", { name: "Controls" }),
		).toHaveTextContent("Knobs");
		expect(
			screen.getByRole("complementary", { name: "Sidebar" }),
		).toHaveTextContent("Nav");
	});

	it("marks collapsed state on the root", () => {
		const { container } = render(
			<AppShell sidebarCollapsed sidebar={<div>Nav</div>}>
				Main
			</AppShell>,
		);
		const root = container.querySelector("[data-slot='app-shell']");
		expect(root).toHaveAttribute("data-collapsed", "true");
	});

	it("marks rail collapsed state on the root and rail", () => {
		const { container } = render(
			<AppShell railCollapsed rail={<div>Knobs</div>}>
				Main
			</AppShell>,
		);
		const root = container.querySelector("[data-slot='app-shell']");
		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(root).toHaveAttribute("data-rail-collapsed", "true");
		expect(root).toHaveAttribute("data-rail-position", "end");
		expect(rail).toHaveAttribute("data-collapsed", "true");
		expect(rail).toHaveAttribute("data-position", "end");
	});

	it("docks the controls rail under main when railPosition is bottom", () => {
		const { container } = render(
			<AppShell
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railPosition="bottom"
			>
				Main
			</AppShell>,
		);

		const root = container.querySelector("[data-slot='app-shell']");
		const column = container.querySelector(
			"[data-slot='app-shell-main-column']",
		);
		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(root).toHaveAttribute("data-rail-position", "bottom");
		expect(column).not.toBeNull();
		expect(rail).toHaveAttribute("data-position", "bottom");
	});

	it("keeps the same main element when railPosition toggles", () => {
		const { container, rerender } = render(
			<AppShell
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railPosition="end"
			>
				Main
			</AppShell>,
		);

		const main = container.querySelector("[data-slot='app-shell-main']");
		const column = container.querySelector(
			"[data-slot='app-shell-main-column']",
		);
		expect(main).not.toBeNull();
		expect(column).not.toBeNull();
		rerender(
			<AppShell
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railPosition="bottom"
			>
				Main
			</AppShell>,
		);

		expect(container.querySelector("[data-slot='app-shell-main']")).toBe(
			main,
		);
		expect(
			container.querySelector("[data-slot='app-shell-main-column']"),
		).toBe(column);
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-rail-position", "bottom");
	});

	it("marks bottom rail collapsed", () => {
		const { container } = render(
			<AppShell
				railCollapsed
				railPosition="bottom"
				rail={<div>Knobs</div>}
			>
				Main
			</AppShell>,
		);
		const root = container.querySelector("[data-slot='app-shell']");
		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(root).toHaveAttribute("data-rail-collapsed", "true");
		expect(root).toHaveAttribute("data-rail-position", "bottom");
		expect(rail).toHaveAttribute("data-collapsed", "true");
		expect(rail).toHaveAttribute("data-position", "bottom");
	});

	it("overlays a bottom rail from the bottom edge on tablet", () => {
		media.set(APP_SHELL_COMPACT_QUERY, true);

		const { container } = render(
			<AppShell
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railCollapsed={false}
				railPosition="bottom"
			>
				Main
			</AppShell>,
		);

		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(rail).toHaveAttribute("data-overlay", "true");
		expect(rail).toHaveAttribute("data-position", "bottom");
	});

	it("renders shell regions", () => {
		const { container } = render(
			<AppShell
				header={<div>Header</div>}
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
			>
				Main
			</AppShell>,
		);
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='app-shell-main']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='app-shell-sidebar']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='app-shell-rail']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='app-shell-header']"),
		).not.toBeNull();
	});

	it("uses tablet icon rail and overlays the knobs pane", () => {
		media.set(APP_SHELL_COMPACT_QUERY, true);

		const { container } = render(
			<AppShell
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railCollapsed={false}
			>
				Main
			</AppShell>,
		);

		const root = container.querySelector("[data-slot='app-shell']");
		const sidebar = container.querySelector(
			"[data-slot='app-shell-sidebar']",
		);
		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(root).toHaveAttribute("data-viewport", "tablet");
		expect(sidebar).toHaveAttribute("data-mode", "tablet");
		expect(rail).toHaveAttribute("data-overlay", "true");
	});

	it("uses a mobile drawer and full-width rail overlay", () => {
		media.set(APP_SHELL_MOBILE_QUERY, true);
		media.set(APP_SHELL_COMPACT_QUERY, true);

		const { container } = render(
			<AppShell
				sidebarCollapsed={false}
				sidebar={<div>Nav</div>}
				rail={<div>Knobs</div>}
				railCollapsed={false}
			>
				Main
			</AppShell>,
		);

		const root = container.querySelector("[data-slot='app-shell']");
		const rail = container.querySelector("[data-slot='app-shell-rail']");
		expect(root).toHaveAttribute("data-viewport", "mobile");
		expect(rail).toHaveAttribute("data-overlay", "true");
		expect(
			container.querySelector("[data-slot='app-shell-backdrop']"),
		).not.toBeNull();
	});

	it("auto-hides the rail when entering compact from comfort", () => {
		const { container } = render(
			<ControlledShell initialRailCollapsed={false} />,
		);

		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-viewport", "comfort");
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-rail-collapsed", "false");

		act(() => {
			media.set(APP_SHELL_COMPACT_QUERY, true);
		});

		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-viewport", "tablet");
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-rail-collapsed", "true");
	});

	it("dismisses overlays on Escape after reopen", async () => {
		const user = userEvent.setup();
		media.set(APP_SHELL_MOBILE_QUERY, true);
		media.set(APP_SHELL_COMPACT_QUERY, true);

		function Shell() {
			const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
			const [railCollapsed, setRailCollapsed] = useState(true);

			return (
				<>
					<button
						type="button"
						onClick={() => {
							setSidebarCollapsed(false);
						}}
					>
						Open nav
					</button>
					<button
						type="button"
						onClick={() => {
							setRailCollapsed(false);
						}}
					>
						Open rail
					</button>
					<AppShell
						sidebarCollapsed={sidebarCollapsed}
						onSidebarCollapsedChange={setSidebarCollapsed}
						railCollapsed={railCollapsed}
						onRailCollapsedChange={setRailCollapsed}
						sidebar={<div>Nav</div>}
						rail={<div>Knobs</div>}
					>
						Main
					</AppShell>
				</>
			);
		}

		const { container } = render(<Shell />);

		await user.click(screen.getByRole("button", { name: "Open rail" }));
		expect(
			container.querySelector("[data-slot='app-shell-backdrop']"),
		).not.toBeNull();

		await user.keyboard("{Escape}");
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-rail-collapsed", "true");
		expect(
			container.querySelector("[data-slot='app-shell-backdrop']"),
		).toBeNull();

		await user.click(screen.getByRole("button", { name: "Open nav" }));
		await user.click(screen.getByRole("button", { name: "Open rail" }));
		await user.click(screen.getByRole("button", { name: "Dismiss panel" }));
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-collapsed", "true");
		expect(
			container.querySelector("[data-slot='app-shell']"),
		).toHaveAttribute("data-rail-collapsed", "true");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<AppShell
				header={<div>Header</div>}
				sidebar={<nav aria-label="Sections">Nav</nav>}
			>
				<p>Page</p>
			</AppShell>,
		);
	});
});
