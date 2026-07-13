import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { NumberInput } from "./NumberInput.js";

describe("NumberInput", () => {
	it("emits numeric values", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<NumberInput
				aria-label="Port"
				onValueChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		await user.type(screen.getByRole("spinbutton"), "8080");
		expect(values.at(-1)).toBe(8080);
	});

	it("sets aria-invalid when invalid", () => {
		render(<NumberInput aria-label="Port" invalid />);
		expect(screen.getByRole("spinbutton")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	it("merges className", () => {
		render(<NumberInput aria-label="Port" className="extra" />);
		expect(screen.getByRole("spinbutton").className).toContain("extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<NumberInput aria-label="Port" />);
	});
});
