import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { BtcAmount } from "./BtcAmount.js";

describe("BtcAmount", () => {
	it.each([
		{
			unit: "sats" as const,
			amountSats: 15000,
			expected: "15,000 sats",
		},
		{
			unit: "btc" as const,
			amountSats: 100,
			expected: "0.00000100 BTC",
		},
	])("formats $unit amounts", ({ unit, amountSats, expected }) => {
		render(<BtcAmount amountSats={amountSats} unit={unit} locale="en-US" />);
		expect(screen.getByText(expected)).toHaveAttribute("data-slot", "btc-amount");
		expect(screen.getByText(expected)).toHaveAttribute("data-unit", unit);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<BtcAmount amountSats={1} unit="sats" locale="en" />);
	});
});
