import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { StatusBadge, variantForStatus } from "./StatusBadge.js";

describe("StatusBadge", () => {
	it.each([
		{ status: "running" as const, label: "Running" },
		{ status: "pending" as const, label: "Pending" },
		{ status: "success" as const, label: "Healthy" },
		{ status: "warning" as const, label: "Degraded" },
		{ status: "danger" as const, label: "Failed" },
		{ status: "drifted" as const, label: "Drifted" },
	])("renders $status with data-status", ({ status, label }) => {
		render(<StatusBadge status={status}>{label}</StatusBadge>);

		const badge = screen.getByText(label);
		expect(badge).toHaveAttribute("data-slot", "status-badge");
		expect(badge).toHaveAttribute("data-status", status);
	});

	it.each([
		{ status: "running" as const, variant: "info" },
		{ status: "pending" as const, variant: "default" },
		{ status: "success" as const, variant: "success" },
		{ status: "warning" as const, variant: "warning" },
		{ status: "danger" as const, variant: "danger" },
		{ status: "drifted" as const, variant: "warning" },
	])("maps $status to Badge variant $variant", ({ status, variant }) => {
		expect(variantForStatus(status)).toBe(variant);
	});

	it("merges className onto the badge", () => {
		render(
			<StatusBadge status="running" className="status-extra">
				Running
			</StatusBadge>,
		);
		expect(screen.getByText("Running")).toHaveClass("status-extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<StatusBadge status="drifted">Drifted</StatusBadge>,
		);
	});
});
