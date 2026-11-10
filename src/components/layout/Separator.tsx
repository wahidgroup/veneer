import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const separatorVariants = cva("shrink-0 border-0 bg-border", {
	variants: {
		orientation: {
			horizontal: "h-px w-full",
			vertical: "h-full w-px",
		},
	},
	defaultVariants: {
		orientation: "horizontal",
	},
});

interface SeparatorProps extends Omit<ComponentProps<"hr">, "children">, VariantProps<typeof separatorVariants> {}

/**
 * Thematic break using a native `hr` (implicit separator role). Vertical
 * orientation sets `aria-orientation` for AT; not an interactive splitter.
 */
function Separator({ orientation, className, ...rest }: SeparatorProps) {
	let resolvedOrientation: "horizontal" | "vertical" = "horizontal";
	if (orientation === "vertical") {
		resolvedOrientation = "vertical";
	}

	let ariaOrientation: "horizontal" | "vertical" | undefined;
	if (resolvedOrientation === "vertical") {
		ariaOrientation = "vertical";
	}

	return (
		<hr
			data-slot="separator"
			data-orientation={resolvedOrientation}
			aria-orientation={ariaOrientation}
			className={cn(separatorVariants({ orientation: resolvedOrientation }), className)}
			{...rest}
		/>
	);
}

export type { SeparatorProps };
export { Separator, separatorVariants };
