import { describe, expect, it } from "vitest";

import { SATOSHI_FRACTION_DIGITS } from "./formatBtcSats.js";
import { CRYPTO_CURRENCIES, currencyFractionDigits } from "./currencySpec.js";
import {
	currencyAdornmentText,
	formatMajorDraft,
	formatMoneyMinor,
	majorAsciiToMinor,
	majorNumberToMinor,
	parseMajorInput,
} from "./formatMoneyMinor.js";

/**
 * Normalizes NBSP from Intl so string compares stay stable across engines.
 */
function normalizeSpaces(value: string): string {
	const normalized = value.replace(/\u00a0/g, " ");
	return normalized;
}

describe("formatMoneyMinor", () => {
	it.each([
		{
			label: "USD cents",
			amountMinor: 1999,
			currency: "usd",
			locale: "en-US",
			currencies: undefined,
			expectedSubstring: "19.99",
		},
		{
			label: "JPY whole units",
			amountMinor: 1980,
			currency: "JPY",
			locale: "en-US",
			currencies: undefined,
			expectedSubstring: "1,980",
		},
		{
			label: "BTC sats via crypto catalog",
			amountMinor: 15000,
			currency: "BTC",
			locale: "en-US",
			currencies: CRYPTO_CURRENCIES,
			expectedSubstring: "0.00015000",
		},
		{
			label: "bigint USD cents",
			amountMinor: 50n,
			currency: "USD",
			locale: "en-US",
			currencies: undefined,
			expectedSubstring: "0.50",
		},
	])(
		"formats $label",
		({ amountMinor, currency, locale, currencies, expectedSubstring }) => {
			const formatted = formatMoneyMinor({
				amountMinor,
				currency,
				locale,
				currencies,
			});
			const display = normalizeSpaces(formatted);
			expect(display).toContain(expectedSubstring);
		},
	);

	it("formats JPY without a decimal point", () => {
		const formatted = formatMoneyMinor({
			amountMinor: 1980,
			currency: "JPY",
			locale: "en-US",
		});
		const display = normalizeSpaces(formatted);
		expect(display.includes(".")).toBe(false);
	});

	it("rejects non-integer number amounts", () => {
		expect(() => {
			formatMoneyMinor({
				amountMinor: 1.5,
				currency: "USD",
				locale: "en-US",
			});
		}).toThrow("amountMinor must be an integer");
	});
});

describe("currencyFractionDigits", () => {
	it.each([
		{
			label: "USD",
			currency: "USD",
			locale: "en-US",
			currencies: undefined,
			expected: 2,
		},
		{
			label: "JPY",
			currency: "JPY",
			locale: "en-US",
			currencies: undefined,
			expected: 0,
		},
		{
			label: "BTC without crypto catalog (Intl)",
			currency: "BTC",
			locale: "en-US",
			currencies: undefined,
			expected: 2,
		},
		{
			label: "BTC with crypto catalog",
			currency: "BTC",
			locale: "en-US",
			currencies: CRYPTO_CURRENCIES,
			expected: 8,
		},
		{
			label: "XBT with crypto catalog",
			currency: "XBT",
			locale: "en-US",
			currencies: CRYPTO_CURRENCIES,
			expected: 8,
		},
	])(
		"returns $expected for $label",
		({ currency, locale, currencies, expected }) => {
			const digits = currencyFractionDigits(currency, locale, currencies);
			expect(digits).toBe(expected);
		},
	);

	it("exposes satoshi fraction digits on the crypto catalog", () => {
		const btcSpec = CRYPTO_CURRENCIES.BTC;
		expect(btcSpec?.fractionDigits).toBe(SATOSHI_FRACTION_DIGITS);
	});

	it("uses a caller-provided currency catalog", () => {
		const ethOnly = {
			ETH: { code: "ETH", fractionDigits: 18 },
		};
		const ethDigits = currencyFractionDigits("ETH", "en-US", ethOnly);
		expect(ethDigits).toBe(18);

		const withEth = {
			...CRYPTO_CURRENCIES,
			ETH: { code: "ETH", fractionDigits: 18 },
		};
		const btcDigits = currencyFractionDigits("BTC", "en-US", withEth);
		expect(btcDigits).toBe(8);
	});
});

describe("currencyAdornmentText", () => {
	it.each([
		{
			label: "USD symbol",
			currency: "USD",
			locale: "en-US",
			currencyDisplay: undefined,
			expected: "$",
		},
		{
			label: "USD code",
			currency: "USD",
			locale: "en-US",
			currencyDisplay: "code" as const,
			expected: "USD",
		},
	])("returns $label", ({ currency, locale, currencyDisplay, expected }) => {
		const text = currencyAdornmentText(currency, locale, currencyDisplay);
		expect(text).toBe(expected);
	});
});

describe("majorNumberToMinor / parseMajorInput / formatMajorDraft", () => {
	it.each([
		{ major: 19.99, fractionDigits: 2, expectedMinor: 1999 },
		{ major: 19.994, fractionDigits: 2, expectedMinor: 1999 },
		{ major: 19.995, fractionDigits: 2, expectedMinor: 2000 },
	])(
		"rounds major $major to minor $expectedMinor",
		({ major, fractionDigits, expectedMinor }) => {
			const minor = majorNumberToMinor(major, fractionDigits);
			expect(minor).toBe(expectedMinor);
		},
	);

	it.each([
		{
			label: "en-US cents",
			draft: "19.99",
			locale: "en-US",
			fractionDigits: 2,
			expectedMinor: 1999,
		},
		{
			label: "en-US grouped",
			draft: "1,234.50",
			locale: "en-US",
			fractionDigits: 2,
			expectedMinor: 123450,
		},
		{
			label: "empty draft",
			draft: "",
			locale: "en-US",
			fractionDigits: 2,
			expectedMinor: undefined,
		},
		{
			label: "non-numeric draft",
			draft: "abc",
			locale: "en-US",
			fractionDigits: 2,
			expectedMinor: undefined,
		},
		{
			label: "de-DE comma decimal",
			draft: "19,99",
			locale: "de-DE",
			fractionDigits: 2,
			expectedMinor: 1999,
		},
		{
			label: "BTC sats draft",
			draft: "0.00015000",
			locale: "en-US",
			fractionDigits: 8,
			expectedMinor: 15000,
		},
		{
			label: "BTC fractional sats",
			draft: "0.00001999",
			locale: "en-US",
			fractionDigits: 8,
			expectedMinor: 1999,
		},
		{
			label: "one BTC",
			draft: "1",
			locale: "en-US",
			fractionDigits: 8,
			expectedMinor: 100_000_000,
		},
	])(
		"parses $label into minor units",
		({ draft, locale, fractionDigits, expectedMinor }) => {
			const minor = parseMajorInput(draft, locale, fractionDigits);
			expect(minor).toBe(expectedMinor);
		},
	);

	it.each([
		{ ascii: "0.1", fractionDigits: 1, expectedMinor: 1 },
		{ ascii: "1.005", fractionDigits: 2, expectedMinor: 101 },
	])(
		"scales ascii major $ascii with digit-string path",
		({ ascii, fractionDigits, expectedMinor }) => {
			const minor = majorAsciiToMinor(ascii, fractionDigits);
			expect(minor).toBe(expectedMinor);
		},
	);

	it.each([
		{
			label: "USD cents",
			amountMinor: 1999,
			fractionDigits: 2,
			locale: "en-US",
			expectedDraft: "19.99",
		},
		{
			label: "JPY whole",
			amountMinor: 1980,
			fractionDigits: 0,
			locale: "en-US",
			expectedDraft: "1980",
		},
		{
			label: "BTC sats trimmed",
			amountMinor: 15000,
			fractionDigits: 8,
			locale: "en-US",
			expectedDraft: "0.00015",
		},
	])(
		"formats editable $label draft without grouping",
		({ amountMinor, fractionDigits, locale, expectedDraft }) => {
			const draft = formatMajorDraft(amountMinor, fractionDigits, locale);
			expect(draft).toBe(expectedDraft);
		},
	);
});
