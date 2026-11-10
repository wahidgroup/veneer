import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";
import { MoneyAmount } from "./MoneyAmount.js";

const ledgerAmountVariants = cva("text-sm font-medium tabular-nums", {
	variants: {
		entry: {
			debit: "text-destructive",
			credit: "text-success",
			zero: "text-muted-foreground",
		},
	},
	defaultVariants: {
		entry: "zero",
	},
});

type LedgerEntryKind = NonNullable<VariantProps<typeof ledgerAmountVariants>["entry"]>;

interface LedgerRowProps extends Omit<ComponentProps<"li">, "children"> {
	description: ReactNode;
	amountMinor: number;
	currency: string;
	balanceMinor?: number;
	locale?: string;
}

function entryKindForAmount(amountMinor: number): LedgerEntryKind {
	if (amountMinor < 0) {
		return "debit";
	}
	if (amountMinor > 0) {
		return "credit";
	}

	return "zero";
}

/**
 * Ledger entry row with signed minor-unit amount and optional running
 * balance. Negative `amountMinor` renders debit styling; positive renders
 * credit styling via {@link MoneyAmount}. Root is `li` for list composition.
 */
function LedgerRow({ description, amountMinor, currency, balanceMinor, locale, className, ...rest }: LedgerRowProps) {
	const entryKind = entryKindForAmount(amountMinor);

	let balanceNode: ReactNode = null;
	if (balanceMinor !== undefined) {
		balanceNode = (
			<div data-slot="ledger-row-balance" className="text-xs text-muted-foreground">
				<MoneyAmount amountMinor={balanceMinor} currency={currency} locale={locale} />
			</div>
		);
	}

	return (
		<li
			data-slot="ledger-row"
			data-entry={entryKind}
			className={cn("flex w-full items-start justify-between gap-4 border-b border-border px-4 py-3", className)}
			{...rest}
		>
			<div data-slot="ledger-row-description" className="min-w-0 flex-1 text-sm text-foreground">
				{description}
			</div>
			<div data-slot="ledger-row-amount" className="flex shrink-0 flex-col items-end gap-0.5">
				<MoneyAmount
					amountMinor={amountMinor}
					currency={currency}
					locale={locale}
					className={ledgerAmountVariants({ entry: entryKind })}
				/>
				{balanceNode}
			</div>
		</li>
	);
}

export type { LedgerEntryKind, LedgerRowProps };
export { LedgerRow, ledgerAmountVariants };
