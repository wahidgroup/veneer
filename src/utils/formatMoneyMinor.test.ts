import { describe, expect, it } from "vitest";

import { SATOSHI_FRACTION_DIGITS } from "./formatBtcSats.js";
import { CRYPTO_CURRENCIES, currencyFractionDigits } from "./currencySpec.js";
import {
	currencyAdornmentText,
	formatMajorDraft,
	formatMoneyMinor,
	majorNumberToMinor,
	parseMajorInput,
} from "./formatMoneyMinor.js";

describe("formatMoneyMinor", () => {
	it("formats USD cents with two fraction digits", () => {
		const formatted = formatMoneyMinor({
			amountMinor: 1999,
			currency: "usd",
			locale: "en-US",
		});
		expect(formatted.replace(/\u00a0/g, " ")).toContain("19.99");
	});

	it("formats JPY with zero fraction digits", () => {
		const formatted = formatMoneyMinor({
			amountMinor: 1980,
			currency: "JPY",
			locale: "en-US",
		});
		expect(formatted.replace(/\u00a0/g, " ")).toContain("1,980");
		expect(formatted.includes(".")).toBe(false);
	});

	it("formats BTC sats when the crypto catalog is provided", () => {
		const formatted = formatMoneyMinor({
			amountMinor: 15000,
			currency: "BTC",
			locale: "en-US",
			currencies: CRYPTO_CURRENCIES,
		});
		expect(formatted.replace(/\u00a0/g, " ")).toContain("0.00015000");
	});

	it("accepts bigint minor amounts", () => {
		const formatted = formatMoneyMinor({
			amountMinor: 50n,
			currency: "USD",
			locale: "en-US",
		});
		expect(formatted.replace(/\u00a0/g, " ")).toContain("0.50");
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
	it("returns 2 for USD", () => {
		expect(currencyFractionDigits("USD", "en-US")).toBe(2);
	});

	it("returns 0 for JPY", () => {
		expect(currencyFractionDigits("JPY", "en-US")).toBe(0);
	});

	it("uses Intl for BTC unless the crypto catalog is passed", () => {
		expect(currencyFractionDigits("BTC", "en-US")).toBe(2);
		expect(CRYPTO_CURRENCIES.BTC?.fractionDigits).toBe(
			SATOSHI_FRACTION_DIGITS,
		);
		expect(currencyFractionDigits("BTC", "en-US", CRYPTO_CURRENCIES)).toBe(
			8,
		);
		expect(currencyFractionDigits("XBT", "en-US", CRYPTO_CURRENCIES)).toBe(
			8,
		);
	});

	it("uses a caller-provided currency catalog", () => {
		expect(
			currencyFractionDigits("ETH", "en-US", {
				ETH: { code: "ETH", fractionDigits: 18 },
			}),
		).toBe(18);
		expect(
			currencyFractionDigits("BTC", "en-US", {
				...CRYPTO_CURRENCIES,
				ETH: { code: "ETH", fractionDigits: 18 },
			}),
		).toBe(8);
	});
});

describe("currencyAdornmentText", () => {
	it("returns a currency symbol for USD", () => {
		expect(currencyAdornmentText("USD", "en-US")).toBe("$");
	});

	it("returns a code when currencyDisplay is code", () => {
		expect(currencyAdornmentText("USD", "en-US", "code")).toBe("USD");
	});
});

describe("majorNumberToMinor / parseMajorInput / formatMajorDraft", () => {
	it("rounds major USD amounts to cents", () => {
		expect(majorNumberToMinor(19.99, 2)).toBe(1999);
		expect(majorNumberToMinor(19.994, 2)).toBe(1999);
		expect(majorNumberToMinor(19.995, 2)).toBe(2000);
	});

	it("parses en-US drafts into minor units", () => {
		expect(parseMajorInput("19.99", "en-US", 2)).toBe(1999);
		expect(parseMajorInput("1,234.50", "en-US", 2)).toBe(123450);
		expect(parseMajorInput("", "en-US", 2)).toBeUndefined();
		expect(parseMajorInput("abc", "en-US", 2)).toBeUndefined();
	});

	it("parses de-DE drafts with comma decimals", () => {
		expect(parseMajorInput("19,99", "de-DE", 2)).toBe(1999);
	});

	it("parses BTC major drafts into sats", () => {
		expect(parseMajorInput("0.00015000", "en-US", 8)).toBe(15000);
		expect(parseMajorInput("1", "en-US", 8)).toBe(100_000_000);
	});

	it("formats editable major drafts without grouping", () => {
		expect(formatMajorDraft(1999, 2, "en-US")).toBe("19.99");
		expect(formatMajorDraft(1980, 0, "en-US")).toBe("1980");
		expect(formatMajorDraft(15000, 8, "en-US")).toBe("0.00015");
	});
});
