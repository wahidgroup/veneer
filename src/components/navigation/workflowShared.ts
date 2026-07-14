import { createContext, useContext } from "react";

/**
 * Parent-driven step progress state.
 */
type WorkflowStepStatus = "pending" | "current" | "complete" | "error";

/**
 * Track layout direction.
 */
type WorkflowOrientation = "horizontal" | "vertical";

/**
 * Parent override for Next adjacency.
 */
type WorkflowResolveFn = (
	current: string,
	stepIds: string[],
) => string | undefined;

/**
 * Parent override for Finish visibility.
 */
type WorkflowIsFinishFn = (current: string, stepIds: string[]) => boolean;

interface WorkflowContextValue {
	value: string;
	setValue: (next: string) => void;
	baseId: string;
	orientation: WorkflowOrientation;
	stepIds: string[];
	syncStepIds: (ids: string[]) => void;
	statusById: Readonly<Record<string, WorkflowStepStatus>>;
	reportStepStatus: (id: string, status: WorkflowStepStatus) => void;
	resolveNext: WorkflowResolveFn | undefined;
	resolveBack: WorkflowResolveFn | undefined;
	isFinish: WorkflowIsFinishFn | undefined;
	focusEpoch: number;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

function useWorkflowContext(): WorkflowContextValue {
	const ctx = useContext(WorkflowContext);
	if (ctx === null) {
		throw new Error("Workflow components must be used within Workflow");
	}

	return ctx;
}

function nextInOrder(current: string, stepIds: string[]): string | undefined {
	const index = stepIds.indexOf(current);
	if (index < 0) {
		return undefined;
	}
	if (index >= stepIds.length - 1) {
		return undefined;
	}

	const next = stepIds[index + 1];
	return next;
}

function prevInOrder(current: string, stepIds: string[]): string | undefined {
	const index = stepIds.indexOf(current);
	if (index <= 0) {
		return undefined;
	}

	const prev = stepIds[index - 1];
	return prev;
}

function defaultIsFinish(current: string, stepIds: string[]): boolean {
	if (stepIds.length === 0) {
		return false;
	}

	const last = stepIds[stepIds.length - 1];
	const result = current === last;
	return result;
}

function stepIdsEqual(left: string[], right: string[]): boolean {
	if (left.length !== right.length) {
		return false;
	}

	for (let i = 0; i < left.length; i += 1) {
		if (left[i] !== right[i]) {
			return false;
		}
	}

	return true;
}

/**
 * First/last for connector chrome. Unknown id MUST NOT count as both ends.
 */
function stepEdgeFlags(
	stepIds: string[],
	value: string,
): { isFirst: boolean; isLast: boolean } {
	const index = stepIds.indexOf(value);
	if (index < 0) {
		return { isFirst: false, isLast: false };
	}

	return {
		isFirst: index === 0,
		isLast: index === stepIds.length - 1,
	};
}

/**
 * Reads direct-track step ids in document order.
 * WorkflowStep children must live under WorkflowTrack's `ol`.
 */
function readStepIdsFromList(list: HTMLOListElement): string[] {
	const next: string[] = [];
	const items = list.querySelectorAll(":scope > [data-slot='workflow-step']");
	for (const item of items) {
		const id = item.getAttribute("data-value");
		if (id === null) {
			continue;
		}
		if (id.length === 0) {
			continue;
		}

		next.push(id);
	}

	return next;
}

export type {
	WorkflowContextValue,
	WorkflowIsFinishFn,
	WorkflowOrientation,
	WorkflowResolveFn,
	WorkflowStepStatus,
};
export {
	defaultIsFinish,
	nextInOrder,
	prevInOrder,
	readStepIdsFromList,
	stepEdgeFlags,
	stepIdsEqual,
	useWorkflowContext,
	WorkflowContext,
};
