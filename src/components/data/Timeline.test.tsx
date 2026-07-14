import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Timeline } from "./Timeline.js";

describe("Timeline", () => {
	it("renders an ordered list of events", () => {
		const { container } = render(
			<Timeline
				aria-label="Deploy history"
				items={[
					{
						id: "1",
						title: "Plan applied",
						timestamp: "10:00",
						status: "success",
					},
					{
						id: "2",
						title: "Drift detected",
						timestamp: "10:05",
						description: "2 resources drifted",
						status: "drifted",
					},
				]}
			/>,
		);

		expect(screen.getByRole("list", { name: "Deploy history" })).toBe(
			container.querySelector("[data-slot='timeline']"),
		);
		expect(screen.getByText("Plan applied")).toBeInTheDocument();
		expect(screen.getByText("10:00")).toBeInTheDocument();
		expect(screen.getByText("2 resources drifted")).toBeInTheDocument();
		expect(screen.getByText("Success")).toBeInTheDocument();
		expect(screen.getByText("Drifted")).toBeInTheDocument();
		expect(
			container.querySelectorAll("[data-slot='timeline-item']"),
		).toHaveLength(2);
		expect(
			container.querySelectorAll("[data-slot='timeline-connector']"),
		).toHaveLength(1);
	});

	it("omits StatusBadge and connectors for a single item without status", () => {
		const { container } = render(
			<Timeline
				items={[
					{
						id: "1",
						title: "Note",
						timestamp: "now",
					},
				]}
			/>,
		);
		expect(screen.getByText("Note")).toBeInTheDocument();
		expect(screen.queryByText("Success")).not.toBeInTheDocument();
		expect(
			container.querySelectorAll("[data-slot='timeline-connector']"),
		).toHaveLength(0);
	});

	it("merges className onto the list", () => {
		const { container } = render(
			<Timeline
				className="timeline-extra"
				items={[{ id: "1", title: "A", timestamp: "t" }]}
			/>,
		);
		expect(container.querySelector("[data-slot='timeline']")).toHaveClass(
			"timeline-extra",
		);
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<Timeline
				aria-label="Deploy history"
				items={[
					{
						id: "1",
						title: "Started",
						timestamp: "09:00",
						status: "running",
					},
					{
						id: "2",
						title: "Finished",
						timestamp: "09:12",
						status: "success",
					},
				]}
			/>,
		);
	});
});
