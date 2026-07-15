import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { DeltaBadge } from "./DeltaBadge.js";

describe("DeltaBadge", () => {
	it.each([
		{
			direction: "up" as const,
			prefix: "+",
			variantClass: "bg-success-muted",
		},
		{
			direction: "down" as const,
			prefix: "−",
			variantClass: "bg-destructive-muted",
		},
		{
			direction: "flat" as const,
			prefix: "=",
			variantClass: "bg-muted",
		},
	])(
		"renders $direction with visible prefix",
		({ direction, prefix, variantClass }) => {
			render(<DeltaBadge direction={direction} value="12.4%" />);

			const badge = screen
				.getByText("12.4%")
				.closest("[data-slot='delta-badge']");
			expect(badge).not.toBeNull();
			expect(badge).toHaveAttribute("data-direction", direction);
			expect(badge?.textContent).toContain(prefix);
			expect(badge?.className).toContain(variantClass);
		},
	);

	it("has no accessibility violations", async () => {
		const { container } = render(<DeltaBadge direction="up" value="3%" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
