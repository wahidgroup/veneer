import type { ComponentProps, ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "../../utils/cn.js";

type ActivityDirection = "in" | "out";

interface ActivityRowProps extends Omit<ComponentProps<"article">, "children" | "title"> {
	direction: ActivityDirection;
	amount: ReactNode;
	status?: ReactNode;
	title?: ReactNode;
	subtitle?: ReactNode;
	tags?: ReactNode;
	end?: ReactNode;
}

/**
 * Presentational activity list row for wallet / explorer feeds. Pass
 * {@link BtcAmount} as `amount`, {@link TxStatusBadge} as `status`, and
 * {@link ActionMenu} as `end`.
 */
function ActivityRow({ direction, amount, status, title, subtitle, tags, end, className, ...rest }: ActivityRowProps) {
	let directionIcon: ReactNode = <ArrowDownLeft className="size-4" aria-hidden="true" />;

	let directionLabel = "Incoming";
	if (direction === "out") {
		directionIcon = <ArrowUpRight className="size-4" aria-hidden="true" />;
		directionLabel = "Outgoing";
	}

	let titleNode: ReactNode = null;
	if (title !== undefined) {
		titleNode = (
			<div data-slot="activity-row-title" className="truncate text-sm font-medium text-foreground">
				{title}
			</div>
		);
	}

	let subtitleNode: ReactNode = null;
	if (subtitle !== undefined) {
		subtitleNode = (
			<div data-slot="activity-row-subtitle" className="truncate text-xs text-muted-foreground">
				{subtitle}
			</div>
		);
	}

	let tagsNode: ReactNode = null;
	if (tags !== undefined) {
		tagsNode = (
			<div data-slot="activity-row-tags" className="mt-1 flex flex-wrap items-center gap-1">
				{tags}
			</div>
		);
	}

	let statusNode: ReactNode = null;
	if (status !== undefined) {
		statusNode = (
			<div data-slot="activity-row-status" className="shrink-0">
				{status}
			</div>
		);
	}

	let endNode: ReactNode = null;
	if (end !== undefined) {
		endNode = (
			<div data-slot="activity-row-end" className="shrink-0">
				{end}
			</div>
		);
	}

	return (
		<article
			data-slot="activity-row"
			data-direction={direction}
			className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-3", className)}
			{...rest}
		>
			<div
				data-slot="activity-row-direction"
				role="img"
				aria-label={directionLabel}
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-full",
					direction === "in" && "bg-success-muted text-success-muted-foreground",
					direction === "out" && "bg-muted text-muted-foreground",
				)}
			>
				{directionIcon}
			</div>
			<div data-slot="activity-row-body" className="min-w-0 flex-1">
				{titleNode}
				{subtitleNode}
				{tagsNode}
			</div>
			<div data-slot="activity-row-amount" className="flex shrink-0 flex-col items-end gap-1">
				<div className="text-sm font-medium tabular-nums text-foreground">{amount}</div>
				{statusNode}
			</div>
			{endNode}
		</article>
	);
}

export type { ActivityDirection, ActivityRowProps };
export { ActivityRow };
