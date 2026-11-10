import type { ComponentProps, ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface ChipGroupItem {
	id: string;
	label: string;
	pressed?: boolean;
	disabled?: boolean;
	dismissible?: boolean;
}

interface ChipGroupProps extends Omit<ComponentProps<"div">, "children" | "role"> {
	items: ChipGroupItem[];
	onPressedChange: (id: string, pressed: boolean) => void;
	onDismiss?: (id: string) => void;
	onClearAll?: () => void;
}

/**
 * Multi-select filter chips. Toggle buttons use `aria-pressed` inside
 * `role="group"`. Provide `aria-label` or `aria-labelledby`. Dismissible
 * chips need `onDismiss` to show the remove control.
 */
function ChipGroup({ items, onPressedChange, onDismiss, onClearAll, className, ...rest }: ChipGroupProps) {
	let clearNode: ReactNode = null;
	if (onClearAll !== undefined) {
		clearNode = (
			<Button type="button" variant="ghost" size="sm" data-slot="chip-group-clear" onClick={onClearAll}>
				Clear all
			</Button>
		);
	}

	return (
		<div
			data-slot="chip-group"
			role="group"
			className={cn("flex flex-wrap items-center gap-2", className)}
			{...rest}
		>
			{items.map((item) => {
				let pressed = item.pressed;
				pressed ??= false;

				let disabled = item.disabled;
				disabled ??= false;

				let chipClass = "inline-flex items-center rounded-md border border-border";
				if (pressed) {
					chipClass = cn(chipClass, "bg-accent/60");
				} else {
					chipClass = cn(chipClass, "bg-transparent");
				}

				let dismissNode: ReactNode = null;
				if (item.dismissible === true && onDismiss !== undefined) {
					dismissNode = (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							disabled={disabled}
							data-slot="chip-group-dismiss"
							aria-label={`Remove ${item.label}`}
							className="size-6 shrink-0 text-muted-foreground"
							onClick={() => {
								onDismiss(item.id);
							}}
						>
							<X className="size-3.5" aria-hidden="true" />
						</Button>
					);
				}

				return (
					<div
						key={item.id}
						data-slot="chip-group-item"
						data-pressed={pressed}
						data-disabled={disabled}
						className={chipClass}
					>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={disabled}
							aria-pressed={pressed}
							className="h-auto rounded-md border-0 px-2.5 py-1 text-xs"
							onClick={() => {
								onPressedChange(item.id, !pressed);
							}}
						>
							{item.label}
						</Button>
						{dismissNode}
					</div>
				);
			})}
			{clearNode}
		</div>
	);
}

export type { ChipGroupItem, ChipGroupProps };
export { ChipGroup };
