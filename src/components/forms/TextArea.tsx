import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";

interface TextAreaProps extends ComponentProps<"textarea"> {
	invalid?: boolean;
}

/**
 * Multi-line text control. Pair with `Label` / `FormField`.
 */
function TextArea({ className, invalid, rows, ...rest }: TextAreaProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedRows = rows;
	resolvedRows ??= 4;

	return (
		<textarea
			data-slot="textarea"
			rows={resolvedRows}
			aria-invalid={resolvedInvalid}
			className={cn(
				controlVariants({ invalid: resolvedInvalid }),
				"min-h-24 resize-y",
				className,
			)}
			{...rest}
		/>
	);
}

export type { TextAreaProps };
export { TextArea };
