import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

type LoadingVariant = "spinner" | "skeleton";

const loadingVariants = cva("", {
	variants: {
		variant: {
			spinner: "animate-spin rounded-full border-b-2 border-primary",
			skeleton: "animate-pulse rounded-md bg-muted",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
		},
	},
	compoundVariants: [
		{ variant: "spinner", size: "sm", class: "h-8 w-8" },
		{ variant: "spinner", size: "md", class: "h-12 w-12" },
		{ variant: "spinner", size: "lg", class: "h-16 w-16" },
		{ variant: "skeleton", size: "sm", class: "h-3" },
		{ variant: "skeleton", size: "md", class: "h-4" },
		{ variant: "skeleton", size: "lg", class: "h-5" },
	],
	defaultVariants: {
		variant: "spinner",
		size: "md",
	},
});

interface LoadingProps
	extends
		Omit<ComponentProps<"div">, "children">,
		VariantProps<typeof loadingVariants> {
	text?: string;
	/**
	 * Bone lines when `variant="skeleton"`. Default `3`.
	 */
	lines?: number;
}

/**
 * Busy indicator. `spinner` (default) or `skeleton` placeholder lines.
 * Exposes `role="status"` for assistive tech.
 */
function Loading({
	className,
	text,
	size,
	variant,
	lines,
	...props
}: LoadingProps) {
	let resolvedVariant: LoadingVariant = "spinner";
	if (variant === "skeleton") {
		resolvedVariant = "skeleton";
	}

	let resolvedLines = lines;
	resolvedLines ??= 3;
	if (resolvedLines < 1) {
		resolvedLines = 1;
	}

	let statusLabel: string | undefined;
	if (text === undefined || text.length === 0) {
		statusLabel = "Loading";
	}

	let message: ReactNode = null;
	if (text !== undefined && text.length > 0) {
		message = <p className="text-muted-foreground">{text}</p>;
	}

	let body: ReactNode;
	if (resolvedVariant === "skeleton") {
		const bones: ReactNode[] = [];
		for (let index = 0; index < resolvedLines; index += 1) {
			let widthClass = "w-full";
			if (index === resolvedLines - 1 && resolvedLines > 1) {
				widthClass = "w-2/3";
			}

			bones.push(
				<div
					key={`bone-${String(index)}`}
					className={cn(
						loadingVariants({
							variant: "skeleton",
							size,
						}),
						widthClass,
					)}
				/>,
			);
		}

		body = (
			<div className="flex w-full max-w-md flex-col gap-2">{bones}</div>
		);
		if (message !== null) {
			body = (
				<div className="flex w-full max-w-md flex-col gap-3">
					{body}
					{message}
				</div>
			);
		}
	} else {
		let spinnerClass = loadingVariants({
			variant: "spinner",
			size,
		});
		if (text !== undefined && text.length > 0) {
			spinnerClass = cn(spinnerClass, "mb-4");
		}

		body = (
			<div className="text-center">
				<div className={cn(spinnerClass, "mx-auto")} />
				{message}
			</div>
		);
	}

	return (
		<div
			data-slot="loading"
			data-variant={resolvedVariant}
			role="status"
			aria-label={statusLabel}
			aria-busy="true"
			className={cn("flex items-center justify-center", className)}
			{...props}
		>
			{body}
		</div>
	);
}

export type { LoadingProps, LoadingVariant };
export { Loading, loadingVariants };
