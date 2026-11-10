import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const quotaMeterTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
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
});

interface QuotaMeterProps
	extends Omit<ComponentProps<"div">, "children">, VariantProps<typeof quotaMeterTrackVariants> {
	value: number;
	max?: number;
	min?: number;
	label?: ReactNode;
	valueText?: string;
	"aria-label": string;
}

function clampMeter(value: number, min: number, max: number): number {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}

	return value;
}

/**
 * Soft-limit gauge.
 */
function QuotaMeter({
	value,
	max,
	min,
	size,
	label,
	valueText,
	"aria-label": ariaLabel,
	className,
	...rest
}: QuotaMeterProps) {
	let resolvedMin = min;
	resolvedMin ??= 0;

	let resolvedMax = max;
	resolvedMax ??= 100;
	if (resolvedMax <= resolvedMin) {
		resolvedMax = resolvedMin + 1;
	}

	let resolvedSize: NonNullable<VariantProps<typeof quotaMeterTrackVariants>["size"]> = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	} else if (size === "lg") {
		resolvedSize = "lg";
	}

	const clamped = clampMeter(value, resolvedMin, resolvedMax);
	const span = resolvedMax - resolvedMin;
	let percent = 0;
	if (span > 0) {
		percent = ((clamped - resolvedMin) / span) * 100;
	}

	let labelNode: ReactNode = null;
	if (label !== undefined) {
		let valueTextNode: ReactNode = null;
		if (valueText !== undefined) {
			valueTextNode = <span>{valueText}</span>;
		}

		labelNode = (
			<div className="mb-1.5 flex items-center justify-between gap-2 text-sm text-muted-foreground">
				<span>{label}</span>
				{valueTextNode}
			</div>
		);
	}

	return (
		<div data-slot="quota-meter" className={cn("w-full", className)} {...rest}>
			{labelNode}
			<div
				role="meter"
				aria-label={ariaLabel}
				aria-valuemin={resolvedMin}
				aria-valuemax={resolvedMax}
				aria-valuenow={clamped}
				aria-valuetext={valueText}
				data-size={resolvedSize}
				className={quotaMeterTrackVariants({ size: resolvedSize })}
			>
				<div
					className="h-full rounded-full bg-info transition-[width] duration-300 ease-out"
					style={{ width: `${String(percent)}%` }}
				/>
			</div>
		</div>
	);
}

export type { QuotaMeterProps };
export { QuotaMeter, quotaMeterTrackVariants };
