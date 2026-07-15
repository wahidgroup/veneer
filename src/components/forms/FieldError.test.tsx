import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FieldError } from "./FieldError.js";

describe("FieldError", () => {
	it("exposes an alert role", () => {
		render(<FieldError>Required</FieldError>);
		expect(screen.getByRole("alert")).toHaveTextContent("Required");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<FieldError>Oops</FieldError>);
	});
});
