import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Sparkline } from "./Sparkline.js";

describe("Sparkline", () => {
	it("renders a polyline with an accessible summary", () => {
		const { container } = render(<Sparkline values={[10, 20, 15, 30]} tone="success" />);

		const chart = screen.getByRole("img", {
			name: "Sparkline chart: last value 30, minimum 10, maximum 30",
		});
		expect(chart).toHaveAttribute("data-slot", "sparkline");
		expect(chart).toHaveAttribute("data-tone", "success");
		expect(container.querySelector("polyline")).toBeInTheDocument();
	});

	it("renders an empty chart when values are empty", () => {
		const { container } = render(<Sparkline values={[]} />);

		expect(screen.getByRole("img", { name: "No data" })).toHaveAttribute("data-slot", "sparkline");
		expect(container.querySelector("polyline")).toBeNull();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Sparkline values={[1, 4, 2, 8, 5]} tone="default" />);
	});
});
