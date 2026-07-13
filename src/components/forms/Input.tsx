import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";

interface InputProps extends ComponentProps<"input"> {
	invalid?: boolean;
}

/**
 * Single-line text control. Pair with `Label` / `FormField`; set `aria-invalid` via `invalid`.
 */
function Input({ className, invalid, type, ...rest }: InputProps) {
	let resolvedType = type;
	resolvedType ??= "text";

	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	return (
		<input
			data-slot="input"
			type={resolvedType}
			aria-invalid={resolvedInvalid}
			className={cn(
				controlVariants({ invalid: resolvedInvalid }),
				className,
			)}
			{...rest}
		/>
	);
}

export type { InputProps };
export { Input };
