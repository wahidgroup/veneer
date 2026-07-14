import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface SkipLinkProps extends ComponentProps<"a"> {
	href?: string;
	children?: ReactNode;
}

/**
 * Bypass link to main content (WCAG 2.4.1 / technique G1). Place as the
 * first focusable control on the page. Hidden until focused. On activate,
 * moves focus to the hash target — pair with a landmark that has matching
 * `id` and `tabindex={-1}` (AppShell main defaults to `id="main"`).
 */
function SkipLink({
	href,
	children,
	className,
	onClick,
	...rest
}: SkipLinkProps) {
	let resolvedHref = href;
	resolvedHref ??= "#main";

	let resolvedChildren: ReactNode = children;
	resolvedChildren ??= "Skip to main content";

	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		if (onClick !== undefined) {
			onClick(event);
		}
		if (event.defaultPrevented) {
			return;
		}
		if (!resolvedHref?.startsWith("#")) {
			return;
		}

		const id = resolvedHref.slice(1);
		if (id.length === 0) {
			return;
		}

		// Own in-page skip handling: block hash navigation even when the
		// landmark is missing (avoids URL hash + scroll-to-top).
		event.preventDefault();

		const target = document.getElementById(id);
		if (!(target instanceof HTMLElement)) {
			return;
		}

		target.focus();
	}

	return (
		<a
			data-slot="skip-link"
			href={resolvedHref}
			onClick={handleClick}
			className={cn(
				"sr-only focus-visible:not-sr-only",
				"focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50",
				"focus-visible:rounded-md focus-visible:border focus-visible:border-border",
				"focus-visible:bg-card focus-visible:px-3 focus-visible:py-2",
				"focus-visible:text-sm focus-visible:font-medium focus-visible:text-foreground",
				"focus-visible:shadow-md focus-visible:outline-none",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"focus-visible:ring-offset-background",
				className,
			)}
			{...rest}
		>
			{resolvedChildren}
		</a>
	);
}

export type { SkipLinkProps };
export { SkipLink };
