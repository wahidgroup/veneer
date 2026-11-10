import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { DiffResource } from "./diffTypes.js";
import { PlanSummary } from "./PlanSummary.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";

const RESOURCES: DiffResource[] = [
	{ id: "a", kind: "create", path: "aws_s3_bucket.a" },
	{ id: "b", kind: "update", path: "aws_instance.b" },
	{ id: "c", kind: "destroy", path: "aws_iam_role.c" },
	{ id: "d", kind: "replace", path: "aws_lb.d" },
];

describe("PlanSummary", () => {
	it("derives counts from resources", () => {
		render(<PlanSummary resources={RESOURCES} />);
		const region = screen.getByRole("region", { name: "Plan summary" });
		expect(region).toHaveAttribute("data-slot", "plan-summary");
		expect(screen.getByRole("button", { name: "Filter Create" })).toHaveTextContent("1");
		expect(screen.getByRole("button", { name: "Filter Update" })).toHaveTextContent("1");
		expect(screen.getByRole("button", { name: "Filter Destroy" })).toHaveTextContent("1");
		expect(screen.getByRole("button", { name: "Filter Replace" })).toHaveTextContent("1");
	});

	it("filters DiffView rows by kind chips", async () => {
		const user = userEvent.setup();
		render(<PlanSummary resources={RESOURCES} />);

		expect(screen.getByText("aws_s3_bucket.a")).toBeInTheDocument();
		expect(screen.getByText("aws_instance.b")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Filter Create" }));
		expect(screen.queryByText("aws_s3_bucket.a")).not.toBeInTheDocument();
		expect(screen.getByText("aws_instance.b")).toBeInTheDocument();
	});

	it("resets filters when the last kind would be cleared", async () => {
		const user = userEvent.setup();
		render(<PlanSummary resources={[{ id: "a", kind: "create", path: "only.create" }]} />);

		await user.click(screen.getByRole("button", { name: "Filter Update" }));
		await user.click(screen.getByRole("button", { name: "Filter Destroy" }));
		await user.click(screen.getByRole("button", { name: "Filter Replace" }));
		await user.click(screen.getByRole("button", { name: "Filter Create" }));
		expect(screen.getByText("only.create")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Filter Create" })).toHaveAttribute("aria-pressed", "true");
	});

	it("renders DiffView tree body", () => {
		render(<PlanSummary resources={RESOURCES} />);
		const list = screen.getByRole("list", {
			name: "Plan summary changes",
		});
		expect(within(list).getByText("aws_lb.d")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<PlanSummary resources={RESOURCES} />);
	});
});
