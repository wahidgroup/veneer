import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { VisuallyHidden } from "./VisuallyHidden.js";

describe("VisuallyHidden", () => {
	it("keeps text available to the accessibility tree", () => {
		render(
			<button type="button">
				Save
				<VisuallyHidden> stack prod-api</VisuallyHidden>
			</button>,
		);

		expect(
			screen.getByRole("button", { name: /Save\s*stack prod-api/ }),
		).toBeInTheDocument();
	});

	it("applies className to the root", () => {
		const { container } = render(
			<VisuallyHidden className="extra">Hidden</VisuallyHidden>,
		);
		expect(
			container.querySelector('[data-slot="visually-hidden"]'),
		).toHaveClass("extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<span>
				Visible
				<VisuallyHidden>extra context</VisuallyHidden>
			</span>,
		);
	});
});
