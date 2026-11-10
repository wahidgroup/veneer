import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Inbox } from "lucide-react";

import { cn } from "../../utils/cn.js";

const emptyStateVariants = cva("flex w-full flex-col items-center justify-center text-center", {
	variants: {
		size: {
			sm: "gap-2 px-3 py-4",
			md: "gap-3 px-6 py-10",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const emptyStateTitleVariants = cva("font-semibold text-foreground", {
	variants: {
		size: {
			sm: "text-sm",
			md: "text-base",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const emptyStateDescriptionVariants = cva("text-muted-foreground", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-sm",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const emptyStateIconVariants = cva("shrink-0 text-muted-foreground", {
	variants: {
		size: {
			sm: "size-6",
			md: "size-10",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface EmptyStateProps extends Omit<ComponentProps<"div">, "title">, VariantProps<typeof emptyStateVariants> {
	title: ReactNode;
	children?: ReactNode;
	icon?: ReactNode;
	action?: ReactNode;
}

/**
 * Settled empty / first-run chrome. Parent decides when to render.
 * Pass `action` as composed Button (or link) chrome. Use `size="sm"` in
 * DataTable `empty`. Busy waits stay on Loading; errors stay on ErrorState.
 */
function EmptyState({ title, children, icon, action, size, className, ...rest }: EmptyStateProps) {
	let resolvedSize: "sm" | "md" = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	}

	let iconNode: ReactNode = (
		<Inbox
			data-slot="empty-state-icon"
			className={emptyStateIconVariants({ size: resolvedSize })}
			aria-hidden="true"
		/>
	);
	if (icon === null) {
		iconNode = null;
	} else if (icon !== undefined) {
		iconNode = icon;
	}

	let descriptionNode: ReactNode = null;
	if (children !== undefined) {
		descriptionNode = (
			<div
				className={emptyStateDescriptionVariants({
					size: resolvedSize,
				})}
			>
				{children}
			</div>
		);
	}

	let actionNode: ReactNode = null;
	if (action !== undefined) {
		actionNode = <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>;
	}

	return (
		<div
			data-slot="empty-state"
			data-size={resolvedSize}
			role="status"
			className={cn(emptyStateVariants({ size: resolvedSize }), className)}
			{...rest}
		>
			{iconNode}
			<div className="flex max-w-md flex-col items-center gap-1">
				<div className={emptyStateTitleVariants({ size: resolvedSize })}>{title}</div>
				{descriptionNode}
			</div>
			{actionNode}
		</div>
	);
}

export type { EmptyStateProps };
export { EmptyState, emptyStateVariants };
