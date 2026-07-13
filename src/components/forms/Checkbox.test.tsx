import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
	it("toggles checked state", async () => {
		const user = userEvent.setup();

		render(<Checkbox label="Enable HA" id="ha" />);

		const box = screen.getByRole("checkbox", { name: /Enable HA/ });
		await user.click(box);
		expect(box).toBeChecked();
	});

	it("respects disabled", async () => {
		const user = userEvent.setup();

		render(<Checkbox label="Enable HA" id="ha" disabled />);

		const box = screen.getByRole("checkbox", { name: /Enable HA/ });
		await user.click(box);
		expect(box).not.toBeChecked();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Checkbox label="Enable HA" id="ha" />);
	});
});
