import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface LabelProps extends ComponentProps<"label"> {
	required?: boolean;
}

/**
 * Form label. Set `htmlFor` to the control id.
 */
function Label({ children, className, required, ...rest }: LabelProps) {
	let marker: ReactNode = null;
	if (required === true) {
		marker = (
			<span className="text-destructive ml-0.5" aria-hidden="true">
				*
			</span>
		);
	}

	return (
		<label
			data-slot="label"
			className={cn("text-foreground text-sm font-medium", className)}
			{...rest}
		>
			{children}
			{marker}
		</label>
	);
}

export type { LabelProps };
export { Label };
