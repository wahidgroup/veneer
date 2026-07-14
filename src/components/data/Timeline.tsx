import type { ComponentProps, ReactNode } from "react";

import type { StatusBadgeStatus } from "../indicators/StatusBadge.js";
import { cn } from "../../utils/cn.js";
import { StatusBadge } from "../indicators/StatusBadge.js";

interface TimelineItem {
	id: string;
	title: ReactNode;
	description?: ReactNode;
	timestamp: ReactNode;
	status?: StatusBadgeStatus;
}

interface TimelineProps extends Omit<ComponentProps<"ol">, "children"> {
	items: TimelineItem[];
}

const STATUS_LABEL: Record<StatusBadgeStatus, string> = {
	running: "Running",
	pending: "Pending",
	success: "Success",
	warning: "Warning",
	danger: "Failed",
	drifted: "Drifted",
};

/**
 * Chronological deploy / event history as an ordered list with a vertical
 * rail. Optional StatusBadge per item. Not an ARIA feed (static history).
 */
function Timeline({ items, className, ...rest }: TimelineProps) {
	const root = (
		<ol
			data-slot="timeline"
			className={cn("m-0 list-none p-0", className)}
			{...rest}
		>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				let statusNode: ReactNode = null;
				if (item.status !== undefined) {
					statusNode = (
						<StatusBadge status={item.status} size="sm">
							{STATUS_LABEL[item.status]}
						</StatusBadge>
					);
				}

				let descriptionNode: ReactNode = null;
				if (item.description !== undefined) {
					descriptionNode = (
						<div
							data-slot="timeline-description"
							className="mt-1 text-sm text-muted-foreground"
						>
							{item.description}
						</div>
					);
				}

				let connector: ReactNode = null;
				if (!isLast) {
					connector = (
						<div
							data-slot="timeline-connector"
							aria-hidden="true"
							className="mt-1 w-px flex-1 bg-border"
						/>
					);
				}

				let bodyPad = "min-w-0 flex-1 pb-6";
				if (isLast) {
					bodyPad = "min-w-0 flex-1 pb-0";
				}

				return (
					<li
						key={item.id}
						data-slot="timeline-item"
						className="relative flex gap-3"
					>
						<div
							className="flex w-3 shrink-0 flex-col items-center"
							aria-hidden="true"
						>
							<span
								data-slot="timeline-marker"
								className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-primary bg-background"
							/>
							{connector}
						</div>
						<div className={bodyPad}>
							<div className="flex flex-wrap items-center gap-2">
								<div
									data-slot="timeline-title"
									className="text-sm font-medium text-foreground"
								>
									{item.title}
								</div>
								{statusNode}
							</div>
							<div
								data-slot="timeline-timestamp"
								className="mt-0.5 text-xs text-muted-foreground"
							>
								{item.timestamp}
							</div>
							{descriptionNode}
						</div>
					</li>
				);
			})}
		</ol>
	);

	return root;
}

export type { TimelineItem, TimelineProps };
export { Timeline };
