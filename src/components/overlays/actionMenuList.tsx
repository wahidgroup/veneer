import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

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

function isActionMenuDivider(
	entry: ActionMenuEntry,
): entry is ActionMenuDivider {
	return "type" in entry && entry.type === "divider";
}

function listEnabledMenuItems(root: HTMLElement): HTMLElement[] {
	return Array.from(
		root.querySelectorAll<HTMLElement>(
			'[role="menuitem"]:not([aria-disabled="true"])',
		),
	);
}

function onActionMenuKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
	const menu = event.currentTarget;
	const enabled = listEnabledMenuItems(menu);
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

function focusFirstMenuItem(menuId: string): void {
	const menu = document.getElementById(menuId);
	if (menu === null) {
		return;
	}

	const enabled = listEnabledMenuItems(menu);
	const first = enabled[0];
	if (first !== undefined) {
		first.focus();
	}
}

interface RenderActionMenuEntriesOptions {
	items: ActionMenuEntry[];
	onItemSelect: (entry: ActionMenuItem) => void;
}

/**
 * Shared APG menu item list for ActionMenu and ContextMenu panels.
 */
function renderActionMenuEntries({
	items,
	onItemSelect,
}: RenderActionMenuEntriesOptions): ReactNode {
	return items.map((entry) => {
		if (isActionMenuDivider(entry)) {
			return (
				<div
					key={entry.key}
					role="separator"
					className="my-1 border-t border-border"
				/>
			);
		}

		let itemClass =
			"h-auto w-full justify-start rounded-none px-3 py-2 text-sm";
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
				"opacity-50 hover:bg-transparent focus:bg-transparent",
			);
		}

		return (
			<Button
				key={entry.key}
				type="button"
				variant="ghost"
				role="menuitem"
				tabIndex={-1}
				disabled={entry.disabled === true}
				aria-disabled={entry.disabled === true}
				className={itemClass}
				onClick={() => {
					if (entry.disabled === true) {
						return;
					}
					onItemSelect(entry);
				}}
			>
				{entry.icon}
				<span className="min-w-0 flex-1 text-left">{entry.label}</span>
			</Button>
		);
	});
}

export type { ActionMenuDivider, ActionMenuEntry, ActionMenuItem };
export {
	focusFirstMenuItem,
	isActionMenuDivider,
	listEnabledMenuItems,
	onActionMenuKeyDown,
	renderActionMenuEntries,
};
