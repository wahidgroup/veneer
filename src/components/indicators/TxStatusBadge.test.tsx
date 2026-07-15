import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { TxStatusBadge } from "./TxStatusBadge.js";

describe("TxStatusBadge", () => {
	it.each([
		{
			status: "unconfirmed" as const,
			label: "Unconfirmed",
			variantClass: "bg-muted",
		},
		{
			status: "confirming" as const,
			label: "Confirming",
			variantClass: "bg-info",
		},
		{
			status: "confirmed" as const,
			label: "Confirmed",
			variantClass: "bg-success-muted",
		},
		{
			status: "failed" as const,
			label: "Failed",
			variantClass: "bg-destructive-muted",
		},
	])("maps $status onto Badge tone", ({ status, label, variantClass }) => {
		render(<TxStatusBadge status={status}>{label}</TxStatusBadge>);

		const badge = screen.getByText(label);
		expect(badge).toHaveAttribute("data-slot", "tx-status-badge");
		expect(badge).toHaveAttribute("data-status", status);
		expect(badge.className).toContain(variantClass);
	});

	it("records confirmations on data attribute", () => {
		render(
			<TxStatusBadge status="confirming" confirmations={3}>
				Confirming
			</TxStatusBadge>,
		);
		expect(screen.getByText("Confirming")).toHaveAttribute(
			"data-confirmations",
			"3",
		);
	});

	it("has no accessibility violations", async () => {
		const { container } = render(
			<TxStatusBadge status="confirmed">Confirmed</TxStatusBadge>,
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
