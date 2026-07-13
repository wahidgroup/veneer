import type { ReactNode } from "react";

import { cn } from "@wahidgroup/veneer";

interface ShowcaseSectionProps {
	title: string;
	description: string;
	children: ReactNode;
	className?: string;
}

/**
 * Visual grouping for a cluster of demos inside a category page.
 */
function ShowcaseSection({
	title,
	description,
	children,
	className,
}: ShowcaseSectionProps) {
	return (
		<section
			className={cn(
				"flex flex-col gap-4 border-b border-border py-8 last:border-b-0",
				className,
			)}
		>
			<header className="flex flex-col gap-1">
				<h2 className="text-xl font-semibold text-foreground">
					{title}
				</h2>
				<p className="text-sm text-muted-foreground">{description}</p>
			</header>
			<div className="flex flex-col gap-4">{children}</div>
		</section>
	);
}

interface DemoRowProps {
	label: string;
	children: ReactNode;
}

/**
 * Labeled row of interactive controls.
 */
function DemoRow({ label, children }: DemoRowProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
			<div className="w-40 shrink-0 text-sm font-medium text-muted-foreground">
				{label}
			</div>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
				{children}
			</div>
		</div>
	);
}

export { DemoRow, ShowcaseSection };
