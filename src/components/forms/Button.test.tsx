import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "./Button.js";
import {
	cssVarStyle,
	expectNoA11yViolations,
} from "../../test/component-harness.js";

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

	it("accepts --button-* skin vars on the element", () => {
		const skinVars = {
			"--button-bg": "#22c55e",
			"--button-fg": "#052e16",
			"--button-height": "48px",
			"--button-px": "20px",
			"--button-fz": "16px",
		} satisfies Record<`--${string}`, string>;

		render(<Button style={cssVarStyle(skinVars)}>Skinned</Button>);

		const btn = screen.getByRole("button", { name: "Skinned" });
		for (const [name, value] of Object.entries(skinVars)) {
			expect(btn.style.getPropertyValue(name)).toBe(value);
		}
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
		await expectNoA11yViolations(<Button>Accessible</Button>);
	});
});
