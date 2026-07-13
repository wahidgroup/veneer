import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Portal } from "./Portal.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";

describe("Portal", () => {
	it("renders children into document.body", () => {
		render(
			<div data-testid="host">
				<Portal>
					<span data-slot="portal-child">ported</span>
				</Portal>
			</div>,
		);

		const child = screen.getByText("ported");
		expect(child.closest("[data-testid='host']")).toBeNull();
		expect(document.body.contains(child)).toBe(true);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Portal>
				<button type="button">Inside portal</button>
			</Portal>,
		);
	});
});
