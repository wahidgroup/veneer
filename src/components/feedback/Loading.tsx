import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const loadingVariants = cva(
	"animate-spin rounded-full border-b-2 border-primary mx-auto",
	{
		variants: {
			size: {
				sm: "h-8 w-8",
				md: "h-12 w-12",
				lg: "h-16 w-16",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface LoadingProps
	extends ComponentProps<"div">, VariantProps<typeof loadingVariants> {
	text?: string;
}

/**
 * Spinner with optional message. Exposes `role="status"` for assistive tech.
 */
function Loading({ className, text, size, ...props }: LoadingProps) {
	let spinnerClass = loadingVariants({ size });
	if (text !== undefined && text.length > 0) {
		spinnerClass = cn(spinnerClass, "mb-4");
	}

	let statusLabel: string | undefined;
	if (text === undefined || text.length === 0) {
		statusLabel = "Loading";
	}

	let message: ReactNode = null;
	if (text !== undefined && text.length > 0) {
		message = <p className="text-muted-foreground">{text}</p>;
	}

	return (
		<div
			data-slot="loading"
			role="status"
			aria-label={statusLabel}
			className={cn("flex items-center justify-center", className)}
			{...props}
		>
			<div className="text-center">
				<div className={spinnerClass} />
				{message}
			</div>
		</div>
	);
}

export type { LoadingProps };
export { Loading, loadingVariants };
