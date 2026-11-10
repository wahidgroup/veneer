type BtcDisplayUnit = "btc" | "sats";

interface FormatBtcSatsOptions {
	amountSats: number | bigint;
	unit: BtcDisplayUnit;
	locale?: string;
}

/** Fraction digits for BTC major units (1 BTC = 10^8 sats). */
const SATOSHI_FRACTION_DIGITS = 8;

function assertIntegerSats(amountSats: number | bigint): void {
	if (typeof amountSats === "bigint") {
		return;
	}
	if (!Number.isInteger(amountSats)) {
		throw new Error("amountSats must be an integer");
	}
	if (!Number.isSafeInteger(amountSats)) {
		throw new Error("amountSats must be a safe integer or bigint");
	}
}

function satsUnitLabel(amountSats: number | bigint, locale?: string): string {
	let absolute: number | bigint = amountSats;
	if (typeof amountSats === "bigint") {
		if (amountSats < 0n) {
			absolute = -amountSats;
		}
	} else if (amountSats < 0) {
		absolute = -amountSats;
	}

	const plural = new Intl.PluralRules(locale).select(Number(absolute));
	if (plural === "one") {
		return "sat";
	}

	return "sats";
}

/**
 * Format a satoshi integer as BTC (satoshi fraction digits) or sats with a
 * unit label. Locale controls digit grouping only.
 */
function formatBtcSats(options: FormatBtcSatsOptions): string {
	assertIntegerSats(options.amountSats);

	if (options.unit === "sats") {
		const grouped = new Intl.NumberFormat(options.locale).format(options.amountSats);

		const label = satsUnitLabel(options.amountSats, options.locale);
		return `${grouped} ${label}`;
	}

	const formatter = new Intl.NumberFormat(options.locale, {
		minimumFractionDigits: SATOSHI_FRACTION_DIGITS,
		maximumFractionDigits: SATOSHI_FRACTION_DIGITS,
	});

	const major = Number(`${options.amountSats}e-${String(SATOSHI_FRACTION_DIGITS)}`);
	if (!Number.isFinite(major)) {
		throw new Error("amountSats is out of range for Number formatting");
	}

	return `${formatter.format(major)} BTC`;
}

export type { BtcDisplayUnit, FormatBtcSatsOptions };
export { SATOSHI_FRACTION_DIGITS, formatBtcSats };
