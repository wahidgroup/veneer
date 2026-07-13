import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "../../utils/cn.js";

type AlertType = "info" | "success" | "warning" | "danger";

const alertVariants = cva(
	[
		"flex gap-3 rounded-md border px-3 py-2.5 text-sm",
		"bg-card [background-image:linear-gradient(var(--alert-wash),var(--alert-wash))]",
	].join(" "),
	{
		variants: {
			type: {
				info: "border-info text-info-foreground [--alert-wash:var(--info)]",
				success:
					"border-success text-success-foreground [--alert-wash:var(--success)]",
				warning:
					"border-warning text-warning-foreground [--alert-wash:var(--warning)]",
				danger: "border-destructive text-destructive-muted-foreground [--alert-wash:var(--destructive-muted)]",
			},
		},
		defaultVariants: {
			type: "info",
		},
	},
);

interface AlertProps
	extends
		Omit<ComponentProps<"div">, "title">,
		VariantProps<typeof alertVariants> {
	title?: ReactNode;
	children: ReactNode;
	icon?: ReactNode;
}

function defaultIcon(type: AlertType): ReactNode {
	const className = "mt-0.5 size-4 shrink-0";
	if (type === "success") {
		return <CircleCheck className={className} aria-hidden="true" />;
	}
	if (type === "warning") {
		return <TriangleAlert className={className} aria-hidden="true" />;
	}
	if (type === "danger") {
		return <CircleAlert className={className} aria-hidden="true" />;
	}
	return <Info className={className} aria-hidden="true" />;
}

/**
 * Static inline notice for page or panel context. Prefer Toast for ephemeral
 * feedback. `info`/`success` use `role="status"`; `warning`/`danger` use
 * `role="alert"`.
 */
function Alert({
	type,
	title,
	children,
	icon,
	className,
	...rest
}: AlertProps) {
	let resolvedType: AlertType = "info";
	if (type === "success") {
		resolvedType = "success";
	} else if (type === "warning") {
		resolvedType = "warning";
	} else if (type === "danger") {
		resolvedType = "danger";
	}

	let role: "status" | "alert" = "status";
	if (resolvedType === "warning" || resolvedType === "danger") {
		role = "alert";
	}

	let iconNode = icon;
	if (iconNode === undefined) {
		iconNode = defaultIcon(resolvedType);
	}

	let titleNode: ReactNode = null;
	if (title !== undefined) {
		titleNode = <div className="font-semibold leading-snug">{title}</div>;
	}

	return (
		<div
			data-slot="alert"
			data-type={resolvedType}
			role={role}
			className={cn(alertVariants({ type: resolvedType }), className)}
			{...rest}
		>
			{iconNode}
			<div className="min-w-0 flex-1 flex flex-col gap-0.5">
				{titleNode}
				<div className="leading-snug opacity-90">{children}</div>
			</div>
		</div>
	);
}

export type { AlertProps, AlertType };
export { Alert, alertVariants };
