import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const cardVariants = cva(
	"rounded-md border border-border bg-card text-card-foreground",
	{
		variants: {
			size: {
				sm: "p-3",
				md: "p-4",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface CardProps
	extends ComponentProps<"div">, VariantProps<typeof cardVariants> {}

/**
 * Non-interactive panel chrome for grouping related content
 * (settings, summaries).
 */
function Card({ size, className, ...rest }: CardProps) {
	let resolvedSize: "sm" | "md" = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	}

	return (
		<div
			data-slot="card"
			data-size={resolvedSize}
			className={cn(cardVariants({ size: resolvedSize }), className)}
			{...rest}
		/>
	);
}

export type { CardProps };
export { Card, cardVariants };
