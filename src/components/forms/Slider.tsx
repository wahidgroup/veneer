import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface SliderProps extends Omit<
	ComponentProps<"input">,
	"type" | "onChange"
> {
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	showValue?: boolean;
	invalid?: boolean;
}

/**
 * Range control for capacity scales. Pair with `FormField` via `id` / `htmlFor`.
 */
function Slider({
	className,
	value,
	defaultValue,
	onValueChange,
	showValue,
	invalid,
	disabled,
	min,
	max,
	id,
	...rest
}: SliderProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedShowValue = showValue;
	resolvedShowValue ??= true;

	let resolvedMin = min;
	resolvedMin ??= 0;

	let resolvedMax = max;
	resolvedMax ??= 100;

	let valueNode: ReactNode = null;
	if (resolvedShowValue && value !== undefined) {
		valueNode = (
			<span className="tabular-nums text-sm text-muted-foreground">
				{value}
			</span>
		);
	}

	return (
		<div
			data-slot="slider"
			className={cn("flex w-full items-center gap-3", className)}
		>
			<input
				id={id}
				type="range"
				disabled={disabled}
				aria-invalid={resolvedInvalid}
				min={resolvedMin}
				max={resolvedMax}
				value={value}
				defaultValue={defaultValue}
				className={cn(
					"h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary",
					"disabled:cursor-not-allowed disabled:opacity-50",
					resolvedInvalid && "accent-destructive",
				)}
				onChange={(event) => {
					if (onValueChange === undefined) {
						return;
					}

					onValueChange(Number(event.target.value));
				}}
				{...rest}
			/>
			{valueNode}
		</div>
	);
}

export type { SliderProps };
export { Slider };
