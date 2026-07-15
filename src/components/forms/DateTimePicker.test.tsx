import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { DateTimePicker } from "./DateTimePicker.js";

describe("DateTimePicker", () => {
	it.each([
		{ granularity: "date" as const, label: "Start date" },
		{ granularity: "time" as const, label: "Start time" },
		{ granularity: "datetime" as const, label: "Window" },
	])("renders $granularity control", ({ granularity, label }) => {
		render(<DateTimePicker aria-label={label} granularity={granularity} />);
		expect(screen.getByLabelText(label)).toHaveAttribute(
			"data-slot",
			"datetime-picker",
		);
	});

	it("emits value changes", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<DateTimePicker
				aria-label="Start date"
				granularity="date"
				onValueChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		await user.type(screen.getByLabelText("Start date"), "2026-07-12");
		expect(values.at(-1)).toBe("2026-07-12");
	});

	it("sets aria-invalid when invalid", () => {
		render(<DateTimePicker aria-label="Window" invalid />);
		expect(screen.getByLabelText("Window")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	it("exposes a pointer cursor on the control", () => {
		render(<DateTimePicker aria-label="Window" />);
		expect(screen.getByLabelText("Window").className).toContain(
			"cursor-pointer",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<DateTimePicker aria-label="Window" granularity="date" />,
		);
	});
});
