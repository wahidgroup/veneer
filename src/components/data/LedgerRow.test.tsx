import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { LedgerRow } from "./LedgerRow.js";

/**
 * Normalizes NBSP from Intl so string compares stay stable across engines.
 */
function normalizeSpaces(value: string): string {
	return value.replace(/\u00a0/g, " ");
}

function moneyAmountText(): string {
	const node = document.querySelector("[data-slot='money-amount']");
	expect(node).not.toBeNull();

	return normalizeSpaces(node?.textContent ?? "");
}

function balanceText(): string {
	const node = document.querySelector("[data-slot='ledger-row-balance']");
	expect(node).not.toBeNull();

	return normalizeSpaces(node?.textContent ?? "");
}

describe("LedgerRow", () => {
	it.each([
		{
			label: "debit",
			amountMinor: -2500,
			entry: "debit",
			expectedSubstring: "25.00",
		},
		{
			label: "credit",
			amountMinor: 1500,
			entry: "credit",
			expectedSubstring: "15.00",
		},
	])(
		"renders $label entries with signed MoneyAmount",
		({ amountMinor, entry, expectedSubstring }) => {
			render(
				<LedgerRow
					description="Wire transfer"
					amountMinor={amountMinor}
					currency="USD"
					locale="en-US"
				/>,
			);

			const row = screen
				.getByText("Wire transfer")
				.closest("[data-slot='ledger-row']");
			expect(row).toHaveAttribute("data-entry", entry);
			expect(moneyAmountText()).toContain(expectedSubstring);
		},
	);

	it("renders optional running balance", () => {
		render(
			<LedgerRow
				description="Purchase"
				amountMinor={-999}
				currency="USD"
				locale="en-US"
				balanceMinor={10001}
			/>,
		);

		expect(balanceText()).toContain("100.01");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ul>
				<LedgerRow
					description="Opening balance"
					amountMinor={5000}
					currency="USD"
					locale="en-US"
					balanceMinor={5000}
				/>
			</ul>,
		);
	});
});
