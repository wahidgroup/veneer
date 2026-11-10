import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Input } from "./Input.js";

describe("Input", () => {
	it("renders a textbox with data-slot", () => {
		render(<Input aria-label="Name" />);

		const el = screen.getByRole("textbox", { name: "Name" });
		expect(el).toHaveAttribute("data-slot", "input");
	});

	it.each([
		{ invalid: true, attr: "true" },
		{ invalid: false, attr: "false" },
	])("sets aria-invalid=$attr", ({ invalid, attr }) => {
		render(<Input aria-label="Name" invalid={invalid} />);
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", attr);
	});

	it("accepts typed input", async () => {
		const user = userEvent.setup();

		render(<Input aria-label="Name" />);

		await user.type(screen.getByRole("textbox"), "vpc-1");
		expect(screen.getByRole("textbox")).toHaveValue("vpc-1");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Input aria-label="Name" />);
	});
});
