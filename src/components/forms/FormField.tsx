import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { useId } from "react";

import { cn } from "../../utils/cn.js";
import { FieldError } from "./FieldError.js";
import { FieldHint } from "./FieldHint.js";
import { Label } from "./Label.js";

interface FormFieldProps extends ComponentProps<"div"> {
	label: string;
	htmlFor?: string;
	error?: string;
	hint?: string;
	required?: boolean;
	children: ReactNode;
}

/**
 * Layout for label + control + hint/error.
 */
function FormField({
	label,
	htmlFor,
	error,
	hint,
	required,
	children,
	className,
	...rest
}: FormFieldProps) {
	const autoId = useId();
	let controlId = htmlFor;
	controlId ??= autoId;

	const hintId = `${controlId}-hint`;
	const errorId = `${controlId}-error`;

	let hintNode: ReactNode = null;
	if (hint !== undefined && hint.length > 0) {
		hintNode = <FieldHint id={hintId}>{hint}</FieldHint>;
	}

	let errorNode: ReactNode = null;
	if (error !== undefined && error.length > 0) {
		errorNode = <FieldError id={errorId}>{error}</FieldError>;
	}

	return (
		<div
			data-slot="form-field"
			className={cn("flex w-full flex-col gap-1", className)}
			{...rest}
		>
			<Label htmlFor={controlId} required={required}>
				{label}
			</Label>
			{children}
			{hintNode}
			{errorNode}
		</div>
	);
}

const controlVariants = cva(
	[
		"flex w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground",
		"placeholder:text-muted-foreground shadow-sm outline-none transition-colors",
		"focus-visible:ring-2 focus-visible:ring-offset-0",
		"disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
	].join(" "),
	{
		variants: {
			invalid: {
				true: "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
				false: "border-border hover:border-input focus-visible:border-primary focus-visible:ring-ring",
			},
		},
		defaultVariants: {
			invalid: false,
		},
	},
);

export type { FormFieldProps };
export type ControlVariantProps = VariantProps<typeof controlVariants>;
export { FormField, controlVariants };
