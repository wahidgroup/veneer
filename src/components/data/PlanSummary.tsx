import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

import type { DiffChangeKind, DiffResource } from "./diffTypes.js";
import { cn } from "../../utils/cn.js";
import { Badge } from "../indicators/Badge.js";
import { Button } from "../forms/Button.js";
import { DiffView } from "./DiffView.js";
import { badgeVariantForKind, labelForKind } from "./diffKind.js";

interface PlanSummaryProps extends Omit<
	ComponentProps<"div">,
	"children" | "title"
> {
	resources: DiffResource[];
	title?: ReactNode;
	"aria-label"?: string;
}

interface KindCounts {
	create: number;
	update: number;
	destroy: number;
	replace: number;
}

const ALL_KINDS: DiffChangeKind[] = ["create", "update", "destroy", "replace"];

function countKinds(resources: DiffResource[]): KindCounts {
	const counts: KindCounts = {
		create: 0,
		update: 0,
		destroy: 0,
		replace: 0,
	};
	for (const resource of resources) {
		counts[resource.kind] += 1;
	}
	return counts;
}

function PlanSummary({
	resources,
	title,
	"aria-label": ariaLabel,
	className,
	...rest
}: PlanSummaryProps) {
	let resolvedTitle: ReactNode = title;
	resolvedTitle ??= "Plan summary";

	let resolvedAria = ariaLabel;
	if (resolvedAria === undefined || resolvedAria.length === 0) {
		resolvedAria = "Plan summary";
	}

	const counts = countKinds(resources);
	const [enabled, setEnabled] = useState<Record<DiffChangeKind, boolean>>({
		create: true,
		update: true,
		destroy: true,
		replace: true,
	});

	const filtered = resources.filter((resource) => {
		return enabled[resource.kind];
	});

	function toggleKind(kind: DiffChangeKind) {
		setEnabled((prev) => {
			const next = {
				...prev,
				[kind]: !prev[kind],
			};
			const anyOn = ALL_KINDS.some((item) => {
				return next[item];
			});
			if (!anyOn) {
				return {
					create: true,
					update: true,
					destroy: true,
					replace: true,
				};
			}
			return next;
		});
	}

	return (
		<div
			data-slot="plan-summary"
			role="region"
			aria-label={resolvedAria}
			className={cn(
				"overflow-hidden rounded-md border border-border bg-card",
				className,
			)}
			{...rest}
		>
			<div className="border-b border-border px-3 py-2">
				<div className="text-sm font-semibold text-foreground">
					{resolvedTitle}
				</div>
				<div className="mt-2 flex flex-wrap gap-2">
					{ALL_KINDS.map((kind) => {
						const count = counts[kind];
						const pressed = enabled[kind];
						let chipClass = "gap-1.5 border border-border";
						if (pressed) {
							chipClass = cn(chipClass, "bg-accent/60");
						} else {
							chipClass = cn(chipClass, "opacity-50");
						}

						return (
							<Button
								key={kind}
								variant="ghost"
								size="sm"
								className={chipClass}
								aria-pressed={pressed}
								aria-label={`Filter ${labelForKind(kind)}`}
								onClick={() => {
									toggleKind(kind);
								}}
							>
								<span className="text-xs text-muted-foreground">
									{labelForKind(kind)}
								</span>
								<Badge
									variant={badgeVariantForKind(kind)}
									size="sm"
								>
									{String(count)}
								</Badge>
							</Button>
						);
					})}
				</div>
			</div>
			<DiffView
				mode="tree"
				resources={filtered}
				className="rounded-none border-0"
				aria-label={`${resolvedAria} changes`}
			/>
		</div>
	);
}

export type { PlanSummaryProps };
export { PlanSummary };
