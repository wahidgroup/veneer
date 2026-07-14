import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const descriptionListVariants = cva("grid gap-x-6 gap-y-3", {
	variants: {
		columns: {
			1: "grid-cols-1",
			2: "sm:grid-cols-2",
		},
	},
	defaultVariants: {
		columns: 1,
	},
});

interface DescriptionListItem {
	term: ReactNode;
	description: ReactNode;
}

interface DescriptionListProps
	extends
		Omit<ComponentProps<"dl">, "children">,
		VariantProps<typeof descriptionListVariants> {
	items: DescriptionListItem[];
}

/**
 * Resource attribute key/value list (`dl` / `dt` / `dd`). Use for stack
 * details and inventory side panels.
 */
function DescriptionList({
	items,
	columns,
	className,
	...rest
}: DescriptionListProps) {
	let resolvedColumns: 1 | 2 = 1;
	if (columns === 2) {
		resolvedColumns = 2;
	}

	return (
		<dl
			data-slot="description-list"
			data-columns={String(resolvedColumns)}
			className={cn(
				descriptionListVariants({ columns: resolvedColumns }),
				className,
			)}
			{...rest}
		>
			{items.map((item, index) => {
				const key = `desc-${String(index)}`;
				return (
					<div
						key={key}
						data-slot="description-list-item"
						className="min-w-0"
					>
						<dt className="text-xs font-medium text-muted-foreground">
							{item.term}
						</dt>
						<dd className="mt-0.5 text-sm text-foreground break-words">
							{item.description}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}

export type { DescriptionListItem, DescriptionListProps };
export { DescriptionList, descriptionListVariants };
