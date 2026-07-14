import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";
import { Badge } from "../indicators/Badge.js";
import { ProgressBar } from "./ProgressBar.js";
import { resolveProgressMax } from "./resolveProgressMax.js";

type ProgressTaskStatus = "pending" | "running" | "complete" | "error";

interface ProgressTask {
	id: string;
	label: ReactNode;
	value?: number;
	max?: number;
	status?: ProgressTaskStatus;
}

interface ProgressGroupProps extends Omit<ComponentProps<"div">, "children"> {
	tasks: ProgressTask[];
	label?: ReactNode;
	"aria-label": string;
}

interface CompositeProgress {
	/** Omit when overall bar is indeterminate. */
	value?: number;
	max: number;
}

function resolveStatus(task: ProgressTask): ProgressTaskStatus {
	if (task.status !== undefined) {
		return task.status;
	}
	if (task.value === undefined) {
		return "running";
	}

	const max = resolveProgressMax(task.max);
	if (task.value >= max) {
		return "complete";
	}

	return "running";
}

/**
 * Lane fraction in `[0, 1]`. `undefined` = indeterminate lane.
 */
function taskFraction(task: ProgressTask): number | undefined {
	const status = resolveStatus(task);
	if (status === "pending") {
		return 0;
	}
	if (status === "complete") {
		return 1;
	}

	const max = resolveProgressMax(task.max);

	if (task.value === undefined) {
		if (status === "error") {
			return 0;
		}
		return undefined;
	}

	let value = task.value;
	if (value < 0) {
		value = 0;
	}
	if (value > max) {
		value = max;
	}

	return value / max;
}

/**
 * Overall progress from parallel lanes. Parent indeterminate when any
 * running lane has no numeric value; otherwise mean of lane fractions
 * scaled to `max` 100.
 */
function compositeProgress(tasks: ProgressTask[]): CompositeProgress {
	const max = 100;
	if (tasks.length === 0) {
		return { value: 0, max };
	}

	const fractions: number[] = [];
	for (const task of tasks) {
		const fraction = taskFraction(task);
		if (fraction === undefined) {
			return { max };
		}

		fractions.push(fraction);
	}

	let sum = 0;
	for (const fraction of fractions) {
		sum += fraction;
	}

	const mean = sum / fractions.length;
	return {
		value: Math.round(mean * max),
		max,
	};
}

function badgeForStatus(status: ProgressTaskStatus): {
	variant: "default" | "info" | "success" | "danger";
	label: string;
} {
	if (status === "complete") {
		return { variant: "success", label: "Complete" };
	}
	if (status === "error") {
		return { variant: "danger", label: "Failed" };
	}
	if (status === "pending") {
		return { variant: "default", label: "Pending" };
	}

	return { variant: "info", label: "Running" };
}

/**
 * Parallel job lanes under one composite ProgressBar. Reuses ProgressBar
 * for overall + each task. Composite is indeterminate while any running
 * lane lacks a numeric value.
 */
function ProgressGroup({
	tasks,
	label,
	"aria-label": ariaLabel,
	className,
	...rest
}: ProgressGroupProps) {
	const overall = compositeProgress(tasks);

	return (
		<div
			data-slot="progress-group"
			role="group"
			aria-label={ariaLabel}
			className={cn("flex w-full flex-col gap-3", className)}
			{...rest}
		>
			<ProgressBar
				aria-label={`${ariaLabel} overall`}
				value={overall.value}
				max={overall.max}
				label={label}
				size="md"
			/>
			<ul
				className="flex flex-col gap-2"
				aria-label={`${ariaLabel} tasks`}
			>
				{tasks.map((task) => {
					const status = resolveStatus(task);
					const badge = badgeForStatus(status);
					const laneLabel = task.label;

					let laneAria = task.id;
					if (typeof laneLabel === "string") {
						laneAria = laneLabel;
					}

					const laneMax = resolveProgressMax(task.max);

					let laneValue = task.value;
					if (status === "pending") {
						laneValue = 0;
					} else if (status === "complete") {
						laneValue = laneMax;
					}

					return (
						<li
							key={task.id}
							data-slot="progress-group-task"
							data-status={status}
							className="flex flex-col gap-1"
						>
							<div className="flex items-center justify-between gap-2">
								<span className="min-w-0 truncate text-xs text-foreground">
									{laneLabel}
								</span>
								<Badge variant={badge.variant} size="sm">
									{badge.label}
								</Badge>
							</div>
							<ProgressBar
								aria-label={laneAria}
								value={laneValue}
								max={laneMax}
								size="sm"
							/>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export type {
	CompositeProgress,
	ProgressGroupProps,
	ProgressTask,
	ProgressTaskStatus,
};
export { ProgressGroup, compositeProgress, taskFraction };
