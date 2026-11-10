import type { ComponentProps, ReactNode } from "react";
import { useLayoutEffect } from "react";
import { AlertCircle, Check } from "lucide-react";

import type { WorkflowStepStatus } from "./workflowShared.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { stepEdgeFlags, useWorkflowContext } from "./workflowShared.js";

interface WorkflowStepProps extends Omit<ComponentProps<"li">, "value" | "children"> {
	value: string;
	status?: WorkflowStepStatus;
	children: ReactNode;
}

/**
 * One step in the track. Unique `value` id. Jump allowed only for complete
 * or error. Current step gets aria-current="step" from active value only.
 */
function WorkflowStep({ value, status, children, className, ...rest }: WorkflowStepProps) {
	const { value: active, setValue, orientation, stepIds, statusById, reportStepStatus } = useWorkflowContext();

	let resolvedStatus: WorkflowStepStatus = "pending";
	if (status !== undefined) {
		resolvedStatus = status;
	} else if (value === active) {
		resolvedStatus = "current";
	}

	useLayoutEffect(() => {
		reportStepStatus(value, resolvedStatus);
	}, [value, resolvedStatus, reportStepStatus]);

	const isActive = value === active;
	const jumpable = resolvedStatus === "complete" || resolvedStatus === "error";

	const index = stepIds.indexOf(value);
	const { isFirst, isLast } = stepEdgeFlags(stepIds, value);

	let previousComplete = false;
	if (index > 0) {
		const previousId = stepIds[index - 1];
		if (previousId !== undefined && statusById[previousId] === "complete") {
			previousComplete = true;
		}
	}

	let marker: ReactNode = (
		<span
			data-slot="workflow-marker"
			className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground"
			aria-hidden="true"
		>
			·
		</span>
	);
	if (resolvedStatus === "complete") {
		marker = (
			<span
				data-slot="workflow-marker"
				className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
				aria-hidden="true"
			>
				<Check className="size-3.5" />
			</span>
		);
	} else if (resolvedStatus === "error") {
		marker = (
			<span
				data-slot="workflow-marker"
				className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
				aria-hidden="true"
			>
				<AlertCircle className="size-3.5" />
			</span>
		);
	} else if (isActive || resolvedStatus === "current") {
		marker = (
			<span
				data-slot="workflow-marker"
				className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-medium text-primary"
				aria-hidden="true"
			>
				●
			</span>
		);
	}

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

	let outgoingClass = "bg-border";
	if (resolvedStatus === "complete") {
		outgoingClass = "bg-primary";
	}

	let ariaCurrent: "step" | undefined;
	if (isActive) {
		ariaCurrent = "step";
	}

	function jump(): void {
		setValue(value);
	}

	if (orientation === "vertical") {
		let connector: ReactNode = null;
		if (!isLast) {
			connector = (
				<div
					data-slot="workflow-connector"
					data-edge="out"
					aria-hidden="true"
					className={cn("mt-1 w-0.5 min-h-4 flex-1", outgoingClass)}
				/>
			);
		}

		let bodyPad = "min-w-0 flex-1 pb-6";
		if (isLast) {
			bodyPad = "min-w-0 flex-1 pb-0";
		}

		let text: ReactNode = <span className={labelClass}>{children}</span>;
		if (jumpable && !isActive) {
			text = (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn(
						"h-auto justify-start px-0 py-0 hover:bg-transparent active:bg-transparent",
						labelClass,
						"hover:text-primary",
					)}
					onClick={jump}
				>
					{children}
				</Button>
			);
		}

		return (
			<li
				data-slot="workflow-step"
				data-value={value}
				data-status={resolvedStatus}
				aria-current={ariaCurrent}
				className={cn("flex gap-3", className)}
				{...rest}
			>
				<div className="flex flex-col items-center self-stretch" aria-hidden="true">
					{marker}
					{connector}
				</div>
				<div className={bodyPad}>{text}</div>
			</li>
		);
	}

	let inClass = "h-0.5 min-w-0";
	if (isFirst) {
		inClass = cn(inClass, "bg-transparent");
	} else if (previousComplete) {
		inClass = cn(inClass, "bg-primary");
	} else {
		inClass = cn(inClass, "bg-border");
	}

	let outClass = "h-0.5 min-w-0";
	if (isLast) {
		outClass = cn(outClass, "bg-transparent");
	} else {
		outClass = cn(outClass, outgoingClass);
	}

	let text: ReactNode = <span className={cn("mt-2 block px-1 text-center break-words", labelClass)}>{children}</span>;
	if (jumpable && !isActive) {
		text = (
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className={cn(
					"mt-2 h-auto w-full px-1 py-0 text-center break-words hover:bg-transparent active:bg-transparent",
					labelClass,
					"hover:text-primary",
				)}
				onClick={jump}
			>
				{children}
			</Button>
		);
	}

	return (
		<li
			data-slot="workflow-step"
			data-value={value}
			data-status={resolvedStatus}
			aria-current={ariaCurrent}
			className={cn("flex min-w-0 flex-1 flex-col items-stretch", className)}
			{...rest}
		>
			<div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
				<div data-slot="workflow-connector" data-edge="in" aria-hidden="true" className={inClass} />
				{marker}
				<div data-slot="workflow-connector" data-edge="out" aria-hidden="true" className={outClass} />
			</div>
			{text}
		</li>
	);
}

export type { WorkflowStepProps };
export { WorkflowStep };
