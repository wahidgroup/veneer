import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";
import { resolveProgressMax } from "./resolveProgressMax.js";

const circularProgressVariants = cva("relative inline-flex shrink-0", {
	variants: {
		size: {
			sm: "size-8",
			md: "size-12",
			lg: "size-16",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface CircularProgressProps
	extends Omit<ComponentProps<"div">, "children">, VariantProps<typeof circularProgressVariants> {
	value?: number;
	max?: number;
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
 * Compact task progress ring. Determinate sets `aria-valuenow`;
 * indeterminate omits it (same APG rule as ProgressBar).
 */
function CircularProgress({ value, max, size, "aria-label": ariaLabel, className, ...rest }: CircularProgressProps) {
	const resolvedMax = resolveProgressMax(max);

	let resolvedSize: NonNullable<VariantProps<typeof circularProgressVariants>["size"]> = "md";
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

	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	let dashOffset = circumference;
	if (!indeterminate) {
		dashOffset = circumference - (percent / 100) * circumference;
	}

	let valueNow: number | undefined;
	if (!indeterminate) {
		valueNow = clamped;
	}

	let indeterminateAttr = "false";
	if (indeterminate) {
		indeterminateAttr = "true";
	}

	let ringClass = "stroke-primary transition-[stroke-dashoffset] duration-300";
	let svgClass = "size-full -rotate-90";
	if (indeterminate) {
		dashOffset = circumference * 0.75;
		ringClass = "stroke-primary";
		svgClass = "size-full animate-spin";
	}

	return (
		<div
			data-slot="circular-progress"
			role="progressbar"
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={resolvedMax}
			aria-valuenow={valueNow}
			data-indeterminate={indeterminateAttr}
			data-size={resolvedSize}
			className={cn(circularProgressVariants({ size: resolvedSize }), className)}
			{...rest}
		>
			<svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
				<circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					strokeWidth="8"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					className={ringClass}
				/>
			</svg>
		</div>
	);
}

export type { CircularProgressProps };
export { CircularProgress, circularProgressVariants };
