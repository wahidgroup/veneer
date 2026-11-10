import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Button } from "../forms/Button.js";
import { EmptyState } from "./EmptyState.js";

describe("EmptyState", () => {
	it("renders title with status role and default icon chrome", () => {
		const { container } = render(<EmptyState title="No stacks" />);

		const status = screen.getByRole("status");
		expect(status).toHaveAttribute("data-slot", "empty-state");
		expect(status).toHaveAttribute("data-size", "md");
		expect(screen.getByText("No stacks")).toBeInTheDocument();
		expect(container.querySelector("[data-slot='empty-state-icon']")).not.toBeNull();
	});

	it("renders supporting description and action", () => {
		render(
			<EmptyState title="No stacks" action={<Button type="button">Create stack</Button>}>
				Create a stack to get started.
			</EmptyState>,
		);
		expect(screen.getByText("Create a stack to get started.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create stack" })).toBeInTheDocument();
	});

	it("hides the icon when icon is null", () => {
		const { container } = render(<EmptyState title="No results" icon={null} />);
		expect(container.querySelector("[data-slot='empty-state-icon']")).toBeNull();
	});

	it("uses a custom icon when provided", () => {
		render(<EmptyState title="Custom" icon={<span data-testid="custom-empty-icon">!</span>} />);
		expect(screen.getByTestId("custom-empty-icon")).toBeInTheDocument();
		expect(screen.getByRole("status").querySelector("[data-slot='empty-state-icon']")).toBeNull();
	});

	it.each([{ size: "sm" as const }, { size: "md" as const }])("applies size $size", ({ size }) => {
		render(<EmptyState title="Sized" size={size} />);
		expect(screen.getByRole("status")).toHaveAttribute("data-size", size);
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(<EmptyState title="No stacks" />);
	});

	it("has no accessibility violations with action", async () => {
		await expectNoA11yViolations(
			<EmptyState size="sm" title="No stacks" action={<Button type="button">Create stack</Button>}>
				Create a stack to get started.
			</EmptyState>,
		);
	});
});
