import type { ReactNode } from "react";

import type { BadgeProps } from "./Badge.js";
import { Badge } from "./Badge.js";

type StatusBadgeStatus =
	| "running"
	| "pending"
	| "success"
	| "warning"
	| "danger"
	| "drifted";

interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
	status: StatusBadgeStatus;
	children: ReactNode;
}

/**
 * Maps inventory status tokens onto Badge tone variants.
 */
function variantForStatus(
	status: StatusBadgeStatus,
): NonNullable<BadgeProps["variant"]> {
	if (status === "running") {
		return "info";
	}
	if (status === "pending") {
		return "default";
	}
	if (status === "success") {
		return "success";
	}
	if (status === "warning") {
		return "warning";
	}
	if (status === "danger") {
		return "danger";
	}
	if (status === "drifted") {
		return "warning";
	}

	const _exhaustive: never = status;
	return _exhaustive;
}

/**
 * Inventory status chip. Maps console statuses onto Badge tone variants
 * (`running` → info, `drifted` → warning, `pending` → default, …).
 */
function StatusBadge({
	status,
	children,
	size,
	className,
	...rest
}: StatusBadgeProps) {
	return (
		<Badge
			{...rest}
			data-slot="status-badge"
			data-status={status}
			variant={variantForStatus(status)}
			size={size}
			className={className}
		>
			{children}
		</Badge>
	);
}

export type { StatusBadgeProps, StatusBadgeStatus };
export { StatusBadge, variantForStatus };
