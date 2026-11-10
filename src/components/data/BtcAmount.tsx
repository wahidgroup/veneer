import type { ComponentProps } from "react";

import type { BtcDisplayUnit } from "../../utils/formatBtcSats.js";
import { formatBtcSats } from "../../utils/formatBtcSats.js";
import { cn } from "../../utils/cn.js";

interface BtcAmountProps extends Omit<ComponentProps<"span">, "children"> {
	amountSats: number | bigint;
	unit: BtcDisplayUnit;
	locale?: string;
}

/**
 * Bitcoin amount display from a satoshi integer. Unit toggle belongs to the
 * app; this component is display-only.
 */
function BtcAmount({ amountSats, unit, locale, className, ...rest }: BtcAmountProps) {
	const formatted = formatBtcSats({ amountSats, unit, locale });

	return (
		<span data-slot="btc-amount" data-unit={unit} className={cn("tabular-nums", className)} {...rest}>
			{formatted}
		</span>
	);
}

export type { BtcAmountProps };
export { BtcAmount };
