import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { TxStatusBadge } from "./TxStatusBadge.js";

describe("TxStatusBadge", () => {
	it.each([
		{
			status: "unconfirmed" as const,
			label: "Unconfirmed",
		},
		{
			status: "confirming" as const,
			label: "Confirming",
		},
		{
			status: "confirmed" as const,
			label: "Confirmed",
		},
		{
			status: "failed" as const,
			label: "Failed",
		},
	])("maps $status onto Badge tone", ({ status, label }) => {
		render(<TxStatusBadge status={status}>{label}</TxStatusBadge>);

		const badge = screen.getByText(label);
		expect(badge).toHaveAttribute("data-slot", "tx-status-badge");
		expect(badge).toHaveAttribute("data-status", status);
	});

	it("records confirmations on data attribute", () => {
		render(
			<TxStatusBadge status="confirming" confirmations={3}>
				Confirming
			</TxStatusBadge>,
		);
		expect(screen.getByText("Confirming")).toHaveAttribute("data-confirmations", "3");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<TxStatusBadge status="confirmed">Confirmed</TxStatusBadge>);
	});
});
