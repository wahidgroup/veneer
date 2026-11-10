import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { TextArea } from "./TextArea.js";

describe("TextArea", () => {
	it("renders a textbox", () => {
		render(<TextArea aria-label="Notes" />);
		expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute("data-slot", "textarea");
	});

	it("applies invalid styles via aria-invalid", () => {
		render(<TextArea aria-label="Notes" invalid />);
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<TextArea aria-label="Notes" />);
	});
});
