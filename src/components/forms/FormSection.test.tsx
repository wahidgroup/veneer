import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FormSection } from "./FormSection.js";

describe("FormSection", () => {
	it("renders title and children", () => {
		render(
			<FormSection title="Network" description="VPC placement">
				<p>Child</p>
			</FormSection>,
		);

		expect(
			screen.getByRole("heading", { name: "Network" }),
		).toBeInTheDocument();
		expect(screen.getByText("VPC placement")).toBeInTheDocument();
		expect(screen.getByText("Child")).toBeInTheDocument();
	});

	it("merges className", () => {
		const { container } = render(
			<FormSection title="Network" className="extra">
				<span />
			</FormSection>,
		);
		expect(
			container.querySelector('[data-slot="form-section"]'),
		).toHaveClass("extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<FormSection title="Network">
				<button type="button">Ok</button>
			</FormSection>,
		);
	});
});
