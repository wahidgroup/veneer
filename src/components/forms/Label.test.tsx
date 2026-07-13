import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Label } from "./Label.js";

describe("Label", () => {
	it("associates with a control via htmlFor", () => {
		render(
			<>
				<Label htmlFor="name">Name</Label>
				<input id="name" />
			</>,
		);
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
	});

	it.each([
		{ required: true, hasMarker: true },
		{ required: false, hasMarker: false },
	])("required=$required marker visibility", ({ required, hasMarker }) => {
		const { container } = render(
			<Label htmlFor="x" required={required}>
				Field
			</Label>,
		);

		const marker = container.querySelector("[aria-hidden='true']");
		expect(marker !== null).toBe(hasMarker);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Label htmlFor="a">Label</Label>);
	});
});
