import type { ComponentProps } from "react";

import type { CurrencyCatalog } from "../../utils/currencySpec.js";
import { CRYPTO_CURRENCIES } from "../../utils/currencySpec.js";
import type {
	MoneyCurrencyDisplay,
	MoneyCurrencySign,
} from "../../utils/formatMoneyMinor.js";
import { formatMoneyMinor } from "../../utils/formatMoneyMinor.js";
import { cn } from "../../utils/cn.js";

interface MoneyAmountProps extends Omit<ComponentProps<"span">, "children"> {
	amountMinor: number | bigint;
	currency: string;
	locale?: string;
	currencyDisplay?: MoneyCurrencyDisplay;
	currencySign?: MoneyCurrencySign;
	/**
	 * Defaults to {@link CRYPTO_CURRENCIES} (BTC/XBT). Pass `{}` for Intl-only.
	 */
	currencies?: CurrencyCatalog;
}

/**
 * Locale-aware currency display from integer minor units. Prefer
 * `formatMoneyMinor` for non-DOM formatting. BTC/XBT use satoshi scale by
 * default; other non-ISO codes need a custom catalog.
 */
function MoneyAmount({
	amountMinor,
	currency,
	locale,
	currencyDisplay,
	currencySign,
	currencies: currenciesProp,
	className,
	...rest
}: MoneyAmountProps) {
	let currencies: CurrencyCatalog = CRYPTO_CURRENCIES;
	if (currenciesProp !== undefined) {
		currencies = currenciesProp;
	}

	const formatted = formatMoneyMinor({
		amountMinor,
		currency,
		locale,
		currencyDisplay,
		currencySign,
		currencies,
	});

	return (
		<span
			data-slot="money-amount"
			className={cn("tabular-nums", className)}
			{...rest}
		>
			{formatted}
		</span>
	);
}

export type { MoneyAmountProps };
export { MoneyAmount };
