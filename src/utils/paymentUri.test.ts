import { describe, expect, it } from "vitest";

import type {
	PaymentUriBuildResult,
	PaymentUriErrorCode,
	PaymentUriParseResult,
	PaymentUriParts,
} from "./paymentUri.js";
import { buildPaymentUri, parsePaymentUri } from "./paymentUri.js";

const BIP21_ADDRESS = "175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W";

/**
 * Assert parse success and return parts. Branching lives in harness only.
 */
function parseOk(input: string): PaymentUriParts {
	const result = parsePaymentUri(input);
	expect(result.ok).toBe(true);
	if (result.ok !== true) {
		throw new Error(`expected ok parse for ${input}`);
	}

	return result.value;
}

/**
 * Assert build success and return URI string.
 */
function buildOk(parts: PaymentUriParts): string {
	const result = buildPaymentUri(parts);
	expect(result.ok).toBe(true);
	if (result.ok !== true) {
		throw new Error("expected ok build");
	}

	return result.value;
}

function expectParseFail(
	result: PaymentUriParseResult,
	code: PaymentUriErrorCode,
): void {
	expect(result).toEqual({ ok: false, code });
}

function expectBuildFail(
	result: PaymentUriBuildResult,
	code: PaymentUriErrorCode,
): void {
	expect(result).toEqual({ ok: false, code });
}

describe("parsePaymentUri", () => {
	it.each([
		{
			label: "address-only URI from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}`,
			expected: {
				address: BIP21_ADDRESS,
			},
		},
		{
			label: "address with label from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}?label=Luke-Jr`,
			expected: {
				address: BIP21_ADDRESS,
				label: "Luke-Jr",
			},
		},
		{
			label: "amount and label from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}?amount=20.3&label=Luke-Jr`,
			expected: {
				address: BIP21_ADDRESS,
				amountBtc: "20.3",
				amountSats: 2030000000,
				label: "Luke-Jr",
			},
		},
		{
			label: "amount, label, and percent-encoded message from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}?amount=50&label=Luke-Jr&message=Donation%20for%20project%20xyz`,
			expected: {
				address: BIP21_ADDRESS,
				amountBtc: "50",
				amountSats: 5000000000,
				label: "Luke-Jr",
				message: "Donation for project xyz",
			},
		},
		{
			label: "case-insensitive scheme",
			input: `BITCOIN:${BIP21_ADDRESS}`,
			expected: {
				address: BIP21_ADDRESS,
			},
		},
		{
			label: "unknown non-req params from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}?foo=50&bar=999`,
			expected: {
				address: BIP21_ADDRESS,
				params: {
					foo: "50",
					bar: "999",
				},
			},
		},
		{
			label: "sub-satoshi-precision amount to sats",
			input: `bitcoin:${BIP21_ADDRESS}?amount=0.00001999`,
			expected: {
				address: BIP21_ADDRESS,
				amountBtc: "0.00001999",
				amountSats: 1999,
			},
		},
	] satisfies readonly {
		label: string;
		input: string;
		expected: PaymentUriParts;
	}[])("parses $label", ({ input, expected }) => {
		expect(parseOk(input)).toEqual(expected);
	});

	it.each([
		{
			label: "unsupported req- params from BIP-21",
			input: `bitcoin:${BIP21_ADDRESS}?req-foo=50&req-bar=999`,
			code: "unsupported_required_param" as const,
		},
		{
			label: "comma-separated amount",
			input: `bitcoin:${BIP21_ADDRESS}?amount=50,000.00`,
			code: "invalid_amount" as const,
		},
		{
			label: "missing address",
			input: "bitcoin:",
			code: "missing_address" as const,
		},
		{
			label: "invalid scheme",
			input: `mailto:${BIP21_ADDRESS}`,
			code: "invalid_scheme" as const,
		},
		{
			label: "URI fragments",
			input: `bitcoin:${BIP21_ADDRESS}#fragment`,
			code: "invalid_uri" as const,
		},
	])("rejects $label", ({ input, code }) => {
		expectParseFail(parsePaymentUri(input), code);
	});
});

describe("buildPaymentUri", () => {
	it.each([
		{
			label: "address-only URI",
			parts: { address: BIP21_ADDRESS },
			expected: `bitcoin:${BIP21_ADDRESS}`,
		},
		{
			label: "amount, label, and encoded message",
			parts: {
				address: BIP21_ADDRESS,
				amountBtc: "50",
				label: "Luke-Jr",
				message: "Donation for project xyz",
			},
			expected: `bitcoin:${BIP21_ADDRESS}?amount=50&label=Luke-Jr&message=Donation%20for%20project%20xyz`,
		},
		{
			label: "amount from sats",
			parts: {
				address: BIP21_ADDRESS,
				amountSats: 1999,
			},
			expected: `bitcoin:${BIP21_ADDRESS}?amount=0.00001999`,
		},
	] satisfies readonly {
		label: string;
		parts: PaymentUriParts;
		expected: string;
	}[])("builds $label", ({ parts, expected }) => {
		expect(buildOk(parts)).toBe(expected);
	});

	it.each([
		{
			label: "missing address",
			parts: { address: "" },
			code: "missing_address" as const,
		},
		{
			label: "inconsistent amountBtc and amountSats",
			parts: {
				address: BIP21_ADDRESS,
				amountBtc: "1",
				amountSats: 2,
			},
			code: "invalid_amount" as const,
		},
	])("rejects $label", ({ parts, code }) => {
		expectBuildFail(buildPaymentUri(parts), code);
	});
});

describe("payment URI round-trip", () => {
	it.each([
		{
			label: "BIP-21 amount and label example",
			uri: `bitcoin:${BIP21_ADDRESS}?amount=20.3&label=Luke-Jr`,
		},
		{
			label: "message and extra params",
			uri: `bitcoin:${BIP21_ADDRESS}?amount=0.00001999&label=Luke-Jr&message=Donation%20for%20project%20xyz&foo=50`,
		},
	])("round-trips $label", ({ uri }) => {
		const parts = parseOk(uri);
		const rebuilt = buildOk(parts);
		expect(parseOk(rebuilt)).toEqual(parts);
	});
});
