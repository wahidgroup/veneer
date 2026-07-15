import { describe, expect, it } from "vitest";

import { formatBtcSats } from "./formatBtcSats.js";

describe("formatBtcSats", () => {
	it("formats sats as an integer with a plural label", () => {
		expect(
			formatBtcSats({ amountSats: 15000, unit: "sats", locale: "en" }),
		).toBe("15,000 sats");
	});

	it("uses singular sat for one", () => {
		expect(
			formatBtcSats({ amountSats: 1, unit: "sats", locale: "en" }),
		).toBe("1 sat");
	});

	it("formats BTC with eight fraction digits", () => {
		const formatted = formatBtcSats({
			amountSats: 100,
			unit: "btc",
			locale: "en-US",
		});
		expect(formatted.replace(/\u00a0/g, " ")).toBe("0.00000100 BTC");
	});

	it("accepts bigint sats", () => {
		const formatted = formatBtcSats({
			amountSats: 100_000_000n,
			unit: "btc",
			locale: "en-US",
		});
		expect(formatted.replace(/\u00a0/g, " ")).toBe("1.00000000 BTC");
	});

	it("rejects non-integer number amounts", () => {
		expect(() => {
			formatBtcSats({ amountSats: 1.2, unit: "sats", locale: "en" });
		}).toThrow("amountSats must be an integer");
	});
});
