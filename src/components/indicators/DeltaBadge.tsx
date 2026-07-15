import type { ReactNode } from "react";

import type { BadgeProps } from "./Badge.js";
import { Badge } from "./Badge.js";

type DeltaDirection = "up" | "down" | "flat";

interface DeltaBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
	direction: DeltaDirection;
	value: ReactNode;
}

/**
 * Maps delta direction onto Badge tone variants.
 */
function variantForDelta(
	direction: DeltaDirection,
): NonNullable<BadgeProps["variant"]> {
	if (direction === "up") {
		return "success";
	}
	if (direction === "down") {
		return "danger";
	}
	if (direction === "flat") {
		return "default";
	}

	const _exhaustive: never = direction;
	return _exhaustive;
}

function prefixForDelta(direction: DeltaDirection): string {
	if (direction === "up") {
		return "+";
	}
	if (direction === "down") {
		return "−";
	}
	if (direction === "flat") {
		return "=";
	}

	const _exhaustive: never = direction;
	return _exhaustive;
}

/**
 * Percent / absolute change chip. Visible `+` / `−` / `=` prefix so meaning
 * is not color-only (WCAG 1.4.1).
 */
function DeltaBadge({
	direction,
	value,
	size,
	className,
	...rest
}: DeltaBadgeProps) {
	return (
		<Badge
			{...rest}
			data-slot="delta-badge"
			data-direction={direction}
			variant={variantForDelta(direction)}
			size={size}
			className={className}
		>
			<span aria-hidden="true">{prefixForDelta(direction)}</span>
			{value}
		</Badge>
	);
}

export type { DeltaBadgeProps, DeltaDirection };
export { DeltaBadge, variantForDelta };
