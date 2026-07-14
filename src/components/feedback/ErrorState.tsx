import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { CircleAlert, ShieldAlert } from "lucide-react";

import { cn } from "../../utils/cn.js";

const errorStateVariants = cva(
	"flex w-full flex-col items-center justify-center text-center",
	{
		variants: {
			size: {
				sm: "gap-2 px-3 py-4",
				md: "gap-3 px-6 py-10",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const errorStateTitleVariants = cva("font-semibold text-foreground", {
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

const errorStateDescriptionVariants = cva("text-muted-foreground", {
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

const errorStateIconVariants = cva("shrink-0", {
	variants: {
		size: {
			sm: "size-6",
			md: "size-10",
		},
		kind: {
			error: "text-destructive",
			forbidden: "text-warning-foreground",
		},
	},
	defaultVariants: {
		size: "md",
		kind: "error",
	},
});

type ErrorStateKind = "error" | "forbidden";

interface ErrorStateProps
	extends
		Omit<ComponentProps<"div">, "title">,
		VariantProps<typeof errorStateVariants> {
	kind?: ErrorStateKind;
	title?: ReactNode;
	children?: ReactNode;
	icon?: ReactNode;
	action?: ReactNode;
}

/**
 * Failure / permission chrome distinct from EmptyState. Soft title
 * defaults by `kind`. Parent decides when to render. Pass `action` as
 * composed Button chrome (Retry vs Request access).
 */
function ErrorState({
	kind = "error",
	title,
	children,
	icon,
	action,
	size,
	className,
	...rest
}: ErrorStateProps) {
	let resolvedSize: "sm" | "md" = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	}

	let resolvedTitle: ReactNode = title;
	if (resolvedTitle === undefined || resolvedTitle === null) {
		if (kind === "forbidden") {
			resolvedTitle = "Access denied";
		} else {
			resolvedTitle = "Unable to load";
		}
	}

	const iconClass = errorStateIconVariants({
		size: resolvedSize,
		kind,
	});

	let iconNode: ReactNode = (
		<CircleAlert
			data-slot="error-state-icon"
			className={iconClass}
			aria-hidden="true"
		/>
	);
	if (kind === "forbidden") {
		iconNode = (
			<ShieldAlert
				data-slot="error-state-icon"
				className={iconClass}
				aria-hidden="true"
			/>
		);
	}
	if (icon === null) {
		iconNode = null;
	} else if (icon !== undefined) {
		iconNode = icon;
	}

	let descriptionNode: ReactNode = null;
	if (children !== undefined) {
		descriptionNode = (
			<div
				className={errorStateDescriptionVariants({
					size: resolvedSize,
				})}
			>
				{children}
			</div>
		);
	}

	let actionNode: ReactNode = null;
	if (action !== undefined) {
		actionNode = (
			<div className="mt-1 flex flex-wrap justify-center gap-2">
				{action}
			</div>
		);
	}

	const root = (
		<div
			data-slot="error-state"
			data-kind={kind}
			data-size={resolvedSize}
			role="alert"
			className={cn(
				errorStateVariants({ size: resolvedSize }),
				className,
			)}
			{...rest}
		>
			{iconNode}
			<div className="flex max-w-md flex-col items-center gap-1">
				<div
					className={errorStateTitleVariants({ size: resolvedSize })}
				>
					{resolvedTitle}
				</div>
				{descriptionNode}
			</div>
			{actionNode}
		</div>
	);

	return root;
}

export type { ErrorStateKind, ErrorStateProps };
export { ErrorState, errorStateVariants };
