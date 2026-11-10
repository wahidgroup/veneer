import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Badge } from "../indicators/Badge.js";
import { TxStatusBadge } from "../indicators/TxStatusBadge.js";
import { ActivityRow } from "./ActivityRow.js";
import { BtcAmount } from "./BtcAmount.js";

describe("ActivityRow", () => {
	it.each([
		{
			direction: "in" as const,
			title: "Received payment",
			directionName: "Incoming",
			amountSats: 50000,
		},
		{
			direction: "out" as const,
			title: "Sent to cold storage",
			directionName: "Outgoing",
			amountSats: 100000,
		},
	])("renders $direction activity with direction chrome", ({ direction, title, directionName, amountSats }) => {
		render(
			<ActivityRow
				direction={direction}
				title={title}
				amount={<BtcAmount amountSats={amountSats} unit="sats" locale="en-US" />}
			/>,
		);

		const row = screen.getByRole("article");
		expect(row).toHaveAttribute("data-slot", "activity-row");
		expect(row).toHaveAttribute("data-direction", direction);
		expect(screen.getByRole("img", { name: directionName })).toBeInTheDocument();
		expect(screen.getByText(title)).toBeInTheDocument();
	});

	it("renders amount, status, subtitle, and tags slots", () => {
		render(
			<ActivityRow
				direction="in"
				title="Received payment"
				subtitle="2 hours ago"
				amount={<BtcAmount amountSats={50000} unit="sats" locale="en-US" />}
				status={<TxStatusBadge status="confirmed">Confirmed</TxStatusBadge>}
				tags={<Badge variant="info">Lightning</Badge>}
			/>,
		);

		expect(screen.getByText("2 hours ago")).toBeInTheDocument();
		expect(screen.getByText("50,000 sats")).toBeInTheDocument();
		expect(screen.getByText("Confirmed")).toBeInTheDocument();
		expect(screen.getByText("Lightning")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ActivityRow
				direction="in"
				title="Deposit"
				subtitle="Today"
				amount={<BtcAmount amountSats={1000} unit="sats" locale="en-US" />}
				status={<TxStatusBadge status="confirming">Confirming</TxStatusBadge>}
			/>,
		);
	});
});
