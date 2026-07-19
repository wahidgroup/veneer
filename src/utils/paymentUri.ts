import { SATOSHI_FRACTION_DIGITS } from "./formatBtcSats.js";
import { formatMajorDraft, majorAsciiToMinor } from "./formatMoneyMinor.js";

type PaymentUriErrorCode =
	| "invalid_scheme"
	| "invalid_amount"
	| "missing_address"
	| "unsupported_required_param"
	| "invalid_uri";

interface PaymentUriParts {
	address: string;
	/** Canonical decimal BTC string from the URI or build input. */
	amountBtc?: string;
	/** Integer satoshis when amount is present and convertible. */
	amountSats?: number;
	label?: string;
	message?: string;
	/** Other non-req query params (excluding amount, label, message). */
	params?: Record<string, string>;
}

type PaymentUriParseResult =
	| { ok: true; value: PaymentUriParts }
	| { ok: false; code: PaymentUriErrorCode };

type PaymentUriBuildResult =
	{ ok: true; value: string } | { ok: false; code: PaymentUriErrorCode };

const BIP21_SCHEME = "bitcoin";
const RESERVED_QUERY_KEYS = new Set(["amount", "label", "message"]);

function fail(code: PaymentUriErrorCode): {
	ok: false;
	code: PaymentUriErrorCode;
} {
	return { ok: false, code };
}

function safeDecodeURIComponent(encoded: string): string | undefined {
	try {
		return decodeURIComponent(encoded);
	} catch {
		return undefined;
	}
}

function isValidBip21Amount(value: string): boolean {
	if (value.length === 0) {
		return false;
	}
	if (value.includes(",")) {
		return false;
	}
	if (value.startsWith("-") || value.startsWith("+")) {
		return false;
	}

	const dot = value.indexOf(".");
	if (dot !== value.lastIndexOf(".")) {
		return false;
	}

	let whole: string;
	let frac: string;
	if (dot === -1) {
		whole = value;
		frac = "";
	} else {
		whole = value.slice(0, dot);
		frac = value.slice(dot + 1);
	}

	if (whole.length === 0 && frac.length === 0) {
		return false;
	}

	for (const ch of whole) {
		if (ch < "0" || ch > "9") {
			return false;
		}
	}
	for (const ch of frac) {
		if (ch < "0" || ch > "9") {
			return false;
		}
	}

	return true;
}

function amountSatsFromBtc(amountBtc: string): number | undefined {
	if (!isValidBip21Amount(amountBtc)) {
		return undefined;
	}
	return majorAsciiToMinor(amountBtc, SATOSHI_FRACTION_DIGITS);
}

function resolveAmountBtc(parts: PaymentUriParts): string | undefined {
	if (parts.amountBtc !== undefined) {
		return parts.amountBtc;
	}
	if (parts.amountSats === undefined) {
		return undefined;
	}

	return formatMajorDraft(parts.amountSats, SATOSHI_FRACTION_DIGITS);
}

function parseQueryPairs(
	query: string,
): { key: string; value: string }[] | undefined {
	const pairs: { key: string; value: string }[] = [];
	const segments = query.split("&");

	for (const segment of segments) {
		if (segment.length === 0) {
			continue;
		}

		const eq = segment.indexOf("=");
		let key: string;
		let value: string;
		if (eq === -1) {
			key = segment;
			value = "";
		} else {
			key = segment.slice(0, eq);
			value = segment.slice(eq + 1);
		}

		const decodedKey = safeDecodeURIComponent(key);
		if (decodedKey === undefined) {
			return undefined;
		}

		pairs.push({ key: decodedKey, value });
	}

	return pairs;
}

/**
 * Parse a BIP-21 `bitcoin:` payment URI into structured parts.
 */
function parsePaymentUri(input: string): PaymentUriParseResult {
	if (input.length === 0) {
		return fail("invalid_uri");
	}

	const hashIndex = input.indexOf("#");
	if (hashIndex !== -1) {
		return fail("invalid_uri");
	}

	const colonIndex = input.indexOf(":");
	if (colonIndex === -1) {
		return fail("invalid_uri");
	}

	const scheme = input.slice(0, colonIndex);
	if (scheme.toLowerCase() !== BIP21_SCHEME) {
		return fail("invalid_scheme");
	}

	const rest = input.slice(colonIndex + 1);
	const queryIndex = rest.indexOf("?");
	let address: string;
	let query: string | undefined;

	if (queryIndex === -1) {
		address = rest;
		query = undefined;
	} else {
		if (rest.includes("?", queryIndex + 1)) {
			return fail("invalid_uri");
		}
		address = rest.slice(0, queryIndex);
		query = rest.slice(queryIndex + 1);
	}

	if (address.length === 0) {
		return fail("missing_address");
	}

	const parts: PaymentUriParts = { address };
	const extraParams: Record<string, string> = {};
	let amountBtc: string | undefined;
	let label: string | undefined;
	let message: string | undefined;

	if (query !== undefined && query.length > 0) {
		const pairs = parseQueryPairs(query);
		if (pairs === undefined) {
			return fail("invalid_uri");
		}

		for (const pair of pairs) {
			const lowerKey = pair.key.toLowerCase();
			if (lowerKey.startsWith("req-")) {
				return fail("unsupported_required_param");
			}

			if (lowerKey === "amount") {
				if (!isValidBip21Amount(pair.value)) {
					return fail("invalid_amount");
				}

				const sats = amountSatsFromBtc(pair.value);
				if (sats === undefined) {
					return fail("invalid_amount");
				}

				amountBtc = pair.value;
				parts.amountSats = sats;
				continue;
			}

			if (lowerKey === "label") {
				const decoded = safeDecodeURIComponent(pair.value);
				if (decoded === undefined) {
					return fail("invalid_uri");
				}

				label = decoded;
				continue;
			}

			if (lowerKey === "message") {
				const decoded = safeDecodeURIComponent(pair.value);
				if (decoded === undefined) {
					return fail("invalid_uri");
				}

				message = decoded;
				continue;
			}

			if (RESERVED_QUERY_KEYS.has(lowerKey)) {
				continue;
			}

			const decodedValue = safeDecodeURIComponent(pair.value);
			if (decodedValue === undefined) {
				return fail("invalid_uri");
			}

			extraParams[pair.key] = decodedValue;
		}
	}

	if (amountBtc !== undefined) {
		parts.amountBtc = amountBtc;
	}
	if (label !== undefined) {
		parts.label = label;
	}
	if (message !== undefined) {
		parts.message = message;
	}
	if (Object.keys(extraParams).length > 0) {
		parts.params = extraParams;
	}

	return { ok: true, value: parts };
}

/**
 * Build a BIP-21 `bitcoin:` payment URI from structured parts.
 */
function buildPaymentUri(parts: PaymentUriParts): PaymentUriBuildResult {
	if (parts.address.length === 0) {
		return fail("missing_address");
	}

	const amountBtc = resolveAmountBtc(parts);
	if (amountBtc !== undefined) {
		const sats = amountSatsFromBtc(amountBtc);
		if (sats === undefined) {
			return fail("invalid_amount");
		}
		if (parts.amountSats !== undefined && parts.amountSats !== sats) {
			return fail("invalid_amount");
		}
	}

	const queryParts: string[] = [];
	if (amountBtc !== undefined) {
		queryParts.push(`amount=${amountBtc}`);
	}
	if (parts.label !== undefined) {
		queryParts.push(`label=${encodeURIComponent(parts.label)}`);
	}
	if (parts.message !== undefined) {
		queryParts.push(`message=${encodeURIComponent(parts.message)}`);
	}
	if (parts.params !== undefined) {
		for (const [key, value] of Object.entries(parts.params)) {
			const lowerKey = key.toLowerCase();
			if (RESERVED_QUERY_KEYS.has(lowerKey)) {
				continue;
			}
			if (lowerKey.startsWith("req-")) {
				return fail("unsupported_required_param");
			}

			queryParts.push(
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
			);
		}
	}

	let uri = `${BIP21_SCHEME}:${parts.address}`;
	if (queryParts.length > 0) {
		uri += `?${queryParts.join("&")}`;
	}

	return { ok: true, value: uri };
}

export type {
	PaymentUriBuildResult,
	PaymentUriErrorCode,
	PaymentUriParseResult,
	PaymentUriParts,
};
export { buildPaymentUri, parsePaymentUri };
