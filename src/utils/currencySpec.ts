import { SATOSHI_FRACTION_DIGITS } from "./formatBtcSats.js";

/**
 * Currency metadata for minor-unit math. Aligns with ISO 4217 for fiat:
 * `fractionDigits` is the minor-unit exponent (0 = JPY, 2 = USD, 3 = KWD).
 * Omit `fractionDigits` to defer to Intl/ISO.
 */
interface CurrencySpec {
	code: string;
	fractionDigits?: number;
}

/**
 * Catalog keyed by uppercase currency code.
 */
type CurrencyCatalog = Readonly<Record<string, CurrencySpec>>;

/**
 * Opt-in non-ISO crypto specs (satoshi scale). Not part of ISO 4217 —
 * Intl alone mis-reports BTC fraction digits.
 */
const CRYPTO_CURRENCIES = {
	BTC: { code: "BTC", fractionDigits: SATOSHI_FRACTION_DIGITS },
	XBT: { code: "XBT", fractionDigits: SATOSHI_FRACTION_DIGITS },
} as const satisfies {
	readonly BTC: CurrencySpec;
	readonly XBT: CurrencySpec;
};

/**
 * Look up a catalog entry by currency code (case-insensitive key).
 */
function lookupCurrencySpec(
	currency: string,
	catalog: CurrencyCatalog | undefined,
): CurrencySpec | undefined {
	if (catalog === undefined) {
		return undefined;
	}

	return catalog[currency.toUpperCase()];
}

/**
 * Fraction digit count for a currency (ISO via Intl when catalog omits
 * `fractionDigits`; catalog override wins when set).
 */
function currencyFractionDigits(
	currency: string,
	locale?: string,
	catalog?: CurrencyCatalog,
): number {
	const spec = lookupCurrencySpec(currency, catalog);
	if (spec?.fractionDigits !== undefined) {
		return spec.fractionDigits;
	}

	const formatter = new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency.toUpperCase(),
	});

	let digits = formatter.resolvedOptions().maximumFractionDigits;
	digits ??= 2;

	return digits;
}

export type { CurrencyCatalog, CurrencySpec };
export { CRYPTO_CURRENCIES, currencyFractionDigits, lookupCurrencySpec };
