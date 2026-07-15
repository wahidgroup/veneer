import type { ComponentProps, ReactNode } from "react";

import type { BtcDisplayUnit } from "../../utils/formatBtcSats.js";
import { MoneyInput } from "./MoneyInput.js";

interface BtcInputProps extends Omit<
	ComponentProps<typeof MoneyInput>,
	| "currency"
	| "currencies"
	| "currencyDisplay"
	| "amountMinor"
	| "defaultAmountMinor"
	| "onAmountMinorChange"
	| "startAdornment"
> {
	/**
	 * Controlled satoshi integer. Pass `null` for controlled empty.
	 */
	amountSats?: number | null;
	defaultAmountSats?: number;
	onAmountSatsChange?: (value: number | undefined) => void;
	/**
	 * Edit surface: `btc` = eight-decimal major units (default);
	 * `sats` = integer satoshis.
	 */
	unit?: BtcDisplayUnit;
	startAdornment?: ReactNode;
}

/**
 * Bitcoin amount field. Public value is always satoshi integers.
 * Built on {@link MoneyInput} with first-class BTC only.
 */
function BtcInput({
	amountSats,
	defaultAmountSats,
	onAmountSatsChange,
	unit,
	startAdornment,
	...rest
}: BtcInputProps) {
	let resolvedUnit: BtcDisplayUnit = "btc";
	if (unit === "sats") {
		resolvedUnit = "sats";
	}

	if (resolvedUnit === "sats") {
		let satsAdornment: ReactNode = (
			<span aria-hidden="true" className="text-xs font-medium">
				sats
			</span>
		);
		if (startAdornment !== undefined) {
			satsAdornment = startAdornment;
		}

		return (
			<MoneyInput
				{...rest}
				currency="BTC"
				currencies={{
					BTC: { code: "BTC", fractionDigits: 0 },
				}}
				amountMinor={amountSats}
				defaultAmountMinor={defaultAmountSats}
				onAmountMinorChange={onAmountSatsChange}
				startAdornment={satsAdornment}
				data-slot="btc-input"
				data-unit="sats"
			/>
		);
	}

	return (
		<MoneyInput
			{...rest}
			currency="BTC"
			amountMinor={amountSats}
			defaultAmountMinor={defaultAmountSats}
			onAmountMinorChange={onAmountSatsChange}
			startAdornment={startAdornment}
			data-slot="btc-input"
			data-unit="btc"
		/>
	);
}

export type { BtcInputProps };
export { BtcInput };
