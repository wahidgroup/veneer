import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Badge } from "../indicators/Badge.js";
import { StatDisplay } from "./StatDisplay.js";

describe("StatDisplay", () => {
	it("renders label and value on a Card root", () => {
		const { container } = render(
			<StatDisplay label="Active stacks" value="42" />,
		);

		const root = container.querySelector("[data-slot='stat-display']");
		expect(root).not.toBeNull();
		expect(root).toHaveAttribute("data-tone", "default");
		expect(root).toHaveAttribute("data-size", "sm");
		expect(screen.getByText("Active stacks")).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("renders hint when provided", () => {
		render(
			<StatDisplay
				label="Drift"
				value="3"
				hint="Resources out of sync"
			/>,
		);
		expect(screen.getByText("Resources out of sync")).toBeInTheDocument();
	});

	it("renders a consumer badge instead of the built-in tone caption", () => {
		render(
			<StatDisplay
				label="Deployments"
				value="128"
				tone="success"
				badge={<Badge variant="success">+12%</Badge>}
			/>,
		);
		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(screen.queryByText("Success")).not.toBeInTheDocument();
	});

	it.each([
		{ tone: "success" as const, caption: "Success" },
		{ tone: "warning" as const, caption: "Warning" },
		{ tone: "danger" as const, caption: "Danger" },
	])(
		"pairs tone $tone with a visible caption when badge is omitted",
		({ tone, caption }) => {
			const { container } = render(
				<StatDisplay label="Metric" value="1" tone={tone} />,
			);

			const root = container.querySelector("[data-slot='stat-display']");
			expect(root).toHaveAttribute("data-tone", tone);
			expect(screen.getByText(caption)).toBeInTheDocument();
		},
	);

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<StatDisplay label="Active stacks" value="42" />,
		);
	});

	it("has no accessibility violations with tone and badge", async () => {
		await expectNoA11yViolations(
			<StatDisplay
				label="Deployments"
				value="128"
				tone="success"
				badge={<Badge variant="success">+12%</Badge>}
			/>,
		);
	});
});
