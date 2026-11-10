import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
	label: string;
	description?: string;
}

/**
 * Labeled checkbox. `label` is required for an accessible name.
 */
function Checkbox({ label, description, className, id, disabled, ...rest }: CheckboxProps) {
	let descriptionNode: ReactNode = null;
	if (description !== undefined && description.length > 0) {
		descriptionNode = <span className="text-sm text-muted-foreground">{description}</span>;
	}

	let labelClass = "flex w-full cursor-pointer items-start gap-2";
	if (disabled === true) {
		labelClass = cn(labelClass, "cursor-not-allowed opacity-50");
	}

	return (
		<label data-slot="checkbox" htmlFor={id} className={cn(labelClass, className)}>
			<input
				id={id}
				type="checkbox"
				disabled={disabled}
				className={cn(
					"mt-0.5 size-4 shrink-0 cursor-pointer rounded border border-input",
					"accent-primary focus-visible:ring-2 focus-visible:ring-ring",
					"disabled:cursor-not-allowed",
				)}
				{...rest}
			/>
			<span className="flex min-w-0 flex-1 flex-col">
				<span className="text-sm font-medium text-foreground">{label}</span>
				{descriptionNode}
			</span>
		</label>
	);
}

export type { CheckboxProps };
export { Checkbox };
