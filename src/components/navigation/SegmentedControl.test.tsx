import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { SegmentedControlProps } from "./SegmentedControl.js";
import { SegmentedControl } from "./SegmentedControl.js";
import {
	cssVarStyle,
	expectNoA11yViolations,
} from "../../test/component-harness.js";

const UNIT_OPTIONS = [
	{ value: "btc", label: "BTC" },
	{ value: "sats", label: "sats" },
];

function renderUnit(
	overrides: Partial<SegmentedControlProps> = {},
): ReturnType<typeof render> {
	return render(
		<SegmentedControl
			aria-label="Unit"
			options={UNIT_OPTIONS}
			defaultValue="btc"
			onValueChange={() => {
				/* intentional no-op */
			}}
			{...overrides}
		/>,
	);
}

describe("SegmentedControl", () => {
	it("renders a radiogroup with checked option", () => {
		renderUnit();

		expect(
			screen.getByRole("radiogroup", { name: "Unit" }),
		).toHaveAttribute("data-slot", "segmented-control");
		expect(screen.getByRole("radio", { name: "BTC" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
		expect(screen.getByRole("radio", { name: "sats" })).toHaveAttribute(
			"aria-checked",
			"false",
		);
	});

	it("reports value changes on click", async () => {
		const user = userEvent.setup();
		let last = "";

		renderUnit({
			onValueChange: (value) => {
				last = value;
			},
		});

		await user.click(screen.getByRole("radio", { name: "sats" }));
		expect(last).toBe("sats");
		expect(screen.getByRole("radio", { name: "sats" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
	});

	it.each([
		{ key: "{ArrowRight}", expected: "sats" },
		{ key: "{End}", expected: "sats" },
		{ key: "{Home}", expected: "btc" },
	])("moves selection with $key", async ({ key, expected }) => {
		const user = userEvent.setup();
		let last = "btc";

		renderUnit({
			onValueChange: (value) => {
				last = value;
			},
		});

		screen.getByRole("radio", { name: "BTC" }).focus();
		await user.keyboard(key);
		expect(last).toBe(expected);
	});

	it("disables all options when group disabled", () => {
		renderUnit({ disabled: true });
		expect(screen.getByRole("radio", { name: "BTC" })).toBeDisabled();
		expect(screen.getByRole("radio", { name: "sats" })).toBeDisabled();
	});

	it("disables a single option", () => {
		renderUnit({
			options: [
				{ value: "btc", label: "BTC" },
				{ value: "sats", label: "sats", disabled: true },
			],
		});
		expect(screen.getByRole("radio", { name: "BTC" })).toBeEnabled();
		expect(screen.getByRole("radio", { name: "sats" })).toBeDisabled();
	});

	it("accepts CSS variable style overrides on the root", () => {
		const skinVars = {
			"--segment-track-bg": "#112233",
			"--segment-active-bg": "#445566",
			"--segment-active-fg": "#ffffff",
			"--segment-inactive-fg": "#8899aa",
			"--segment-active-ring": "#aabbcc",
		} satisfies Record<`--${string}`, string>;

		renderUnit({ style: cssVarStyle(skinVars) });

		const group = screen.getByRole("radiogroup", { name: "Unit" });
		for (const [name, value] of Object.entries(skinVars)) {
			expect(group.style.getPropertyValue(name)).toBe(value);
		}
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<SegmentedControl
				aria-label="Unit"
				options={UNIT_OPTIONS}
				defaultValue="btc"
				onValueChange={() => {
					/* intentional no-op */
				}}
			/>,
		);
	});
});
