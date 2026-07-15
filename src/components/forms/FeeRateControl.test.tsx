import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FeeRateControl } from "./FeeRateControl.js";

describe("FeeRateControl", () => {
	it("renders fee-rate-control with slider and number input", () => {
		render(<FeeRateControl aria-label="Fee rate" defaultValue={10} />);

		expect(
			screen.getByRole("radiogroup", { name: "Fee rate presets" }),
		).toBeInTheDocument();
		expect(screen.getByRole("slider", { name: "Fee rate" })).toHaveValue(
			"10",
		);
		expect(
			screen.getByRole("spinbutton", { name: "Fee rate (sat/vB)" }),
		).toHaveValue(10);
		expect(
			document.querySelector("[data-slot='fee-rate-control']"),
		).toBeInTheDocument();
	});

	it("sets rate when a preset is selected", async () => {
		const user = userEvent.setup();
		const rates: number[] = [];

		render(
			<FeeRateControl
				aria-label="Fee rate"
				defaultValue={1}
				onValueChange={(rate) => {
					rates.push(rate);
				}}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "Priority" }));
		expect(rates.at(-1)).toBe(50);
		expect(screen.getByRole("slider", { name: "Fee rate" })).toHaveValue(
			"50",
		);
	});

	it("updates rate when the slider moves", () => {
		const rates: number[] = [];

		render(
			<FeeRateControl
				aria-label="Fee rate"
				defaultValue={10}
				onValueChange={(rate) => {
					rates.push(rate);
				}}
			/>,
		);

		fireEvent.change(screen.getByRole("slider", { name: "Fee rate" }), {
			target: { value: "25" },
		});
		expect(rates).toEqual([25]);
	});

	it("updates rate from the number input", () => {
		const rates: number[] = [];

		render(
			<FeeRateControl
				aria-label="Fee rate"
				defaultValue={10}
				onValueChange={(rate) => {
					rates.push(rate);
				}}
			/>,
		);

		fireEvent.change(
			screen.getByRole("spinbutton", { name: "Fee rate (sat/vB)" }),
			{ target: { value: "33" } },
		);
		expect(rates.at(-1)).toBe(33);
	});

	it("clamps custom presets to min/max", async () => {
		const user = userEvent.setup();
		const rates: number[] = [];

		render(
			<FeeRateControl
				aria-label="Fee rate"
				min={5}
				max={40}
				defaultValue={10}
				presets={[
					{ id: "low", label: "Low", rate: 1 },
					{ id: "high", label: "High", rate: 100 },
				]}
				onValueChange={(rate) => {
					rates.push(rate);
				}}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "High" }));
		expect(rates.at(-1)).toBe(40);

		await user.click(screen.getByRole("radio", { name: "Low" }));
		expect(rates.at(-1)).toBe(5);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<FeeRateControl aria-label="Fee rate" defaultValue={10} />,
		);
	});
});
