import type { ReactNode } from "react";
import { Bitcoin } from "lucide-react";

import type { CurrencySpec } from "../../utils/currencySpec.js";
import { CRYPTO_CURRENCIES as CRYPTO_CURRENCY_SPECS } from "../../utils/currencySpec.js";

/**
 * UI currency spec: ISO/crypto digits plus optional leading adornment.
 */
interface CurrencyUiSpec extends CurrencySpec {
	startAdornment?: ReactNode;
}

type CurrencyUiCatalog = Readonly<Record<string, CurrencyUiSpec>>;

/**
 * Opt-in crypto catalog with Lucide Bitcoin adornments. Pass to
 * {@link MoneyInput} as `currencies`. Digits match {@link CRYPTO_CURRENCIES}.
 */
const CRYPTO_CURRENCY_UI: CurrencyUiCatalog = {
	BTC: {
		...CRYPTO_CURRENCY_SPECS.BTC,
		startAdornment: <Bitcoin className="size-4" aria-hidden="true" />,
	},
	XBT: {
		...CRYPTO_CURRENCY_SPECS.XBT,
		startAdornment: <Bitcoin className="size-4" aria-hidden="true" />,
	},
};

function lookupCurrencyUiSpec(currency: string, catalog: CurrencyUiCatalog | undefined): CurrencyUiSpec | undefined {
	if (catalog === undefined) {
		return undefined;
	}

	return catalog[currency.toUpperCase()];
}

export type { CurrencyUiCatalog, CurrencyUiSpec };
export { CRYPTO_CURRENCY_UI, lookupCurrencyUiSpec };
