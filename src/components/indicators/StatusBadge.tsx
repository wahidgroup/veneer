import type { ReactNode } from "react";

import { Badge } from "./Badge.js";
import type { BadgeProps } from "./Badge.js";

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

	return "warning";
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
