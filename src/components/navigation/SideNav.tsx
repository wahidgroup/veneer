import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface SideNavItem {
	id: string;
	label: string;
	href?: string;
	icon?: ReactNode;
	active?: boolean;
	disabled?: boolean;
}

interface SideNavLinkRenderProps {
	href: string;
	children: ReactNode;
	className: string;
	"aria-current"?: "page";
	"aria-disabled"?: boolean;
	"aria-label"?: string;
}

interface SideNavProps extends Omit<ComponentProps<"nav">, "children"> {
	items: SideNavItem[];
	collapsed?: boolean;
	renderLink?: (props: SideNavLinkRenderProps) => ReactNode;
}

/**
 * Flat section nav for AppShell sidebar. Supports `renderLink` for app routers.
 */
function SideNav({
	items,
	collapsed,
	renderLink,
	className,
	...rest
}: SideNavProps) {
	let isCollapsed = collapsed;
	isCollapsed ??= false;

	return (
		<nav
			data-slot="side-nav"
			data-collapsed={isCollapsed}
			aria-label="Section navigation"
			className={cn("flex flex-col gap-0.5 p-2", className)}
			{...rest}
		>
			{items.map((item) => {
				let itemClass =
					"flex items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors";
				if (item.active === true) {
					itemClass = cn(
						itemClass,
						"bg-accent text-accent-foreground",
					);
				} else {
					itemClass = cn(
						itemClass,
						"text-muted-foreground hover:bg-accent hover:text-foreground",
					);
				}
				if (item.disabled === true) {
					itemClass = cn(itemClass, "pointer-events-none opacity-50");
				}
				if (isCollapsed) {
					itemClass = cn(itemClass, "justify-center px-2");
				}

				let ariaCurrent: "page" | undefined;
				if (item.active === true) {
					ariaCurrent = "page";
				}

				let labelNode: ReactNode = null;
				if (!isCollapsed) {
					labelNode = (
						<span className="min-w-0 flex-1 truncate">
							{item.label}
						</span>
					);
				}

				const content = (
					<>
						{item.icon}
						{labelNode}
					</>
				);

				if (item.href !== undefined && item.disabled !== true) {
					if (renderLink !== undefined) {
						return (
							<div key={item.id}>
								{renderLink({
									href: item.href,
									children: content,
									className: itemClass,
									"aria-current": ariaCurrent,
									"aria-label": item.label,
								})}
							</div>
						);
					}

					return (
						<a
							key={item.id}
							href={item.href}
							aria-current={ariaCurrent}
							aria-label={item.label}
							className={itemClass}
						>
							{content}
						</a>
					);
				}

				return (
					<span
						key={item.id}
						aria-current={ariaCurrent}
						aria-disabled={item.disabled === true}
						aria-label={item.label}
						className={itemClass}
					>
						{content}
					</span>
				);
			})}
		</nav>
	);
}

export type { SideNavProps, SideNavItem, SideNavLinkRenderProps };
export { SideNav };
