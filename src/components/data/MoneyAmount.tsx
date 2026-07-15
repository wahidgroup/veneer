import type { ComponentProps } from "react";

import type {
	MoneyCurrencyDisplay,
	MoneyCurrencySign,
} from "../../utils/formatMoneyMinor.js";
import type { CurrencyCatalog } from "../../utils/currencySpec.js";
import { formatMoneyMinor } from "../../utils/formatMoneyMinor.js";
import { cn } from "../../utils/cn.js";

interface MoneyAmountProps extends Omit<ComponentProps<"span">, "children"> {
	amountMinor: number | bigint;
	currency: string;
	locale?: string;
	currencyDisplay?: MoneyCurrencyDisplay;
	currencySign?: MoneyCurrencySign;
	currencies?: CurrencyCatalog;
}

/**
 * Locale-aware currency display from integer minor units. Prefer
 * `formatMoneyMinor` for non-DOM formatting. Pass `currencies` for
 * non-ISO fraction digits (e.g. {@link CRYPTO_CURRENCIES}).
 */
function MoneyAmount({
	amountMinor,
	currency,
	locale,
	currencyDisplay,
	currencySign,
	currencies,
	className,
	...rest
}: MoneyAmountProps) {
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
