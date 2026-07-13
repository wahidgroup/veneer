import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { usePopover } from "../../hooks/usePopover.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { Portal } from "./Portal.js";

interface ActionMenuItem {
	key: string;
	label: string;
	onSelect: () => void;
	icon?: ReactNode;
	variant?: "default" | "danger";
	disabled?: boolean;
}

interface ActionMenuDivider {
	key: string;
	type: "divider";
}

type ActionMenuEntry = ActionMenuItem | ActionMenuDivider;

interface ActionMenuProps {
	label?: string;
	items: ActionMenuEntry[];
	disabled?: boolean;
	className?: string;
}

function isDivider(entry: ActionMenuEntry): entry is ActionMenuDivider {
	return "type" in entry && entry.type === "divider";
}

function listEnabledItems(root: HTMLElement): HTMLElement[] {
	return Array.from(
		root.querySelectorAll<HTMLElement>(
			'[role="menuitem"]:not([aria-disabled="true"])',
		),
	);
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

	const { setReference, setFloating, floatingStyles } = usePopover({
		open,
		onClose: () => {
			setOpen(false);
		},
		matchTriggerWidth: false,
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		const menu = document.getElementById(menuId);
		if (menu === null) {
			return;
		}

		const enabled = listEnabledItems(menu);
		const first = enabled[0];
		if (first !== undefined) {
			first.focus();
		}
	}, [open, menuId]);

	function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const menu = event.currentTarget;
		const enabled = listEnabledItems(menu);
		if (enabled.length === 0) {
			return;
		}

		const active = document.activeElement;
		let index = enabled.findIndex((item) => {
			return item === active;
		});
		if (index < 0) {
			index = 0;
		}

		let nextIndex = index;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			nextIndex = (index + 1) % enabled.length;
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			nextIndex = (index - 1 + enabled.length) % enabled.length;
		} else if (event.key === "Home") {
			event.preventDefault();
			nextIndex = 0;
		} else if (event.key === "End") {
			event.preventDefault();
			nextIndex = enabled.length - 1;
		} else {
			return;
		}

		const next = enabled[nextIndex];
		if (next !== undefined) {
			next.focus();
		}
	}

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
						"z-dropdown min-w-44 overflow-auto rounded-lg border border-border bg-card py-1 shadow-md",
					)}
					onKeyDown={onMenuKeyDown}
				>
					{items.map((entry) => {
						if (isDivider(entry)) {
							return (
								<div
									key={entry.key}
									role="separator"
									className="my-1 border-t border-border"
								/>
							);
						}

						let itemClass =
							"flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm outline-none";
						if (entry.variant === "danger") {
							itemClass = cn(
								itemClass,
								"text-destructive hover:bg-destructive-muted focus:bg-destructive-muted",
							);
						} else {
							itemClass = cn(
								itemClass,
								"text-foreground hover:bg-accent focus:bg-accent",
							);
						}
						if (entry.disabled === true) {
							itemClass = cn(
								itemClass,
								"cursor-not-allowed opacity-50 hover:bg-transparent focus:bg-transparent",
							);
						}

						return (
							<button
								key={entry.key}
								type="button"
								role="menuitem"
								tabIndex={-1}
								disabled={entry.disabled === true}
								aria-disabled={entry.disabled === true}
								className={itemClass}
								onClick={() => {
									if (entry.disabled === true) {
										return;
									}
									entry.onSelect();
									setOpen(false);
								}}
							>
								{entry.icon}
								<span className="min-w-0 flex-1">
									{entry.label}
								</span>
							</button>
						);
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
