import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

import type { DiffResource } from "./diffTypes.js";
import { Badge } from "../indicators/Badge.js";
import { Button } from "../forms/Button.js";
import { EmptyState } from "../feedback/EmptyState.js";
import { cn } from "../../utils/cn.js";
import { badgeVariantForKind, labelForKind } from "./diffKind.js";

interface DiffTreeViewProps extends Omit<ComponentProps<"div">, "children"> {
	resources?: DiffResource[];
	defaultExpanded?: boolean;
	"aria-label": string;
	baseId: string;
}

function AttrValue({ sensitive, value }: { sensitive?: boolean; value?: ReactNode }) {
	if (sensitive === true) {
		return <span className="text-muted-foreground">(sensitive)</span>;
	}
	if (value !== undefined) {
		return value;
	}

	return <span className="text-muted-foreground">-</span>;
}

/**
 * Tree-mode DiffView body: IaC resources with expandable attributes.
 */
function DiffTreeView({
	resources,
	defaultExpanded,
	"aria-label": ariaLabel,
	baseId,
	className,
	...rest
}: DiffTreeViewProps) {
	let list = resources;
	list ??= [];

	let expandDefault = defaultExpanded;
	expandDefault ??= false;

	const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		if (expandDefault) {
			for (const resource of list) {
				initial[resource.id] = true;
			}
		}

		return initial;
	});

	if (list.length === 0) {
		return (
			<div
				data-slot="diff-view"
				data-mode="tree"
				className={cn("rounded-md border border-border bg-card", className)}
				{...rest}
			>
				<EmptyState size="sm" title="No changes">
					Nothing to review in this plan.
				</EmptyState>
			</div>
		);
	}

	return (
		<div
			data-slot="diff-view"
			data-mode="tree"
			role="list"
			aria-label={ariaLabel}
			className={cn("overflow-hidden rounded-md border border-border bg-card", className)}
			{...rest}
		>
			{list.map((resource) => {
				const isOpen = expanded[resource.id] === true;
				const panelId = `${baseId}-${resource.id}-attrs`;
				const hasAttrs = resource.attributes !== undefined && resource.attributes.length > 0;

				let summaryNode: ReactNode = null;
				if (resource.summary !== undefined) {
					summaryNode = <div className="mt-0.5 text-xs text-muted-foreground">{resource.summary}</div>;
				}

				let expandControl: ReactNode = null;
				if (hasAttrs) {
					let expandLabel = "Expand";
					if (isOpen) {
						expandLabel = "Collapse";
					}

					expandControl = (
						<Button
							variant="ghost"
							size="sm"
							className="shrink-0"
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() => {
								setExpanded((prev) => {
									return {
										...prev,
										[resource.id]: !isOpen,
									};
								});
							}}
						>
							{expandLabel}
						</Button>
					);
				}

				let attrsPanel: ReactNode = null;
				if (hasAttrs && isOpen && resource.attributes !== undefined) {
					attrsPanel = (
						<ul id={panelId} className="space-y-2 border-t border-border bg-muted/40 px-3 py-2">
							{resource.attributes.map((attr) => {
								let replaceHint = "";
								if (attr.forcesReplace === true) {
									replaceHint = " · forces replacement";
								}

								return (
									<li key={attr.path} className="font-mono text-xs">
										<div className="text-muted-foreground">
											{attr.path}
											{replaceHint}
										</div>
										<div className="mt-1 grid gap-1 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
											<div className="rounded bg-destructive/10 px-2 py-1 text-foreground break-all">
												<AttrValue sensitive={attr.sensitive} value={attr.before} />
											</div>
											<span
												aria-hidden="true"
												className="hidden px-1 text-muted-foreground sm:inline"
											>
												→
											</span>
											<div className="rounded bg-success/10 px-2 py-1 text-foreground break-all">
												<AttrValue sensitive={attr.sensitive} value={attr.after} />
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					);
				}

				return (
					<div
						key={resource.id}
						role="listitem"
						data-slot="diff-resource"
						data-kind={resource.kind}
						className="border-b border-border last:border-b-0"
					>
						<div className="flex items-start gap-2 px-3 py-2">
							<Badge variant={badgeVariantForKind(resource.kind)} size="sm">
								{labelForKind(resource.kind)}
							</Badge>
							<div className="min-w-0 flex-1">
								<div className="font-mono text-sm text-foreground">{resource.path}</div>
								{summaryNode}
							</div>
							{expandControl}
						</div>
						{attrsPanel}
					</div>
				);
			})}
		</div>
	);
}

export type { DiffTreeViewProps };
export { DiffTreeView };
