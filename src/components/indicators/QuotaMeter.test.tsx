import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { QuotaMeter } from "./QuotaMeter.js";

describe("QuotaMeter", () => {
	it.each([
		{ size: "sm" as const },
		{ size: "md" as const },
		{ size: "lg" as const },
	])("sets data-size $size", ({ size }) => {
		render(<QuotaMeter aria-label="Stacks" value={40} size={size} />);
		expect(screen.getByRole("meter")).toHaveAttribute("data-size", size);
	});

	it("exposes meter values", () => {
		render(
			<QuotaMeter
				aria-label="Stacks"
				value={42}
				max={100}
				valueText="42 / 100 stacks"
			/>,
		);
		const meter = screen.getByRole("meter", { name: "Stacks" });
		expect(meter).toHaveAttribute("aria-valuenow", "42");
		expect(meter).toHaveAttribute("aria-valuemax", "100");
		expect(meter).toHaveAttribute("aria-valuetext", "42 / 100 stacks");
	});

	it("applies className to the root", () => {
		const { container } = render(
			<QuotaMeter aria-label="Stacks" value={10} className="extra" />,
		);
		expect(
			container.querySelector('[data-slot="quota-meter"]'),
		).toHaveClass("extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<QuotaMeter aria-label="Stacks" value={60} label="Quota" />,
		);
	});
});
