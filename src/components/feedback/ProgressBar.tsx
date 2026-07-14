import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";
import { resolveProgressMax } from "./resolveProgressMax.js";

const progressBarTrackVariants = cva(
	"relative w-full overflow-hidden rounded-full bg-muted",
	{
		variants: {
			size: {
				sm: "h-1.5",
				md: "h-2.5",
				lg: "h-3.5",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface ProgressBarProps
	extends
		Omit<ComponentProps<"div">, "children">,
		VariantProps<typeof progressBarTrackVariants> {
	value?: number;
	max?: number;
	label?: ReactNode;
	"aria-label": string;
}

function clampProgress(value: number, max: number): number {
	if (value < 0) {
		return 0;
	}
	if (value > max) {
		return max;
	}

	return value;
}

/**
 * Long-running job fraction. Determinate sets `aria-valuenow`; indeterminate
 * omits it (APG range practice). Complements Loading for busy waits.
 */
function ProgressBar({
	value,
	max,
	size,
	label,
	"aria-label": ariaLabel,
	className,
	...rest
}: ProgressBarProps) {
	const resolvedMax = resolveProgressMax(max);

	let resolvedSize: NonNullable<
		VariantProps<typeof progressBarTrackVariants>["size"]
	> = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	} else if (size === "lg") {
		resolvedSize = "lg";
	}

	const indeterminate = value === undefined;
	let clamped = 0;
	if (!indeterminate) {
		clamped = clampProgress(value, resolvedMax);
	}

	let percent = 0;
	if (!indeterminate && resolvedMax > 0) {
		percent = (clamped / resolvedMax) * 100;
	}

	let labelNode: ReactNode = null;
	if (label !== undefined) {
		labelNode = (
			<div className="mb-1.5 text-sm text-muted-foreground">{label}</div>
		);
	}

	let fillClass =
		"h-full rounded-full bg-primary transition-[width] duration-300 ease-out";
	if (indeterminate) {
		fillClass = cn("h-full w-1/3 rounded-full bg-primary", "animate-pulse");
	}

	let fillStyle: { width: string } | undefined;
	if (!indeterminate) {
		fillStyle = { width: `${String(percent)}%` };
	}

	let valueNow: number | undefined;
	if (!indeterminate) {
		valueNow = clamped;
	}

	let indeterminateAttr = "false";
	if (indeterminate) {
		indeterminateAttr = "true";
	}

	return (
		<div
			data-slot="progress-bar"
			className={cn("w-full", className)}
			{...rest}
		>
			{labelNode}
			<div
				role="progressbar"
				aria-label={ariaLabel}
				aria-valuemin={0}
				aria-valuemax={resolvedMax}
				aria-valuenow={valueNow}
				data-indeterminate={indeterminateAttr}
				data-size={resolvedSize}
				className={progressBarTrackVariants({ size: resolvedSize })}
			>
				<div className={fillClass} style={fillStyle} />
			</div>
		</div>
	);
}

export type { ProgressBarProps };
export { ProgressBar, progressBarTrackVariants };
