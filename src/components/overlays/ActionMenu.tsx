import type { ReactNode } from "react";
import { useId, useLayoutEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import type {
	ActionMenuDivider,
	ActionMenuEntry,
	ActionMenuItem,
} from "./actionMenuList.js";
import { usePopover } from "../../hooks/usePopover.js";
import { DISMISS_LAYER_TIER_CLASS } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { Portal } from "./Portal.js";
import {
	focusFirstMenuItem,
	onActionMenuKeyDown,
	renderActionMenuEntries,
} from "./actionMenuList.js";

interface ActionMenuProps {
	label?: string;
	items: ActionMenuEntry[];
	disabled?: boolean;
	className?: string;
}

/**
 * Portaled action dropdown for row/chrome menus. Arrow keys move; Esc closes.
 */
function ActionMenu({ label, items, disabled, className }: ActionMenuProps) {
	let triggerLabel = label;
	triggerLabel ??= "Actions";

	let isDisabled = disabled;
	isDisabled ??= false;

	const menuId = useId();
	const [open, setOpen] = useState(false);

	const { setReference, setFloating, floatingStyles, focusable } = usePopover(
		{
			open,
			onClose: () => {
				setOpen(false);
			},
			matchTriggerWidth: false,
		},
	);

	useLayoutEffect(() => {
		if (!focusable) {
			return;
		}

		focusFirstMenuItem(menuId);
	}, [focusable, menuId]);

	let menuNode: ReactNode = null;
	if (open) {
		menuNode = (
			<Portal>
				<div
					ref={setFloating}
					id={menuId}
					role="menu"
					data-slot="action-menu-panel"
					tabIndex={-1}
					style={floatingStyles}
					className={cn(
						DISMISS_LAYER_TIER_CLASS,
						"min-w-44 overflow-auto rounded-md border border-border bg-card py-1 shadow-md",
					)}
					onKeyDown={onActionMenuKeyDown}
				>
					{renderActionMenuEntries({
						items,
						onItemSelect: (entry) => {
							entry.onSelect();
							setOpen(false);
						},
					})}
				</div>
			</Portal>
		);
	}

	return (
		<div
			data-slot="action-menu"
			className={cn("relative inline-flex", className)}
		>
			<span ref={setReference} className="inline-flex">
				<Button
					variant="outlined"
					size="sm"
					disabled={isDisabled}
					aria-haspopup="menu"
					aria-expanded={open}
					aria-controls={menuId}
					onClick={() => {
						if (isDisabled) {
							return;
						}
						setOpen(!open);
					}}
				>
					{triggerLabel}
					<ChevronDown className="size-4" aria-hidden="true" />
				</Button>
			</span>
			{menuNode}
		</div>
	);
}

export type {
	ActionMenuProps,
	ActionMenuItem,
	ActionMenuDivider,
	ActionMenuEntry,
};
export { ActionMenu };
