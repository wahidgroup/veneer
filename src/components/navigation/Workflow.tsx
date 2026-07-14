import type { ComponentProps, ReactNode } from "react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn.js";
import { WorkflowActions } from "./WorkflowActions.js";
import type { WorkflowActionsProps } from "./WorkflowActions.js";
import { WorkflowPanel } from "./WorkflowPanel.js";
import type { WorkflowPanelProps } from "./WorkflowPanel.js";
import { WorkflowStep } from "./WorkflowStep.js";
import type { WorkflowStepProps } from "./WorkflowStep.js";
import type {
	WorkflowIsFinishFn,
	WorkflowOrientation,
	WorkflowResolveFn,
	WorkflowStepStatus,
} from "./workflowShared.js";
import {
	readStepIdsFromList,
	stepIdsEqual,
	useWorkflowContext,
	WorkflowContext,
} from "./workflowShared.js";

interface WorkflowProps extends Omit<ComponentProps<"div">, "onChange"> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	orientation?: WorkflowOrientation;
	resolveNext?: WorkflowResolveFn;
	resolveBack?: WorkflowResolveFn;
	isFinish?: WorkflowIsFinishFn;
	children: ReactNode;
}

/**
 * Ordered multi-step workflow chrome. Step ids are opaque unique strings
 * (multi-instance = N ids). Default adjacency is document order; optional
 * resolveNext / resolveBack / isFinish let the parent soft-cycle or branch.
 * Compose WorkflowTrack, WorkflowStep, WorkflowPanel, WorkflowActions.
 */
function Workflow({
	value,
	defaultValue,
	onValueChange,
	orientation,
	resolveNext,
	resolveBack,
	isFinish,
	children,
	className,
	...rest
}: WorkflowProps) {
	const baseId = useId();
	let resolvedOrientation: WorkflowOrientation = "horizontal";
	if (orientation !== undefined) {
		resolvedOrientation = orientation;
	}

	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		return "";
	});
	const [stepIds, setStepIds] = useState<string[]>([]);
	const [statusById, setStatusById] = useState<
		Record<string, WorkflowStepStatus>
	>({});
	const [focusEpoch, setFocusEpoch] = useState(0);

	let current = uncontrolled;
	if (isControlled) {
		current = value;
	}

	const setValue = (next: string) => {
		if (next === current) {
			return;
		}
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onValueChange !== undefined) {
			onValueChange(next);
		}

		setFocusEpoch((prev) => {
			const nextEpoch = prev + 1;
			return nextEpoch;
		});
	};

	const syncStepIds = useCallback((ids: string[]) => {
		setStepIds((prev) => {
			if (stepIdsEqual(prev, ids)) {
				return prev;
			}

			return ids;
		});
	}, []);

	const reportStepStatus = useCallback(
		(id: string, status: WorkflowStepStatus) => {
			setStatusById((prev) => {
				if (prev[id] === status) {
					return prev;
				}

				return { ...prev, [id]: status };
			});
		},
		[],
	);

	return (
		<WorkflowContext.Provider
			value={{
				value: current,
				setValue,
				baseId,
				orientation: resolvedOrientation,
				stepIds,
				syncStepIds,
				statusById,
				reportStepStatus,
				resolveNext,
				resolveBack,
				isFinish,
				focusEpoch,
			}}
		>
			<div
				data-slot="workflow"
				data-orientation={resolvedOrientation}
				className={cn("flex w-full flex-col gap-6", className)}
				{...rest}
			>
				{children}
			</div>
		</WorkflowContext.Provider>
	);
}

interface WorkflowTrackProps extends ComponentProps<"nav"> {
	children: ReactNode;
}

/**
 * Progress track (`nav` + ordered list). Label via aria-label.
 * Syncs step ids from DOM document order (Strict Mode safe).
 */
function WorkflowTrack({ children, className, ...rest }: WorkflowTrackProps) {
	const { orientation, syncStepIds } = useWorkflowContext();
	const listRef = useRef<HTMLOListElement>(null);

	useLayoutEffect(() => {
		const list = listRef.current;
		if (list === null) {
			return;
		}

		syncStepIds(readStepIdsFromList(list));
	}, [children, syncStepIds]);

	let listClass = "flex";
	if (orientation === "vertical") {
		listClass = cn(listClass, "flex-col gap-0");
	} else {
		listClass = cn(
			listClass,
			"flex-row flex-nowrap items-start gap-0 overflow-x-auto",
		);
	}

	return (
		<nav
			data-slot="workflow-track"
			className={cn("w-full", className)}
			{...rest}
		>
			<ol ref={listRef} className={listClass}>
				{children}
			</ol>
		</nav>
	);
}

export type {
	WorkflowActionsProps,
	WorkflowIsFinishFn,
	WorkflowOrientation,
	WorkflowPanelProps,
	WorkflowProps,
	WorkflowResolveFn,
	WorkflowStepProps,
	WorkflowStepStatus,
	WorkflowTrackProps,
};
export {
	Workflow,
	WorkflowActions,
	WorkflowPanel,
	WorkflowStep,
	WorkflowTrack,
};
