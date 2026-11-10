import type { CurrencyCatalog } from "./currencySpec.js";
import { currencyFractionDigits } from "./currencySpec.js";

type MoneyCurrencyDisplay = "symbol" | "narrowSymbol" | "code";

type MoneyCurrencySign = "standard" | "accounting";

interface FormatMoneyMinorOptions {
	amountMinor: number | bigint;
	currency: string;
	locale?: string;
	currencyDisplay?: MoneyCurrencyDisplay;
	currencySign?: MoneyCurrencySign;
	/**
	 * Optional currency catalog. Spec `fractionDigits` overrides Intl/ISO
	 * (required for non-ISO codes such as BTC).
	 */
	currencies?: CurrencyCatalog;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function assertIntegerMinor(amountMinor: number | bigint): void {
	if (typeof amountMinor === "bigint") {
		return;
	}
	if (!Number.isInteger(amountMinor)) {
		throw new Error("amountMinor must be an integer");
	}
	if (!Number.isSafeInteger(amountMinor)) {
		throw new Error("amountMinor must be a safe integer or bigint");
	}
}

function formatterKey(options: FormatMoneyMinorOptions, digits: number): string {
	let localeKey = "";
	if (options.locale !== undefined) {
		localeKey = options.locale;
	}

	let displayKey = "symbol";
	if (options.currencyDisplay !== undefined) {
		displayKey = options.currencyDisplay;
	}

	let signKey = "standard";
	if (options.currencySign !== undefined) {
		signKey = options.currencySign;
	}

	return `${localeKey}|${options.currency.toUpperCase()}|${displayKey}|${signKey}|${String(digits)}`;
}

function getMoneyFormatter(options: FormatMoneyMinorOptions, digits: number): Intl.NumberFormat {
	const key = formatterKey(options, digits);
	const cached = formatterCache.get(key);
	if (cached !== undefined) {
		return cached;
	}

	const currency = options.currency.toUpperCase();
	const formatOptions: Intl.NumberFormatOptions = {
		style: "currency",
		currency,
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	};

	if (options.currencyDisplay !== undefined) {
		formatOptions.currencyDisplay = options.currencyDisplay;
	}

	if (options.currencySign !== undefined) {
		formatOptions.currencySign = options.currencySign;
	}

	const formatter = new Intl.NumberFormat(options.locale, formatOptions);
	formatterCache.set(key, formatter);
	return formatter;
}

/**
 * Leading adornment text for a currency field (`$`, `€`, `USD`, …).
 */
function currencyAdornmentText(currency: string, locale?: string, currencyDisplay?: MoneyCurrencyDisplay): string {
	const formatOptions: Intl.NumberFormatOptions = {
		style: "currency",
		currency: currency.toUpperCase(),
	};
	if (currencyDisplay !== undefined) {
		formatOptions.currencyDisplay = currencyDisplay;
	}

	const parts = new Intl.NumberFormat(locale, formatOptions).formatToParts(0);
	for (const part of parts) {
		if (part.type === "currency") {
			return part.value;
		}
	}

	return currency.toUpperCase();
}

/**
 * Convert integer minor units to a major-unit Number for Intl formatting.
 * Uses decimal string scaling (avoids `minor / 10**digits` float drift).
 */
function minorToMajorNumber(amountMinor: number | bigint, digits: number): number {
	if (digits === 0) {
		return Number(amountMinor);
	}

	const scaled = Number(`${amountMinor}e-${String(digits)}`);
	if (!Number.isFinite(scaled)) {
		throw new Error("amountMinor is out of range for Number formatting");
	}

	return scaled;
}

/**
 * Convert a normalized ASCII major string (`19.99`, `-0.00001999`) to
 * integer minor units via digit-string scaling (no `major * 10**digits`).
 */
function majorAsciiToMinor(normalized: string, digits: number): number | undefined {
	let sign = 1n;
	let body = normalized;
	if (body.startsWith("-")) {
		sign = -1n;
		body = body.slice(1);
	} else if (body.startsWith("+")) {
		body = body.slice(1);
	}

	const dot = body.indexOf(".");
	let whole: string;
	let frac: string;
	if (dot === -1) {
		whole = body;
		frac = "";
	} else {
		whole = body.slice(0, dot);
		frac = body.slice(dot + 1);
	}

	if (whole.length === 0) {
		whole = "0";
	}

	for (const ch of whole) {
		if (ch < "0" || ch > "9") {
			return undefined;
		}
	}
	for (const ch of frac) {
		if (ch < "0" || ch > "9") {
			return undefined;
		}
	}

	let wholeInt = BigInt(whole);
	let fracDigits = frac;

	if (digits === 0) {
		if (fracDigits.length > 0) {
			const first = fracDigits.charCodeAt(0);
			if (first >= 53) {
				wholeInt += 1n;
			}
		}
		fracDigits = "";
	} else if (fracDigits.length > digits) {
		const keep = fracDigits.slice(0, digits);
		const roundDigit = fracDigits.charCodeAt(digits);
		let fracInt = BigInt(keep);
		if (roundDigit >= 53) {
			fracInt += 1n;
			const scale = 10n ** BigInt(digits);
			if (fracInt >= scale) {
				fracInt -= scale;
				wholeInt += 1n;
			}
		}
		fracDigits = fracInt.toString().padStart(digits, "0");
	} else {
		while (fracDigits.length < digits) {
			fracDigits += "0";
		}
	}

	const combined = `${wholeInt.toString()}${fracDigits}`;
	let minorBig: bigint;
	try {
		minorBig = BigInt(combined) * sign;
	} catch {
		return undefined;
	}

	const asNumber = Number(minorBig);
	if (!Number.isSafeInteger(asNumber)) {
		return undefined;
	}

	return asNumber;
}

/**
 * Convert a major-unit Number to integer minor units (rounded).
 * Prefer {@link majorAsciiToMinor} / {@link parseMajorInput} for user input.
 */
function majorNumberToMinor(major: number, digits: number): number | undefined {
	if (!Number.isFinite(major)) {
		return undefined;
	}

	return majorAsciiToMinor(String(major), digits);
}

/**
 * Format minor units as an editable major draft (no currency symbol, no grouping).
 */
function formatMajorDraft(amountMinor: number, digits: number, locale?: string): string {
	assertIntegerMinor(amountMinor);
	const major = minorToMajorNumber(amountMinor, digits);
	return new Intl.NumberFormat(locale, {
		useGrouping: false,
		minimumFractionDigits: 0,
		maximumFractionDigits: digits,
	}).format(major);
}

function localeNumberSeparators(locale?: string): {
	group: string;
	decimal: string;
} {
	const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
	let group = ",";
	let decimal = ".";
	for (const part of parts) {
		if (part.type === "group") {
			group = part.value;
		}
		if (part.type === "decimal") {
			decimal = part.value;
		}
	}

	return { group, decimal };
}

/**
 * Parse a major-unit draft string into integer minor units.
 * Empty -> undefined. Invalid -> undefined.
 */
function parseMajorInput(raw: string, locale: string | undefined, digits: number): number | undefined {
	const trimmed = raw.trim();
	if (trimmed.length === 0) {
		return undefined;
	}

	const separators = localeNumberSeparators(locale);
	let normalized = "";
	for (const ch of trimmed) {
		if (ch === separators.group) {
			continue;
		}
		if (ch === " " || ch === "\u00a0" || ch === "\u202f") {
			continue;
		}
		if (ch === separators.decimal) {
			normalized += ".";
			continue;
		}
		if (ch === "-" || ch === "+") {
			normalized += ch;
			continue;
		}
		if (ch >= "0" && ch <= "9") {
			normalized += ch;
			continue;
		}

		return undefined;
	}

	if (
		normalized.length === 0 ||
		normalized === "-" ||
		normalized === "+" ||
		normalized === "." ||
		normalized === "-." ||
		normalized === "+."
	) {
		return undefined;
	}

	return majorAsciiToMinor(normalized, digits);
}

/**
 * Format an integer minor-unit amount (cents, yen, sats, …) with
 * `Intl.NumberFormat`. Pass `currencies` for non-ISO fraction digits.
 */
function formatMoneyMinor(options: FormatMoneyMinorOptions): string {
	assertIntegerMinor(options.amountMinor);

	const digits = currencyFractionDigits(options.currency, options.locale, options.currencies);

	const formatter = getMoneyFormatter(options, digits);
	const major = minorToMajorNumber(options.amountMinor, digits);
	return formatter.format(major);
}

export type { FormatMoneyMinorOptions, MoneyCurrencyDisplay, MoneyCurrencySign };
export {
	currencyAdornmentText,
	currencyFractionDigits,
	formatMajorDraft,
	formatMoneyMinor,
	majorAsciiToMinor,
	majorNumberToMinor,
	minorToMajorNumber,
	parseMajorInput,
};
