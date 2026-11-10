import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";

interface NumberInputProps extends Omit<ComponentProps<"input">, "type" | "onChange"> {
	invalid?: boolean;
	value?: number | "";
	defaultValue?: number;
	onValueChange?: (value: number | undefined) => void;
}

/**
 * Numeric field for counts, ports, and capacity. Pair with `FormField`.
 */
function NumberInput({ className, invalid, value, defaultValue, onValueChange, onBlur, ...rest }: NumberInputProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	return (
		<input
			data-slot="number-input"
			type="number"
			aria-invalid={resolvedInvalid}
			value={value}
			defaultValue={defaultValue}
			className={cn(controlVariants({ invalid: resolvedInvalid }), "tabular-nums", className)}
			onChange={(event) => {
				if (onValueChange === undefined) {
					return;
				}

				const raw = event.target.value;
				if (raw.length === 0) {
					onValueChange(undefined);
					return;
				}

				const next = Number(raw);
				if (Number.isFinite(next)) {
					onValueChange(next);
				}
			}}
			onBlur={onBlur}
			{...rest}
		/>
	);
}

export type { NumberInputProps };
export { NumberInput };
