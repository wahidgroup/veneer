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
	].join(" "),
	{
		variants: {
			variant: {
				filled: [
					"bg-primary text-primary-foreground shadow-sm",
					"hover:bg-primary-light",
					"focus-visible:ring-primary",
					"active:bg-primary-dark",
					"disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
				].join(" "),
				outlined: [
					"bg-secondary border border-border text-foreground",
					"hover:bg-primary-bg hover:border-primary hover:text-primary",
					"focus-visible:ring-primary",
					"active:bg-primary-bg",
					"disabled:bg-secondary disabled:border-input disabled:text-muted-foreground",
				].join(" "),
				text: [
					"bg-transparent text-foreground",
					"hover:bg-primary-bg hover:text-primary",
					"focus-visible:ring-primary",
					"active:bg-primary-bg",
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
				md: "rounded-md px-5 py-2.5 text-sm",
				sm: "rounded-md px-3 py-1.5 text-xs",
				icon: "size-8 shrink-0 rounded-md p-0",
			},
		},
		compoundVariants: [
			{
				variant: "danger",
				size: "md",
				class: "px-3 py-1.5 text-sm",
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
 * Button with CVA variants and sizes.
 * Defaults to `type="button"` to avoid accidental submits.
 * Use `size="icon"` with `variant="ghost"` for chrome controls (close, clear).
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
