import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useId, useState } from "react";

import type { MoneyCurrencyDisplay } from "../../utils/formatMoneyMinor.js";
import type { CurrencyUiCatalog } from "./currencyCatalog.js";
import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";
import { lookupCurrencyUiSpec } from "./currencyCatalog.js";
import {
	currencyAdornmentText,
	currencyFractionDigits,
	formatMajorDraft,
	parseMajorInput,
} from "../../utils/formatMoneyMinor.js";

interface MoneyInputProps extends Omit<ComponentProps<"div">, "onChange"> {
	currency: string;
	locale?: string;
	currencyDisplay?: MoneyCurrencyDisplay;
	/**
	 * Currency catalog (digits + optional adornments). Omit for ISO/Intl
	 * only. Pass {@link CRYPTO_CURRENCY_UI} for BTC/XBT.
	 */
	currencies?: CurrencyUiCatalog;
	/**
	 * Controlled minor units. Pass `null` for a controlled empty value;
	 * omit for uncontrolled.
	 */
	amountMinor?: number | null;
	defaultAmountMinor?: number;
	onAmountMinorChange?: (value: number | undefined) => void;
	invalid?: boolean;
	disabled?: boolean;
	id?: string;
	/**
	 * When set, a hidden input submits the committed integer minor units
	 * (not the major draft shown in the text field).
	 */
	name?: string;
	placeholder?: string;
	startAdornment?: ReactNode;
	"aria-label"?: string;
	"aria-labelledby"?: string;
	"aria-describedby"?: string;
}

function draftFromMinor(
	amountMinor: number | null | undefined,
	digits: number,
	locale: string | undefined,
): string {
	if (amountMinor === undefined || amountMinor === null) {
		return "";
	}
	return formatMajorDraft(amountMinor, digits, locale);
}

function resolveAdornment(options: {
	currency: string;
	locale: string | undefined;
	currencyDisplay: MoneyCurrencyDisplay | undefined;
	startAdornment: ReactNode | undefined;
	currencies: CurrencyUiCatalog | undefined;
}): { node: ReactNode; inputPadClass: string } {
	if (options.startAdornment !== undefined) {
		return { node: options.startAdornment, inputPadClass: "pl-9" };
	}

	const spec = lookupCurrencyUiSpec(options.currency, options.currencies);
	if (spec?.startAdornment !== undefined) {
		return { node: spec.startAdornment, inputPadClass: "pl-9" };
	}

	const text = currencyAdornmentText(
		options.currency,
		options.locale,
		options.currencyDisplay,
	);
	let inputPadClass = "pl-9";
	if (text.length > 1) {
		inputPadClass = "pl-12";
	}

	return {
		node: <span aria-hidden="true">{text}</span>,
		inputPadClass,
	};
}

/**
 * Currency amount field. Public value is integer minor units; pairs with
 * {@link FormField}. Fiat uses ISO 4217 via Intl. Pass `currencies` for
 * non-ISO specs (digits + adornment).
 */
function MoneyInput({
	currency,
	locale,
	currencyDisplay,
	currencies,
	amountMinor: controlledMinor,
	defaultAmountMinor,
	onAmountMinorChange,
	invalid,
	disabled,
	id,
	name,
	placeholder,
	startAdornment,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	...rest
}: MoneyInputProps) {
	const autoId = useId();
	let inputId = id;
	inputId ??= autoId;

	const isControlled = controlledMinor !== undefined;
	const digits = currencyFractionDigits(currency, locale, currencies);

	let initialMinor: number | undefined;
	if (isControlled) {
		if (controlledMinor !== null) {
			initialMinor = controlledMinor;
		}
	} else if (defaultAmountMinor !== undefined) {
		initialMinor = defaultAmountMinor;
	}

	const [committedMinor, setCommittedMinor] = useState(initialMinor);
	const [draft, setDraft] = useState(() => {
		return draftFromMinor(initialMinor, digits, locale);
	});
	const [prevControlled, setPrevControlled] = useState(controlledMinor);
	const [prevLocale, setPrevLocale] = useState(locale);
	const [prevCurrency, setPrevCurrency] = useState(currency);
	const [prevDigits, setPrevDigits] = useState(digits);

	if (isControlled && controlledMinor !== prevControlled) {
		setPrevControlled(controlledMinor);

		if (controlledMinor === null) {
			setCommittedMinor(undefined);
		} else {
			setCommittedMinor(controlledMinor);
		}

		setDraft(draftFromMinor(controlledMinor, digits, locale));
	}

	if (
		locale !== prevLocale ||
		currency !== prevCurrency ||
		digits !== prevDigits
	) {
		setPrevLocale(locale);
		setPrevCurrency(currency);
		setPrevDigits(digits);

		let source: number | null | undefined = committedMinor;
		if (isControlled) {
			source = controlledMinor;
		}

		setDraft(draftFromMinor(source, digits, locale));
	}

	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	const adornment = resolveAdornment({
		currency,
		locale,
		currencyDisplay,
		startAdornment,
		currencies,
	});

	let submittedMinor: number | undefined = committedMinor;
	if (isControlled) {
		if (controlledMinor === null) {
			submittedMinor = undefined;
		} else {
			submittedMinor = controlledMinor;
		}
	}

	let hiddenValue = "";
	if (submittedMinor !== undefined) {
		hiddenValue = String(submittedMinor);
	}

	let hiddenField: ReactNode = null;
	if (name !== undefined && disabled !== true) {
		hiddenField = <input type="hidden" name={name} value={hiddenValue} />;
	}

	function commitDraft() {
		const parsed = parseMajorInput(draft, locale, digits);
		if (draft.trim().length === 0) {
			if (!isControlled) {
				setCommittedMinor(undefined);
			}

			setDraft("");

			if (onAmountMinorChange !== undefined) {
				onAmountMinorChange(undefined);
			}

			return;
		}

		if (parsed === undefined) {
			let restore: number | null | undefined = committedMinor;
			if (isControlled) {
				restore = controlledMinor;
			}

			setDraft(draftFromMinor(restore, digits, locale));
			return;
		}

		if (!isControlled) {
			setCommittedMinor(parsed);
		}

		setDraft(formatMajorDraft(parsed, digits, locale));

		if (onAmountMinorChange !== undefined) {
			onAmountMinorChange(parsed);
		}
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter") {
			return;
		}

		event.preventDefault();
		commitDraft();
	}

	return (
		<div
			data-slot="money-input"
			className={cn("relative w-full", className)}
			{...rest}
		>
			{hiddenField}
			<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
				{adornment.node}
			</span>
			<input
				id={inputId}
				type="text"
				inputMode="decimal"
				autoComplete="off"
				disabled={disabled}
				placeholder={placeholder}
				aria-invalid={resolvedInvalid}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				value={draft}
				className={cn(
					controlVariants({ invalid: resolvedInvalid }),
					"tabular-nums py-2 pr-3",
					adornment.inputPadClass,
				)}
				onChange={(event) => {
					setDraft(event.target.value);
				}}
				onBlur={() => {
					commitDraft();
				}}
				onKeyDown={onKeyDown}
			/>
		</div>
	);
}

export type { MoneyInputProps };
export { MoneyInput };
