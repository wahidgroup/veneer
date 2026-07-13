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
		{
			variant: undefined,
			expectedClass: "bg-primary",
			label: "default filled",
		},
		{
			variant: "danger" as const,
			expectedClass: "text-destructive",
			label: "danger",
		},
		{
			variant: "outlined" as const,
			expectedClass: "border",
			label: "outlined",
		},
		{
			variant: "ghost" as const,
			expectedClass: "text-muted-foreground",
			label: "ghost",
		},
	])("applies $label variant class", ({ variant, expectedClass }) => {
		render(<Button variant={variant}>Btn</Button>);
		expect(screen.getByRole("button").className).toContain(expectedClass);
	});

	it.each([
		{ size: undefined, expectedClass: "px-5", label: "default md" },
		{ size: "icon" as const, expectedClass: "size-8", label: "icon" },
		{ size: "sm" as const, expectedClass: "text-xs", label: "sm" },
	])("applies $label size class", ({ size, expectedClass }) => {
		render(
			<Button size={size} aria-label="Sized">
				×
			</Button>,
		);
		expect(screen.getByRole("button").className).toContain(expectedClass);
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

	it("merges custom className", () => {
		render(<Button className="my-class">Btn</Button>);
		expect(screen.getByRole("button").className).toContain("my-class");
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Button>Accessible</Button>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
