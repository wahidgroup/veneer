import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted", {
	variants: {
		shape: {
			line: "h-4 w-full",
			title: "h-5 w-2/3",
			avatar: "size-8 rounded-full",
			block: "h-24 w-full",
		},
	},
	defaultVariants: {
		shape: "line",
	},
});

interface SkeletonProps
	extends
		Omit<ComponentProps<"div">, "children">,
		VariantProps<typeof skeletonVariants> {}

/**
 * Single placeholder bone for table/detail loading composition.
 */
function Skeleton({ shape, className, ...rest }: SkeletonProps) {
	let resolvedShape: NonNullable<
		VariantProps<typeof skeletonVariants>["shape"]
	> = "line";
	if (shape === "title") {
		resolvedShape = "title";
	} else if (shape === "avatar") {
		resolvedShape = "avatar";
	} else if (shape === "block") {
		resolvedShape = "block";
	}

	return (
		<div
			data-slot="skeleton"
			data-shape={resolvedShape}
			aria-hidden="true"
			className={cn(
				skeletonVariants({ shape: resolvedShape }),
				className,
			)}
			{...rest}
		/>
	);
}

export type { SkeletonProps };
export { Skeleton, skeletonVariants };
