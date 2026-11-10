import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Button } from "../forms/Button.js";
import { Tooltip } from "./Tooltip.js";

describe("Tooltip", () => {
	it("shows content on hover and hides on leave", async () => {
		const user = userEvent.setup();

		render(
			<Tooltip content="Stack ARN" delayMs={0}>
				<Button>Hover me</Button>
			</Tooltip>,
		);

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

		await user.hover(screen.getByRole("button", { name: "Hover me" }));
		expect(screen.getByRole("tooltip")).toHaveTextContent("Stack ARN");

		await user.unhover(screen.getByRole("button", { name: "Hover me" }));
		await waitFor(() => {
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		});
	});

	it("shows content on focus", async () => {
		const user = userEvent.setup();

		render(
			<Tooltip content="Disabled reason" delayMs={0}>
				<Button>Focus me</Button>
			</Tooltip>,
		);

		await user.tab();
		expect(screen.getByRole("tooltip")).toHaveTextContent("Disabled reason");
	});

	it("does not open when disabled", async () => {
		const user = userEvent.setup();

		render(
			<Tooltip content="Hidden" delayMs={0} disabled>
				<Button>No tip</Button>
			</Tooltip>,
		);

		await user.hover(screen.getByRole("button", { name: "No tip" }));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("has no accessibility violations when closed", async () => {
		await expectNoA11yViolations(
			<Tooltip content="A11y tip" delayMs={0}>
				<Button>A11y</Button>
			</Tooltip>,
		);
	});

	it("has no accessibility violations when open", async () => {
		const user = userEvent.setup();
		render(
			<Tooltip content="A11y tip" delayMs={0}>
				<Button>A11y open</Button>
			</Tooltip>,
		);

		await user.hover(screen.getByRole("button", { name: "A11y open" }));
		const results = await axe(screen.getByRole("tooltip"));
		expect(results).toHaveNoViolations();
	});
});
