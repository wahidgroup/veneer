import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface AppShellProps extends Omit<ComponentProps<"div">, "children"> {
	header?: ReactNode;
	sidebar?: ReactNode;
	children: ReactNode;
	sidebarCollapsed?: boolean;
	onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Console page frame: optional header, collapsible sidebar, scrollable main.
 * Collapse is controlled by the parent (e.g. TopNav menu button).
 */
function AppShell({
	header,
	sidebar,
	children,
	sidebarCollapsed,
	onSidebarCollapsedChange: _onSidebarCollapsedChange,
	className,
	...rest
}: AppShellProps) {
	let collapsed = sidebarCollapsed;
	collapsed ??= false;

	let headerNode: ReactNode = null;
	if (header !== undefined) {
		headerNode = (
			<header data-slot="app-shell-header" className="shrink-0">
				{header}
			</header>
		);
	}

	let sidebarNode: ReactNode = null;
	if (sidebar !== undefined) {
		let asideClass =
			"shrink-0 overflow-y-auto border-r border-border bg-card transition-[width] duration-200";
		if (collapsed) {
			asideClass = cn(asideClass, "w-14");
		} else {
			asideClass = cn(asideClass, "w-56");
		}

		sidebarNode = (
			<aside
				data-slot="app-shell-sidebar"
				aria-label="Sidebar"
				className={asideClass}
			>
				{sidebar}
			</aside>
		);
	}

	return (
		<div
			data-slot="app-shell"
			data-collapsed={collapsed}
			className={cn(
				"flex h-full min-h-0 flex-col bg-background text-foreground",
				className,
			)}
			{...rest}
		>
			{headerNode}
			<div
				data-slot="app-shell-body"
				className="flex min-h-0 flex-1 overflow-hidden"
			>
				{sidebarNode}
				<main
					data-slot="app-shell-main"
					className="min-w-0 flex-1 overflow-y-auto"
				>
					{children}
				</main>
			</div>
		</div>
	);
}

export type { AppShellProps };
export { AppShell };
