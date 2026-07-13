import type { ComponentProps, ReactNode } from "react";
import { Menu } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface TopNavProps extends Omit<ComponentProps<"div">, "children"> {
	brand: ReactNode;
	start?: ReactNode;
	end?: ReactNode;
	children?: ReactNode;
	onMenuClick?: () => void;
	menuLabel?: string;
}

/**
 * Product top bar for AppShell. Optional menu control toggles the sidebar.
 */
function TopNav({
	brand,
	start,
	end,
	children,
	onMenuClick,
	menuLabel,
	className,
	...rest
}: TopNavProps) {
	let resolvedMenuLabel = menuLabel;
	resolvedMenuLabel ??= "Toggle sidebar";

	let menuNode: ReactNode = null;
	if (onMenuClick !== undefined) {
		menuNode = (
			<Button
				variant="ghost"
				size="icon"
				aria-label={resolvedMenuLabel}
				onClick={onMenuClick}
			>
				<Menu className="size-4" aria-hidden="true" />
			</Button>
		);
	}

	return (
		<div
			data-slot="top-nav"
			className={cn(
				"flex h-12 items-center gap-3 border-b border-border bg-card px-3",
				className,
			)}
			{...rest}
		>
			{menuNode}
			<div
				data-slot="top-nav-brand"
				className="shrink-0 font-semibold text-foreground"
			>
				{brand}
			</div>
			{start}
			<div data-slot="top-nav-center" className="min-w-0 flex-1">
				{children}
			</div>
			{end}
		</div>
	);
}

export type { TopNavProps };
export { TopNav };
