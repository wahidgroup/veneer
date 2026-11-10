import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible.js";

function DemoCollapsible({
	open,
	defaultOpen,
	onOpenChange,
	disabled,
}: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (next: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} disabled={disabled}>
			<CollapsibleTrigger>Toggle section</CollapsibleTrigger>
			<CollapsibleContent>Hidden details</CollapsibleContent>
		</Collapsible>
	);
}

describe("Collapsible", () => {
	it("starts closed and opens on click", async () => {
		const user = userEvent.setup();

		render(<DemoCollapsible />);

		expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Toggle section" })).toHaveAttribute("aria-expanded", "false");

		await user.click(screen.getByRole("button", { name: "Toggle section" }));
		expect(screen.getByText("Hidden details")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Toggle section" })).toHaveAttribute("aria-expanded", "true");
	});

	it("respects defaultOpen", () => {
		render(<DemoCollapsible defaultOpen />);

		expect(screen.getByText("Hidden details")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Toggle section" })).toHaveAttribute("aria-expanded", "true");
	});

	it("toggles aria-expanded when opened and closed", async () => {
		const user = userEvent.setup();

		render(<DemoCollapsible />);

		const trigger = screen.getByRole("button", { name: "Toggle section" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		expect(trigger.querySelector('[data-slot="collapsible-caret"]')).not.toBeNull();

		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");

		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "false");
	});

	it("reports open changes when controlled", async () => {
		const user = userEvent.setup();
		let isOpen = false;
		const { rerender } = render(
			<DemoCollapsible
				open={isOpen}
				onOpenChange={(next) => {
					isOpen = next;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Toggle section" }));
		expect(isOpen).toBe(true);

		rerender(
			<DemoCollapsible
				open={isOpen}
				onOpenChange={(next) => {
					isOpen = next;
				}}
			/>,
		);
		expect(screen.getByText("Hidden details")).toBeInTheDocument();
	});

	it("does not toggle when disabled", async () => {
		const user = userEvent.setup();

		render(<DemoCollapsible disabled />);

		await user.click(screen.getByRole("button", { name: "Toggle section" }));
		expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
	});

	it("toggles with Space and Enter", async () => {
		const user = userEvent.setup();

		render(<DemoCollapsible />);

		screen.getByRole("button", { name: "Toggle section" }).focus();
		await user.keyboard("{Enter}");
		expect(screen.getByText("Hidden details")).toBeInTheDocument();

		await user.keyboard(" ");
		expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
	});

	it("links trigger and content with aria-controls", async () => {
		const user = userEvent.setup();

		render(<DemoCollapsible />);

		const trigger = screen.getByRole("button", { name: "Toggle section" });
		const controls = trigger.getAttribute("aria-controls");
		expect(controls).not.toBeNull();

		await user.click(trigger);
		expect(screen.getByText("Hidden details")).toHaveAttribute("id", controls);
	});

	it("renders data-slot attributes", () => {
		const { container } = render(<DemoCollapsible defaultOpen />);

		expect(container.querySelector("[data-slot='collapsible']")).not.toBeNull();
		expect(container.querySelector("[data-slot='collapsible-trigger']")).not.toBeNull();
		expect(container.querySelector("[data-slot='collapsible-content']")).not.toBeNull();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<DemoCollapsible defaultOpen />);
	});

	it("throws when used outside Collapsible", () => {
		expect(() => {
			render(<CollapsibleTrigger>Toggle</CollapsibleTrigger>);
		}).toThrow("Collapsible components must be used within Collapsible");
	});
});
