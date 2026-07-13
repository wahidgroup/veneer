import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../../utils/cn.js";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbLinkRenderProps {
	href: string;
	children: ReactNode;
}

interface BreadcrumbsProps extends ComponentProps<"nav"> {
	items: BreadcrumbItem[];
	renderLink?: (props: BreadcrumbLinkRenderProps) => ReactNode;
}

function crumbContent(
	item: BreadcrumbItem,
	isLast: boolean,
	renderLink: BreadcrumbsProps["renderLink"],
): ReactNode {
	if (isLast || item.href === undefined) {
		return (
			<span className="font-medium text-muted-foreground">
				{item.label}
			</span>
		);
	}

	if (renderLink !== undefined) {
		return renderLink({ href: item.href, children: item.label });
	}

	return (
		<a
			href={item.href}
			className="font-medium text-primary hover:underline"
		>
			{item.label}
		</a>
	);
}

/**
 * Hierarchical path trail. Inject `renderLink` for app routers.
 */
function Breadcrumbs({
	items,
	renderLink,
	className,
	...props
}: BreadcrumbsProps) {
	return (
		<nav
			data-slot="breadcrumbs"
			aria-label="Breadcrumb"
			className={cn("text-sm", className)}
			{...props}
		>
			<ol className="flex flex-wrap items-center gap-1.5">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					const key = `${String(index)}-${item.label}`;

					let separator: ReactNode = null;
					if (index > 0) {
						separator = (
							<ChevronRight
								className="size-3.5 shrink-0 text-muted-foreground"
								aria-hidden="true"
							/>
						);
					}

					return (
						<li key={key} className="flex items-center gap-1.5">
							{separator}
							{crumbContent(item, isLast, renderLink)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

export type { BreadcrumbsProps, BreadcrumbItem, BreadcrumbLinkRenderProps };
export { Breadcrumbs };
