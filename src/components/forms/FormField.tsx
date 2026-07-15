import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement, useId } from "react";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

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

interface FormFieldControlProps {
	id?: string;
	invalid?: boolean;
	"aria-describedby"?: string;
}

function isFormFieldControlElement(
	node: ReactNode,
): node is ReactElement<FormFieldControlProps> {
	return isValidElement(node);
}

/**
 * Layout for label + control + hint/error. Injects `id`,
 * `aria-describedby`, and `invalid` onto a single element child.
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

	const describedParts: string[] = [];
	if (hint !== undefined && hint.length > 0) {
		describedParts.push(hintId);
	}
	if (error !== undefined && error.length > 0) {
		describedParts.push(errorId);
	}

	let fieldDescribedBy: string | undefined;
	if (describedParts.length > 0) {
		fieldDescribedBy = describedParts.join(" ");
	}

	let hintNode: ReactNode = null;
	if (hint !== undefined && hint.length > 0) {
		hintNode = <FieldHint id={hintId}>{hint}</FieldHint>;
	}

	let errorNode: ReactNode = null;
	if (error !== undefined && error.length > 0) {
		errorNode = <FieldError id={errorId}>{error}</FieldError>;
	}

	let control: ReactNode = children;
	if (isFormFieldControlElement(children)) {
		const existingDescribedBy = children.props["aria-describedby"];

		let mergedDescribedBy = fieldDescribedBy;
		if (
			existingDescribedBy !== undefined &&
			existingDescribedBy.length > 0
		) {
			if (fieldDescribedBy !== undefined) {
				mergedDescribedBy = `${existingDescribedBy} ${fieldDescribedBy}`;
			} else {
				mergedDescribedBy = existingDescribedBy;
			}
		}

		let nextId = children.props.id;
		nextId ??= controlId;

		let nextInvalid = children.props.invalid;
		if (error !== undefined && error.length > 0) {
			nextInvalid = true;
		}

		control = cloneElement(children, {
			id: nextId,
			"aria-describedby": mergedDescribedBy,
			invalid: nextInvalid,
		});
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
			{control}
			{hintNode}
			{errorNode}
		</div>
	);
}

const controlVariants = cva(
	[
		"flex w-full rounded-md border bg-secondary px-4 py-3 text-sm text-foreground",
		"placeholder:text-muted-foreground outline-none transition-colors",
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
