import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const buttonVariants = cva(
	[
		"inline-flex items-center justify-center gap-2 font-medium",
		"transition-colors duration-200 cursor-pointer",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:cursor-not-allowed",
		"rounded-[var(--button-radius,var(--radius-md))]",
	].join(" "),
	{
		variants: {
			variant: {
				filled: [
					"bg-[var(--button-bg,var(--primary))] text-[var(--button-fg,var(--primary-foreground))] shadow-sm",
					"hover:bg-[var(--button-hover-bg,color-mix(in_srgb,var(--button-bg,var(--primary))_78%,white))]",
					"focus-visible:ring-[var(--button-ring,var(--button-bg,var(--primary)))]",
					"active:bg-[var(--button-active-bg,color-mix(in_srgb,var(--button-bg,var(--primary))_78%,black))]",
					"disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
				].join(" "),
				outlined: [
					"bg-secondary border border-border text-foreground",
					"hover:bg-[var(--button-soft-bg,color-mix(in_srgb,var(--button-fg,var(--primary))_14%,transparent))] hover:border-[var(--button-border,var(--button-fg,var(--primary)))] hover:text-[var(--button-fg,var(--primary))]",
					"focus-visible:ring-[var(--button-ring,var(--button-fg,var(--primary)))]",
					"active:bg-[var(--button-soft-bg,color-mix(in_srgb,var(--button-fg,var(--primary))_20%,transparent))]",
					"disabled:bg-secondary disabled:border-input disabled:text-muted-foreground",
				].join(" "),
				text: [
					"bg-transparent text-foreground",
					"hover:bg-[var(--button-soft-bg,color-mix(in_srgb,var(--button-fg,var(--primary))_14%,transparent))] hover:text-[var(--button-fg,var(--primary))]",
					"focus-visible:ring-[var(--button-ring,var(--button-fg,var(--primary)))]",
					"active:bg-[var(--button-soft-bg,color-mix(in_srgb,var(--button-fg,var(--primary))_20%,transparent))]",
					"disabled:bg-transparent disabled:text-muted-foreground",
				].join(" "),
				ghost: [
					"bg-transparent text-muted-foreground",
					"hover:bg-accent hover:text-foreground",
					"focus-visible:ring-ring",
					"active:bg-accent",
					"disabled:bg-transparent disabled:text-muted-foreground",
				].join(" "),
				secondary: [
					"bg-secondary text-secondary-foreground",
					"hover:bg-muted",
					"focus-visible:ring-ring",
					"active:bg-accent",
					"disabled:bg-muted disabled:text-muted-foreground",
				].join(" "),
				danger: [
					"bg-secondary border border-destructive/30 text-destructive",
					"hover:bg-destructive-muted hover:border-destructive/50",
					"focus-visible:ring-destructive",
					"active:bg-destructive-muted",
					"disabled:bg-muted disabled:border-input disabled:text-muted-foreground",
				].join(" "),
			},
			size: {
				md: [
					"h-[var(--button-height,2.5rem)] px-[var(--button-px,1.25rem)] py-0",
					"text-[length:var(--button-fz,0.875rem)]",
				].join(" "),
				sm: [
					"h-[var(--button-height,2rem)] px-[var(--button-px,0.75rem)] py-0",
					"text-[length:var(--button-fz,0.75rem)]",
				].join(" "),
				icon: [
					"size-[var(--button-height,2rem)] shrink-0 p-0",
					"text-[length:var(--button-fz,1rem)]",
				].join(" "),
			},
		},
		compoundVariants: [
			{
				variant: "danger",
				size: "md",
				class: "px-[var(--button-px,0.75rem)]",
			},
			{
				variant: "danger",
				size: "icon",
				class: [
					"border-0 bg-transparent shadow-none",
					"hover:bg-destructive-muted hover:border-transparent",
				].join(" "),
			},
		],
		defaultVariants: {
			variant: "filled",
			size: "md",
		},
	},
);

interface ButtonProps
	extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

/**
 * Button control with CVA variants / sizes. Defaults to `type="button"`.
 * Skin via `--button-*` CSS vars on the element (see `buttonVariants`).
 */
function Button({
	children,
	variant,
	size,
	type,
	className,
	disabled,
	...rest
}: ButtonProps) {
	let resolvedType = type;
	resolvedType ??= "button";

	let resolvedDisabled = disabled;
	resolvedDisabled ??= false;

	return (
		<button
			data-slot="button"
			type={resolvedType}
			className={cn(buttonVariants({ variant, size }), className)}
			disabled={resolvedDisabled}
			{...rest}
		>
			{children}
		</button>
	);
}

export type { ButtonProps };
export { Button, buttonVariants };
