import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { controlVariants } from "./FormField.js";

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectProps extends ComponentProps<"select"> {
	options: SelectOption[];
	invalid?: boolean;
	placeholder?: string;
}

/**
 * Native select with chevron affordance. Pass flat `options`; use `invalid` with FieldError.
 */
function Select({
	className,
	invalid,
	options,
	placeholder,
	children,
	...rest
}: SelectProps) {
	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let placeholderNode: ReactNode = null;
	if (placeholder !== undefined && placeholder.length > 0) {
		placeholderNode = (
			<option value="" disabled>
				{placeholder}
			</option>
		);
	}

	return (
		<div className="relative w-full">
			<select
				data-slot="select"
				aria-invalid={resolvedInvalid}
				className={cn(
					controlVariants({ invalid: resolvedInvalid }),
					"cursor-pointer appearance-none pr-10",
					className,
				)}
				{...rest}
			>
				{placeholderNode}
				{options.map((option) => {
					return (
						<option
							key={option.value}
							value={option.value}
							disabled={option.disabled}
						>
							{option.label}
						</option>
					);
				})}
				{children}
			</select>
			<ChevronDown
				className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
		</div>
	);
}

export type { SelectOption, SelectProps };
export { Select };
