import type { ComponentProps, ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";

import type { WorkflowStepStatus } from "./workflowShared.js";
import { cn } from "../../utils/cn.js";
import { useWorkflowContext } from "./workflowShared.js";

interface WorkflowStepProps extends Omit<
	ComponentProps<"li">,
	"value" | "children"
> {
	value: string;
	status?: WorkflowStepStatus;
	children: ReactNode;
}

/**
 * One step in the track. Unique `value` id. Jump allowed only for complete
 * or error. Current step gets aria-current="step" from active value only.
 */
function WorkflowStep({
	value,
	status,
	children,
	className,
	...rest
}: WorkflowStepProps) {
	const { value: active, setValue, orientation } = useWorkflowContext();

	let resolvedStatus: WorkflowStepStatus = "pending";
	if (status !== undefined) {
		resolvedStatus = status;
	} else if (value === active) {
		resolvedStatus = "current";
	}

	const isActive = value === active;
	const jumpable =
		resolvedStatus === "complete" || resolvedStatus === "error";

	let marker: ReactNode = (
		<span
			className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground"
			aria-hidden="true"
		>
			·
		</span>
	);
	if (resolvedStatus === "complete") {
		marker = (
			<span
				className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
				aria-hidden="true"
			>
				<Check className="size-3.5" />
			</span>
		);
	} else if (resolvedStatus === "error") {
		marker = (
			<span
				className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
				aria-hidden="true"
			>
				<AlertCircle className="size-3.5" />
			</span>
		);
	} else if (isActive || resolvedStatus === "current") {
		marker = (
			<span
				className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-medium text-primary"
				aria-hidden="true"
			>
				●
			</span>
		);
	}

	let itemClass = "flex gap-2";
	if (orientation === "horizontal") {
		itemClass = cn(itemClass, "min-w-0 flex-col items-center text-center");
	} else {
		itemClass = cn(itemClass, "items-center");
	}

	itemClass = cn(itemClass, className);

	let labelClass = "text-sm font-medium text-muted-foreground";
	if (isActive || resolvedStatus === "current") {
		labelClass = "text-sm font-medium text-foreground";
	}
	if (resolvedStatus === "complete") {
		labelClass = "text-sm font-medium text-foreground";
	}
	if (resolvedStatus === "error") {
		labelClass = "text-sm font-medium text-destructive";
	}

	let body: ReactNode = (
		<span className={cn("inline-flex items-center gap-2", labelClass)}>
			{marker}
			<span>{children}</span>
		</span>
	);

	if (jumpable && !isActive) {
		body = (
			<button
				type="button"
				className={cn(
					"inline-flex cursor-pointer items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					labelClass,
					"hover:text-primary",
				)}
				onClick={() => {
					setValue(value);
				}}
			>
				{marker}
				<span>{children}</span>
			</button>
		);
	}

	let ariaCurrent: "step" | undefined;
	if (isActive) {
		ariaCurrent = "step";
	}

	return (
		<li
			data-slot="workflow-step"
			data-value={value}
			data-status={resolvedStatus}
			aria-current={ariaCurrent}
			className={itemClass}
			{...rest}
		>
			{body}
		</li>
	);
}

export type { WorkflowStepProps };
export { WorkflowStep };
