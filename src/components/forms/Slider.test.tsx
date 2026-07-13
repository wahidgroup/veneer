import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Slider } from "./Slider.js";

describe("Slider", () => {
	it("emits values on change", () => {
		const values: number[] = [];

		render(
			<Slider
				aria-label="Capacity"
				min={0}
				max={10}
				defaultValue={0}
				showValue={false}
				onValueChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		fireEvent.change(screen.getByRole("slider"), {
			target: { value: "7" },
		});
		expect(values).toEqual([7]);
	});

	it("shows the controlled value", () => {
		render(<Slider aria-label="Capacity" value={42} showValue />);
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("merges className", () => {
		const { container } = render(
			<Slider aria-label="Capacity" className="extra" value={1} />,
		);
		expect(container.querySelector('[data-slot="slider"]')).toHaveClass(
			"extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Slider aria-label="Capacity" value={5} />,
		);
	});
});
