import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FormField } from "./FormField.js";
import { Input } from "./Input.js";

describe("FormField", () => {
	it("renders label, control, hint, and error", () => {
		render(
			<FormField label="Stack name" htmlFor="stack" hint="Lowercase only" error="Required">
				<Input id="stack" />
			</FormField>,
		);
		expect(screen.getByLabelText(/Stack name/)).toBeInTheDocument();
		expect(screen.getByText("Lowercase only")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toHaveTextContent("Required");
	});

	it("wires aria-describedby from hint and error", () => {
		render(
			<FormField label="Stack name" htmlFor="stack" hint="Lowercase only" error="Required">
				<Input id="stack" />
			</FormField>,
		);
		const control = screen.getByLabelText(/Stack name/);
		expect(control).toHaveAttribute("aria-describedby", "stack-hint stack-error");
		expect(control).toHaveAttribute("aria-invalid", "true");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<FormField label="Stack name" htmlFor="stack">
				<Input id="stack" />
			</FormField>,
		);
	});
});
