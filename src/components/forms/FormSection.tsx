import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";

interface FormSectionProps extends ComponentProps<"section"> {
	title: string;
	description?: string;
	children: ReactNode;
}

/**
 * Groups related fields under a title. Place `FormField` children inside.
 */
function FormSection({
	title,
	description,
	children,
	className,
	...rest
}: FormSectionProps) {
	let descriptionNode: ReactNode = null;
	if (description !== undefined && description.length > 0) {
		descriptionNode = (
			<p className="text-sm text-muted-foreground">{description}</p>
		);
	}

	return (
		<section
			data-slot="form-section"
			className={cn("flex flex-col gap-4", className)}
			{...rest}
		>
			<header className="flex flex-col gap-1 border-b border-border pb-3">
				<h3 className="text-base font-semibold text-foreground">
					{title}
				</h3>
				{descriptionNode}
			</header>
			<div className="flex flex-col gap-4">{children}</div>
		</section>
	);
}

export type { FormSectionProps };
export { FormSection };
