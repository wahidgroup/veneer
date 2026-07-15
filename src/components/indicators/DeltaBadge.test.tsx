import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { DeltaBadge } from "./DeltaBadge.js";

describe("DeltaBadge", () => {
	it.each([
		{
			direction: "up" as const,
			prefix: "+",
		},
		{
			direction: "down" as const,
			prefix: "−",
		},
		{
			direction: "flat" as const,
			prefix: "=",
		},
	])("renders $direction with visible prefix", ({ direction, prefix }) => {
		render(<DeltaBadge direction={direction} value="12.4%" />);

		const badge = screen
			.getByText("12.4%")
			.closest("[data-slot='delta-badge']");
		expect(badge).not.toBeNull();
		expect(badge).toHaveAttribute("data-direction", direction);
		expect(badge?.textContent).toContain(prefix);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<DeltaBadge direction="up" value="3%" />);
	});
});
