import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";

interface DateTimePickerProps extends Omit<
	ComponentProps<"input">,
	"type" | "onChange"
> {
	invalid?: boolean;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	granularity?: "date" | "time" | "datetime";
}

/**
 * Native date / time / datetime control for schedule windows. Pair with `FormField`.
 */
function DateTimePicker({
	className,
	invalid,
	value,
	defaultValue,
	onValueChange,
	granularity,
	...rest
}: DateTimePickerProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedGranularity = granularity;
	resolvedGranularity ??= "datetime";

	let inputType = "datetime-local";
	if (resolvedGranularity === "date") {
		inputType = "date";
	} else if (resolvedGranularity === "time") {
		inputType = "time";
	}

	return (
		<input
			data-slot="datetime-picker"
			type={inputType}
			aria-invalid={resolvedInvalid}
			value={value}
			defaultValue={defaultValue}
			className={cn(
				controlVariants({ invalid: resolvedInvalid }),
				"cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer",
				className,
			)}
			onChange={(event) => {
				if (onValueChange !== undefined) {
					onValueChange(event.target.value);
				}
			}}
			{...rest}
		/>
	);
}

export type { DateTimePickerProps };
export { DateTimePicker };
