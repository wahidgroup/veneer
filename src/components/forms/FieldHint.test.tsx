import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FieldHint } from "./FieldHint.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";

describe("FieldHint", () => {
	it("renders hint text", () => {
		render(<FieldHint>Use lowercase</FieldHint>);
		expect(screen.getByText("Use lowercase")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<FieldHint>Hint</FieldHint>);
	});
});
