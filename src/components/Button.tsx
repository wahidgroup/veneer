import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cva } from "class-variance-authority";

import { cn } from "../utils/cn.js";

const buttonVariants = cva(
	[
		"inline-flex items-center justify-center gap-2 font-medium",
		"transition-colors duration-200 cursor-pointer",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
		"disabled:cursor-not-allowed",
	].join(" "),
	{
		variants: {
			variant: {
				filled: [
					"rounded-full px-5 py-2.5 text-sm",
					"bg-primary text-primary-foreground shadow-sm",
					"hover:bg-primary-light",
					"focus-visible:ring-primary",
					"active:bg-primary-dark",
					"disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none",
				].join(" "),
				outlined: [
					"rounded-full px-5 py-2.5 text-sm",
					"bg-secondary border border-input text-primary",
					"hover:bg-primary-bg hover:border-primary",
					"focus-visible:ring-primary",
					"active:bg-primary-bg",
					"disabled:bg-secondary disabled:border-input disabled:text-muted-foreground",
				].join(" "),
				text: [
					"rounded-full px-5 py-2.5 text-sm",
					"bg-transparent text-primary",
					"hover:bg-primary-bg",
					"focus-visible:ring-primary",
					"active:bg-primary-bg",
					"disabled:bg-transparent disabled:text-muted-foreground",
				].join(" "),
				secondary: [
					"rounded-full px-5 py-2.5 text-sm",
					"bg-secondary text-secondary-foreground",
					"hover:bg-muted",
					"focus-visible:ring-ring",
					"active:bg-accent",
					"disabled:bg-muted disabled:text-muted-foreground",
				].join(" "),
				danger: [
					"rounded-md px-3 py-1.5 text-sm",
					"bg-secondary border border-destructive/30 text-destructive shadow-sm",
					"hover:bg-destructive-muted hover:border-destructive/50",
					"focus-visible:ring-destructive",
					"active:bg-destructive-muted",
					"disabled:bg-muted disabled:border-input disabled:text-muted-foreground",
				].join(" "),
			},
		},
		defaultVariants: {
			variant: "filled",
		},
	},
);

interface ButtonProps
	extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

/**
 * Button with CVA variants. Defaults to `type="button"` to avoid accidental submits.
 */
function Button({
	children,
	variant,
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
			className={cn(buttonVariants({ variant }), className)}
			disabled={resolvedDisabled}
			{...rest}
		>
			{children}
		</button>
	);
}

export type { ButtonProps };
export { Button, buttonVariants };
