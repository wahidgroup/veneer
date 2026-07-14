import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";
import { Card } from "../layout/Card.js";

const statDisplayValueVariants = cva("text-2xl font-semibold tracking-tight", {
	variants: {
		tone: {
			default: "text-foreground",
			success: "text-success",
			warning: "text-warning-foreground",
			danger: "text-destructive",
		},
	},
	defaultVariants: {
		tone: "default",
	},
});

type StatDisplayTone = NonNullable<
	VariantProps<typeof statDisplayValueVariants>["tone"]
>;

interface StatDisplayProps extends Omit<ComponentProps<"div">, "children"> {
	label: ReactNode;
	value: ReactNode;
	hint?: ReactNode;
	tone?: StatDisplayTone;
	badge?: ReactNode;
}

const TONE_LABEL: Record<Exclude<StatDisplayTone, "default">, string> = {
	success: "Success",
	warning: "Warning",
	danger: "Danger",
};

/**
 * Metric tile on {@link Card}. Non-default `tone` styles the value and MUST
 * pair with visible text (`badge` slot or the built-in tone caption) so
 * meaning is not color-only (WCAG 1.4.1).
 */
function StatDisplay({
	label,
	value,
	hint,
	tone,
	badge,
	className,
	...rest
}: StatDisplayProps) {
	let resolvedTone: StatDisplayTone = "default";
	if (tone === "success") {
		resolvedTone = "success";
	} else if (tone === "warning") {
		resolvedTone = "warning";
	} else if (tone === "danger") {
		resolvedTone = "danger";
	}

	let accessory: ReactNode = null;
	if (badge !== undefined) {
		accessory = (
			<div data-slot="stat-display-badge" className="shrink-0">
				{badge}
			</div>
		);
	} else if (resolvedTone !== "default") {
		accessory = (
			<span
				data-slot="stat-display-tone"
				className="text-xs font-medium text-muted-foreground"
			>
				{TONE_LABEL[resolvedTone]}
			</span>
		);
	}

	let hintNode: ReactNode = null;
	if (hint !== undefined) {
		hintNode = (
			<p
				data-slot="stat-display-hint"
				className="mt-1 text-xs text-muted-foreground"
			>
				{hint}
			</p>
		);
	}

	return (
		<Card
			size="sm"
			data-slot="stat-display"
			data-tone={resolvedTone}
			className={cn("min-w-0", className)}
			{...rest}
		>
			<div className="flex items-start justify-between gap-2">
				<p
					data-slot="stat-display-label"
					className="text-xs font-medium text-muted-foreground"
				>
					{label}
				</p>
				{accessory}
			</div>
			<p
				data-slot="stat-display-value"
				className={statDisplayValueVariants({ tone: resolvedTone })}
			>
				{value}
			</p>
			{hintNode}
		</Card>
	);
}

export type { StatDisplayProps, StatDisplayTone };
export { StatDisplay, statDisplayValueVariants };
