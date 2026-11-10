import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";

type FieldErrorProps = ComponentProps<"p">;

/**
 * Field-level error message. Use `role="alert"` so assistive tech announces updates.
 */
function FieldError({ children, className, ...rest }: FieldErrorProps) {
	return (
		<p data-slot="field-error" role="alert" className={cn("text-sm text-destructive", className)} {...rest}>
			{children}
		</p>
	);
}

export type { FieldErrorProps };
export { FieldError };
