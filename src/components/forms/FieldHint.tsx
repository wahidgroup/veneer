import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";

type FieldHintProps = ComponentProps<"p">;

/**
 * Supporting hint text under a control.
 */
function FieldHint({ children, className, ...rest }: FieldHintProps) {
	return (
		<p
			data-slot="field-hint"
			className={cn("text-sm text-muted-foreground", className)}
			{...rest}
		>
			{children}
		</p>
	);
}

export type { FieldHintProps };
export { FieldHint };
