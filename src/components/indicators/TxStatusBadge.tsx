import type { ReactNode } from "react";

import type { BadgeProps } from "./Badge.js";
import { Badge } from "./Badge.js";

type TxStatus = "unconfirmed" | "confirming" | "confirmed" | "failed";

interface TxStatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
	status: TxStatus;
	children: ReactNode;
	confirmations?: number;
}

/**
 * Maps on-chain / mempool status tokens onto Badge tone variants.
 */
function variantForTxStatus(status: TxStatus): NonNullable<BadgeProps["variant"]> {
	if (status === "unconfirmed") {
		return "default";
	}
	if (status === "confirming") {
		return "info";
	}
	if (status === "confirmed") {
		return "success";
	}
	if (status === "failed") {
		return "danger";
	}

	const _exhaustive: never = status;
	return _exhaustive;
}

/**
 * Transaction status chip for wallet / explorer activity lists.
 * Pass localized label as `children`; optional `confirmations` annotates
 * confirming rows via `data-confirmations`.
 */
function TxStatusBadge({ status, children, confirmations, size, className, ...rest }: TxStatusBadgeProps) {
	let confirmationsAttr: string | undefined;
	if (confirmations !== undefined) {
		confirmationsAttr = String(confirmations);
	}

	return (
		<Badge
			{...rest}
			data-slot="tx-status-badge"
			data-status={status}
			data-confirmations={confirmationsAttr}
			variant={variantForTxStatus(status)}
			size={size}
			className={className}
		>
			{children}
		</Badge>
	);
}

export type { TxStatus, TxStatusBadgeProps };
export { TxStatusBadge, variantForTxStatus };
