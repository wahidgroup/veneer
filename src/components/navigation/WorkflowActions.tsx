import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import {
	defaultIsFinish,
	nextInOrder,
	prevInOrder,
	useWorkflowContext,
} from "./workflowShared.js";

interface WorkflowActionsProps extends ComponentProps<"div"> {
	canNext?: boolean;
	canBack?: boolean;
	backLabel?: string;
	nextLabel?: string;
	finishLabel?: string;
	onFinish?: () => void;
}

/**
 * Back / Next / Finish controls. Next blocked when canNext is false.
 * Finish shown when isFinish (or last step) is true.
 */
function WorkflowActions({
	canNext,
	canBack,
	backLabel,
	nextLabel,
	finishLabel,
	onFinish,
	className,
	...rest
}: WorkflowActionsProps) {
	const { value, setValue, stepIds, resolveNext, resolveBack, isFinish } =
		useWorkflowContext();

	let allowNext = true;
	if (canNext !== undefined) {
		allowNext = canNext;
	}

	let allowBack = true;
	if (canBack !== undefined) {
		allowBack = canBack;
	}

	let resolvedBackLabel = "Back";
	if (backLabel !== undefined) {
		resolvedBackLabel = backLabel;
	}

	let resolvedNextLabel = "Next";
	if (nextLabel !== undefined) {
		resolvedNextLabel = nextLabel;
	}

	let resolvedFinishLabel = "Finish";
	if (finishLabel !== undefined) {
		resolvedFinishLabel = finishLabel;
	}

	let backTarget: string | undefined;
	if (resolveBack !== undefined) {
		backTarget = resolveBack(value, stepIds);
	} else {
		backTarget = prevInOrder(value, stepIds);
	}

	let nextTarget: string | undefined;
	if (resolveNext !== undefined) {
		nextTarget = resolveNext(value, stepIds);
	} else {
		nextTarget = nextInOrder(value, stepIds);
	}

	let finish = false;
	if (isFinish !== undefined) {
		finish = isFinish(value, stepIds);
	} else {
		finish = defaultIsFinish(value, stepIds);
	}

	const backDisabled = !allowBack || backTarget === undefined;
	const nextDisabled = !allowNext || nextTarget === undefined;

	let primaryAction: ReactNode = (
		<Button
			type="button"
			variant="filled"
			size="sm"
			disabled={nextDisabled}
			onClick={() => {
				if (nextTarget === undefined) {
					return;
				}
				setValue(nextTarget);
			}}
		>
			{resolvedNextLabel}
		</Button>
	);
	if (finish) {
		primaryAction = (
			<Button
				type="button"
				variant="filled"
				size="sm"
				disabled={!allowNext}
				onClick={() => {
					if (onFinish !== undefined) {
						onFinish();
					}
				}}
			>
				{resolvedFinishLabel}
			</Button>
		);
	}

	return (
		<div
			data-slot="workflow-actions"
			className={cn("flex flex-wrap items-center gap-2", className)}
			{...rest}
		>
			<Button
				type="button"
				variant="outlined"
				size="sm"
				disabled={backDisabled}
				onClick={() => {
					if (backTarget === undefined) {
						return;
					}
					setValue(backTarget);
				}}
			>
				{resolvedBackLabel}
			</Button>
			{primaryAction}
		</div>
	);
}

export type { WorkflowActionsProps };
export { WorkflowActions };
