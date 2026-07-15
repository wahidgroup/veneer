import { describe, expect, it } from "vitest";

import { formatBtcSats } from "./formatBtcSats.js";

/**
 * Normalizes NBSP from Intl so string compares stay stable across engines.
 */
function normalizeSpaces(value: string): string {
	const normalized = value.replace(/\u00a0/g, " ");
	return normalized;
}

describe("formatBtcSats", () => {
	it.each([
		{
			label: "plural sats",
			amountSats: 15000,
			unit: "sats" as const,
			locale: "en",
			expected: "15,000 sats",
		},
		{
			label: "singular sat",
			amountSats: 1,
			unit: "sats" as const,
			locale: "en",
			expected: "1 sat",
		},
		{
			label: "BTC with eight fraction digits",
			amountSats: 100,
			unit: "btc" as const,
			locale: "en-US",
			expected: "0.00000100 BTC",
		},
		{
			label: "bigint one BTC",
			amountSats: 100_000_000n,
			unit: "btc" as const,
			locale: "en-US",
			expected: "1.00000000 BTC",
		},
	])("formats $label", ({ amountSats, unit, locale, expected }) => {
		const formatted = formatBtcSats({ amountSats, unit, locale });
		const display = normalizeSpaces(formatted);
		expect(display).toBe(expected);
	});

	it("rejects non-integer number amounts", () => {
		expect(() => {
			formatBtcSats({ amountSats: 1.2, unit: "sats", locale: "en" });
		}).toThrow("amountSats must be an integer");
	});
});
