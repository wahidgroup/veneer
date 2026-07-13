import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const badgeVariants = cva(
	"inline-flex items-center font-semibold rounded-full whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				primary: "bg-primary text-primary-foreground",
				success: "bg-success text-success-foreground",
				warning: "bg-warning text-warning-foreground",
				danger: "bg-destructive-muted text-destructive-muted-foreground",
				info: "bg-info text-info-foreground",
			},
			size: {
				sm: "px-2 py-0.5 text-xs",
				md: "px-2.5 py-1 text-xs",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

interface BadgeProps
	extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

/**
 * Status / label badge with CVA variants.
 */
function Badge({ variant, size, className, ...props }: BadgeProps) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export type { BadgeProps };
export { Badge, badgeVariants };
