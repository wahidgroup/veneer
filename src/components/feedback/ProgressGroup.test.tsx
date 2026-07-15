import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ProgressTask } from "./ProgressGroup.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";
import {
	ProgressGroup,
	compositeProgress,
	taskFraction,
} from "./ProgressGroup.js";

describe("taskFraction", () => {
	it.each([
		{
			task: { id: "a", label: "A", status: "pending" as const },
			expected: 0,
		},
		{
			task: { id: "b", label: "B", status: "complete" as const },
			expected: 1,
		},
		{
			task: {
				id: "c",
				label: "C",
				status: "running" as const,
				value: 50,
				max: 100,
			},
			expected: 0.5,
		},
		{
			task: { id: "d", label: "D", status: "running" as const },
			expected: undefined,
		},
	])("maps $task.status lane", ({ task, expected }) => {
		expect(taskFraction(task)).toBe(expected);
	});
});

describe("compositeProgress", () => {
	it("averages determinate lanes", () => {
		const tasks: ProgressTask[] = [
			{ id: "a", label: "A", value: 100, max: 100 },
			{ id: "b", label: "B", value: 0, max: 100 },
		];
		expect(compositeProgress(tasks)).toEqual({ value: 50, max: 100 });
	});

	it("is indeterminate when any running lane lacks value", () => {
		const tasks: ProgressTask[] = [
			{ id: "a", label: "A", value: 100, status: "complete" },
			{ id: "b", label: "B", status: "running" },
		];
		expect(compositeProgress(tasks)).toEqual({ max: 100 });
	});

	it("returns zero for an empty task list", () => {
		expect(compositeProgress([])).toEqual({ value: 0, max: 100 });
	});
});

describe("ProgressGroup", () => {
	const TASKS: ProgressTask[] = [
		{
			id: "plan",
			label: "Plan",
			value: 100,
			status: "complete",
		},
		{
			id: "apply",
			label: "Apply",
			value: 40,
			status: "running",
		},
		{
			id: "verify",
			label: "Verify",
			status: "pending",
		},
	];

	it("renders overall and per-task progress bars", () => {
		render(
			<ProgressGroup aria-label="Deploy" tasks={TASKS} label="Overall" />,
		);
		expect(screen.getByRole("group", { name: "Deploy" })).toHaveAttribute(
			"data-slot",
			"progress-group",
		);
		expect(
			screen.getByRole("progressbar", { name: "Deploy overall" }),
		).toHaveAttribute("aria-valuenow", "47");
		expect(
			screen.getByRole("progressbar", { name: "Plan" }),
		).toHaveAttribute("aria-valuenow", "100");
		expect(
			screen.getByRole("progressbar", { name: "Apply" }),
		).toHaveAttribute("aria-valuenow", "40");
		expect(
			screen.getByRole("progressbar", { name: "Verify" }),
		).toHaveAttribute("aria-valuenow", "0");
	});

	it("shows status badges on lanes", () => {
		render(<ProgressGroup aria-label="Deploy" tasks={TASKS} />);
		const list = screen.getByRole("list", { name: "Deploy tasks" });
		expect(within(list).getByText("Complete")).toBeInTheDocument();
		expect(within(list).getByText("Running")).toBeInTheDocument();
		expect(within(list).getByText("Pending")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ProgressGroup aria-label="Deploy" tasks={TASKS} />,
		);
	});
});
