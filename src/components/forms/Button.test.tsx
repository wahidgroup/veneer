import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Button } from "./Button.js";

describe("Button", () => {
	it("renders children with data-slot", () => {
		render(<Button>Click me</Button>);
		const btn = screen.getByRole("button", { name: "Click me" });
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("data-slot", "button");
	});

	it.each([
		{ type: undefined, expected: "button" },
		{ type: "submit" as const, expected: "submit" },
	])("renders with type=$expected", ({ type, expected }) => {
		render(<Button type={type}>Btn</Button>);
		expect(screen.getByRole("button")).toHaveAttribute("type", expected);
	});

	it.each([
		{ variant: undefined, label: "default filled" },
		{ variant: "danger" as const, label: "danger" },
		{ variant: "outlined" as const, label: "outlined" },
		{ variant: "ghost" as const, label: "ghost" },
	])("renders $label variant", ({ variant }) => {
		render(<Button variant={variant}>Btn</Button>);
		const btn = screen.getByRole("button");
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("data-slot", "button");
	});

	it.each([
		{ size: undefined, label: "default md" },
		{ size: "icon" as const, label: "icon" },
		{ size: "sm" as const, label: "sm" },
	])("renders $label size", ({ size }) => {
		render(
			<Button size={size} aria-label="Sized">
				×
			</Button>,
		);
		const btn = screen.getByRole("button");
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("data-slot", "button");
	});

	it("applies disabled attribute", () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("fires onClick when clicked", async () => {
		const user = userEvent.setup();
		let clicks = 0;
		render(
			<Button
				onClick={() => {
					clicks += 1;
				}}
			>
				Click
			</Button>,
		);

		await user.click(screen.getByRole("button"));
		expect(clicks).toBe(1);
	});

	it("does not fire onClick when disabled", async () => {
		const user = userEvent.setup();
		let clicks = 0;
		render(
			<Button
				onClick={() => {
					clicks += 1;
				}}
				disabled
			>
				No click
			</Button>,
		);

		await user.click(screen.getByRole("button"));
		expect(clicks).toBe(0);
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Button>Accessible</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
