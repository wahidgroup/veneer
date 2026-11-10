import type { ComponentProps, ElementType } from "react";

import { cn } from "../../utils/cn.js";

interface VisuallyHiddenProps extends ComponentProps<"span"> {
	as?: ElementType;
}

/**
 * Hides content visually while keeping it in the accessibility tree
 * (clip-path pattern). Do not use for focusable controls that stay hidden.
 */
function VisuallyHidden({ as, className, children, ...rest }: VisuallyHiddenProps) {
	let Component: ElementType = "span";
	if (as !== undefined) {
		Component = as;
	}

	return (
		<Component
			data-slot="visually-hidden"
			className={cn(
				"absolute m-0 h-px w-px overflow-hidden border-0 p-0",
				"whitespace-nowrap [clip-path:inset(50%)]",
				className,
			)}
			{...rest}
		>
			{children}
		</Component>
	);
}

export type { VisuallyHiddenProps };
export { VisuallyHidden };
