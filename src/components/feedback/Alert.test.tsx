import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Alert } from "./Alert.js";

describe("Alert", () => {
	it("renders title and body with default info status role", () => {
		render(<Alert title="Heads up">Stack apply finished without errors.</Alert>);

		expect(screen.getByRole("status")).toHaveAttribute("data-type", "info");
		expect(screen.getByRole("status")).toHaveAttribute("data-slot", "alert");
		expect(screen.getByText("Heads up")).toBeInTheDocument();
		expect(screen.getByText("Stack apply finished without errors.")).toBeInTheDocument();
	});

	it.each([
		{ type: "info" as const, role: "status" },
		{ type: "success" as const, role: "status" },
		{ type: "warning" as const, role: "alert" },
		{ type: "danger" as const, role: "alert" },
	])("maps $type to role $role", ({ type, role }) => {
		render(
			<Alert type={type} title={type}>
				Body
			</Alert>,
		);
		expect(screen.getByRole(role)).toHaveAttribute("data-type", type);
	});

	it("uses a custom icon when provided", () => {
		render(<Alert icon={<span data-testid="custom-icon">!</span>}>Body</Alert>);
		expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Alert type="warning" title="Quota">
				Approaching the soft limit for this region.
			</Alert>,
		);
	});
});
