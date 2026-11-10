import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { useDismissLayer } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

/** Tailwind `md` ceiling - below this is mobile drawer mode. */
const APP_SHELL_MOBILE_MAX_PX = 767;
/** Tailwind `lg` ceiling - below this (and above mobile) is tablet icon rail. */
const APP_SHELL_TABLET_MAX_PX = 1023;

const APP_SHELL_MOBILE_QUERY = `(max-width: ${String(APP_SHELL_MOBILE_MAX_PX)}px)`;
const APP_SHELL_COMPACT_QUERY = `(max-width: ${String(APP_SHELL_TABLET_MAX_PX)}px)`;

type AppShellViewport = "comfort" | "tablet" | "mobile";

/**
 * Controls rail dock. `end` = trailing edge (default). `bottom` = under main.
 */
type AppShellRailPosition = "end" | "bottom";

interface AppShellProps extends Omit<ComponentProps<"div">, "children"> {
	header?: ReactNode;
	sidebar?: ReactNode;
	rail?: ReactNode;
	children: ReactNode;
	sidebarCollapsed?: boolean;
	onSidebarCollapsedChange?: (collapsed: boolean) => void;
	railCollapsed?: boolean;
	onRailCollapsedChange?: (collapsed: boolean) => void;
	railPosition?: AppShellRailPosition;
}

/** Side panes stay scrollable; chrome hidden so only main shows a bar. */
const SIDE_PANE_SCROLL =
	"h-full min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/**
 * Maps CSS px width to shell viewport tier (Tailwind md / lg ceilings).
 */
function resolveAppShellViewport(widthPx: number): AppShellViewport {
	if (widthPx <= APP_SHELL_MOBILE_MAX_PX) {
		return "mobile";
	}
	if (widthPx <= APP_SHELL_TABLET_MAX_PX) {
		return "tablet";
	}

	return "comfort";
}

function readAppShellViewport(): AppShellViewport {
	if (typeof window === "undefined") {
		return "comfort";
	}
	if (typeof window.matchMedia !== "function") {
		return "comfort";
	}

	const mobile = window.matchMedia(APP_SHELL_MOBILE_QUERY).matches;
	const compact = window.matchMedia(APP_SHELL_COMPACT_QUERY).matches;
	if (mobile) {
		return "mobile";
	}
	if (compact) {
		return "tablet";
	}

	return "comfort";
}

function useAppShellViewport(): AppShellViewport {
	const [viewport, setViewport] =
		useState<AppShellViewport>(readAppShellViewport);

	useEffect(() => {
		if (typeof window.matchMedia !== "function") {
			return;
		}

		const mobileMq = window.matchMedia(APP_SHELL_MOBILE_QUERY);
		const compactMq = window.matchMedia(APP_SHELL_COMPACT_QUERY);

		function sync() {
			if (mobileMq.matches) {
				setViewport("mobile");
				return;
			}
			if (compactMq.matches) {
				setViewport("tablet");
				return;
			}
			setViewport("comfort");
		}

		sync();
		mobileMq.addEventListener("change", sync);
		compactMq.addEventListener("change", sync);
		return () => {
			mobileMq.removeEventListener("change", sync);
			compactMq.removeEventListener("change", sync);
		};
	}, []);

	return viewport;
}

/**
 * Console page frame locked to the viewport. Main is the primary scroll
 * container. Below `lg` (1024px): icon sidebar + rail overlay. Below `md`
 * (768px): sidebar drawer + rail overlay. Crossing down auto-hides the rail
 * and collapses the sidebar. `railPosition` docks the controls rail to the
 * trailing edge (`end`) or under main (`bottom`); comfort mode pushes layout,
 * compact still overlays.
 */
function AppShell({
	header,
	sidebar,
	rail,
	children,
	sidebarCollapsed,
	onSidebarCollapsedChange,
	railCollapsed,
	onRailCollapsedChange,
	railPosition,
	className,
	...rest
}: AppShellProps) {
	let collapsed = sidebarCollapsed;
	collapsed ??= false;

	let railIsCollapsed = railCollapsed;
	railIsCollapsed ??= false;

	let resolvedRailPosition: AppShellRailPosition = "end";
	if (railPosition === "bottom") {
		resolvedRailPosition = "bottom";
	}

	const viewport = useAppShellViewport();
	const previousViewport = useRef<AppShellViewport | null>(null);

	const isMobile = viewport === "mobile";
	const isTablet = viewport === "tablet";
	const isCompact = isMobile || isTablet;
	const drawerOpen = isMobile && !collapsed;
	const railOverlayOpen = isCompact && !railIsCollapsed;
	const railAtBottom = resolvedRailPosition === "bottom";

	useEffect(() => {
		const previous = previousViewport.current;
		previousViewport.current = viewport;

		if (viewport === "comfort") {
			return;
		}

		let enteredCompact = false;
		if (previous === null) {
			enteredCompact = true;
		} else if (previous === "comfort") {
			enteredCompact = true;
		}

		let enteredMobile = false;
		if (viewport === "mobile") {
			if (previous === null) {
				enteredMobile = true;
			} else if (previous !== "mobile") {
				enteredMobile = true;
			}
		}

		if (enteredCompact) {
			if (onRailCollapsedChange !== undefined) {
				onRailCollapsedChange(true);
			}
			if (onSidebarCollapsedChange !== undefined) {
				onSidebarCollapsedChange(true);
			}
			return;
		}

		if (enteredMobile) {
			if (onRailCollapsedChange !== undefined) {
				onRailCollapsedChange(true);
			}
			if (onSidebarCollapsedChange !== undefined) {
				onSidebarCollapsedChange(true);
			}
		}
	}, [viewport, onRailCollapsedChange, onSidebarCollapsedChange]);

	function dismissOverlays() {
		if (railOverlayOpen && onRailCollapsedChange !== undefined) {
			onRailCollapsedChange(true);
		}
		if (drawerOpen && onSidebarCollapsedChange !== undefined) {
			onSidebarCollapsedChange(true);
		}
	}

	useDismissLayer({
		open: drawerOpen || railOverlayOpen,
		onEscape: dismissOverlays,
	});

	let headerNode: ReactNode = null;
	if (header !== undefined) {
		headerNode = (
			<header
				data-slot="app-shell-header"
				className="relative z-20 shrink-0"
			>
				{header}
			</header>
		);
	}

	let sidebarNode: ReactNode = null;
	if (sidebar !== undefined) {
		let asideClass = cn(
			SIDE_PANE_SCROLL,
			"border-r border-border bg-card transition-[width,transform] duration-200",
		);

		if (isMobile) {
			if (drawerOpen) {
				asideClass = cn(
					asideClass,
					"absolute inset-y-0 left-0 z-40 w-56 shadow-lg",
				);
			} else {
				asideClass = cn(
					asideClass,
					"pointer-events-none absolute inset-y-0 left-0 z-40 w-56 -translate-x-full",
				);
			}
		} else if (isTablet) {
			asideClass = cn(asideClass, "relative z-10 w-14 shrink-0");
		} else if (collapsed) {
			asideClass = cn(asideClass, "relative z-10 w-14 shrink-0");
		} else {
			asideClass = cn(asideClass, "relative z-10 w-56 shrink-0");
		}

		sidebarNode = (
			<aside
				data-slot="app-shell-sidebar"
				data-mode={viewport}
				aria-label="Sidebar"
				aria-hidden={isMobile && !drawerOpen}
				className={asideClass}
			>
				{sidebar}
			</aside>
		);
	}

	let railNode: ReactNode = null;
	if (rail !== undefined) {
		let railClass = "bg-card transition-[width,height] duration-200";

		if (railAtBottom) {
			railClass = cn(railClass, "border-t border-border");
		} else {
			railClass = cn(railClass, "border-l border-border");
		}

		if (railIsCollapsed) {
			if (railAtBottom) {
				railClass = cn(
					railClass,
					"h-0 min-h-0 shrink overflow-hidden border-t-0",
				);
			} else {
				railClass = cn(
					railClass,
					"w-0 min-w-0 shrink overflow-hidden border-l-0",
				);
			}
		} else if (isMobile) {
			if (railAtBottom) {
				railClass = cn(
					railClass,
					SIDE_PANE_SCROLL,
					"absolute inset-x-0 bottom-0 z-40 max-h-[min(24rem,70%)] shadow-lg",
				);
			} else {
				railClass = cn(
					railClass,
					SIDE_PANE_SCROLL,
					"absolute inset-0 z-40 shadow-lg",
				);
			}
		} else if (isTablet) {
			if (railAtBottom) {
				railClass = cn(
					railClass,
					SIDE_PANE_SCROLL,
					"absolute bottom-0 left-14 right-0 z-40 max-h-[min(24rem,70%)] shadow-lg",
				);
			} else {
				railClass = cn(
					railClass,
					SIDE_PANE_SCROLL,
					"absolute inset-y-0 left-14 right-0 z-40 shadow-lg",
				);
			}
		} else if (railAtBottom) {
			railClass = cn(
				railClass,
				SIDE_PANE_SCROLL,
				"relative z-10 h-64 shrink-0",
			);
		} else {
			railClass = cn(
				railClass,
				SIDE_PANE_SCROLL,
				"relative z-10 w-72 shrink-0",
			);
		}

		railNode = (
			<aside
				data-slot="app-shell-rail"
				data-collapsed={railIsCollapsed}
				data-overlay={railOverlayOpen}
				data-position={resolvedRailPosition}
				aria-label="Controls"
				aria-hidden={railIsCollapsed}
				className={railClass}
			>
				{rail}
			</aside>
		);
	}

	let backdropNode: ReactNode = null;
	if (drawerOpen || railOverlayOpen) {
		backdropNode = (
			<Button
				type="button"
				variant="ghost"
				data-slot="app-shell-backdrop"
				aria-label="Dismiss panel"
				className="absolute inset-0 z-30 h-auto w-auto rounded-none bg-foreground/40 p-0 hover:bg-foreground/40 active:bg-foreground/40"
				onClick={dismissOverlays}
			/>
		);
	}

	const mainNode = (
		<main
			id="main"
			tabIndex={-1}
			data-slot="app-shell-main"
			className="min-h-0 min-w-0 flex-1 overflow-y-auto"
		>
			{children}
		</main>
	);

	/**
	 * Always the same wrapper element so toggling `railPosition` at runtime
	 * does not remount `main` (preserves scroll position).
	 */
	let columnClass = "relative flex min-h-0 min-w-0 flex-1";
	if (railAtBottom) {
		columnClass = cn(columnClass, "flex-col");
	}

	const mainColumn = (
		<div data-slot="app-shell-main-column" className={columnClass}>
			{mainNode}
			{railNode}
			{backdropNode}
		</div>
	);

	return (
		<div
			data-slot="app-shell"
			data-collapsed={collapsed}
			data-rail-collapsed={railIsCollapsed}
			data-rail-position={resolvedRailPosition}
			data-viewport={viewport}
			className={cn(
				"flex h-dvh flex-col overflow-hidden bg-background text-foreground",
				className,
			)}
			{...rest}
		>
			{headerNode}
			<div
				data-slot="app-shell-body"
				className="relative flex min-h-0 flex-1"
			>
				{sidebarNode}
				{mainColumn}
			</div>
		</div>
	);
}

export type { AppShellProps, AppShellRailPosition, AppShellViewport };
export {
	APP_SHELL_COMPACT_QUERY,
	APP_SHELL_MOBILE_MAX_PX,
	APP_SHELL_MOBILE_QUERY,
	APP_SHELL_TABLET_MAX_PX,
	AppShell,
	resolveAppShellViewport,
};
