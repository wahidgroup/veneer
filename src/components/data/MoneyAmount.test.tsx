import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { MoneyAmount } from "./MoneyAmount.js";

/**
 * Normalizes NBSP from Intl so string compares stay stable across engines.
 */
function normalizeSpaces(value: string): string {
	const normalized = value.replace(/\u00a0/g, " ");
	return normalized;
}

describe("MoneyAmount", () => {
	it.each([
		{
			label: "USD cents",
			amountMinor: 1999,
			currency: "USD",
			expectedSubstring: "19.99",
		},
		{
			label: "JPY whole units",
			amountMinor: 1980,
			currency: "JPY",
			expectedSubstring: "1,980",
		},
	])("renders formatted $label", ({ amountMinor, currency, expectedSubstring }) => {
		render(<MoneyAmount amountMinor={amountMinor} currency={currency} locale="en-US" />);

		const amount = screen.getByText((content) => {
			const display = normalizeSpaces(content);
			return display.includes(expectedSubstring);
		});
		expect(amount).toHaveAttribute("data-slot", "money-amount");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<MoneyAmount amountMinor={500} currency="USD" locale="en-US" />);
	});
});
