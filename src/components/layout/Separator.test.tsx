import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Separator } from "./Separator.js";

describe("Separator", () => {
	it("renders a horizontal hr by default", () => {
		const { container } = render(<Separator />);
		const rule = container.querySelector("[data-slot='separator']");
		expect(rule).not.toBeNull();
		expect(rule?.tagName).toBe("HR");
		expect(rule).toHaveAttribute("data-orientation", "horizontal");
	});

	it("applies vertical orientation", () => {
		const { container } = render(<Separator orientation="vertical" />);
		const rule = container.querySelector("[data-slot='separator']");
		expect(rule).toHaveAttribute("data-orientation", "vertical");
		expect(rule).toHaveAttribute("aria-orientation", "vertical");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Separator />);
	});
});
