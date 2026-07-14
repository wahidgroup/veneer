import type { KeyboardEvent, ReactNode } from "react";
import { useId, useState } from "react";

import { cn } from "../../utils/cn.js";
import { Input } from "../forms/Input.js";
import { Modal } from "./Modal.js";

interface CommandPaletteItem {
	id: string;
	label: string;
	group?: string;
	keywords?: string[];
	disabled?: boolean;
}

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	items: CommandPaletteItem[];
	onSelect: (item: CommandPaletteItem) => void;
	placeholder?: string;
	title?: string;
	emptyText?: string;
	className?: string;
}

function filterPaletteItems(
	items: CommandPaletteItem[],
	query: string,
): CommandPaletteItem[] {
	const normalized = query.trim().toLowerCase();
	if (normalized.length === 0) {
		return items;
	}

	return items.filter((item) => {
		if (item.label.toLowerCase().includes(normalized)) {
			return true;
		}
		if (item.id.toLowerCase().includes(normalized)) {
			return true;
		}
		if (item.group?.toLowerCase().includes(normalized) === true) {
			return true;
		}
		if (item.keywords === undefined) {
			return false;
		}

		for (const keyword of item.keywords) {
			if (keyword.toLowerCase().includes(normalized)) {
				return true;
			}
		}

		return false;
	});
}

/**
 * Modal command / jump palette. App owns global shortcut (Cmd/K). Filter is
 * local over `items`; selection closes via `onSelect` + `onOpenChange(false)`.
 */
function CommandPalette({
	open,
	onOpenChange,
	items,
	onSelect,
	placeholder,
	title,
	emptyText,
	className,
}: CommandPaletteProps) {
	let resolvedPlaceholder = placeholder;
	resolvedPlaceholder ??= "Type a command...";

	let resolvedTitle = title;
	resolvedTitle ??= "Command palette";

	let resolvedEmpty = emptyText;
	resolvedEmpty ??= "No matching commands";

	const listboxId = useId();
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);

	const visible = filterPaletteItems(items, query);

	let safeIndex = 0;
	if (visible.length > 0) {
		safeIndex = activeIndex % visible.length;
		if (safeIndex < 0) {
			safeIndex = 0;
		}
	}

	function selectIndex(index: number) {
		const item = visible[index];
		if (item === undefined || item.disabled === true) {
			return;
		}

		onSelect(item);
		onOpenChange(false);
		setQuery("");
		setActiveIndex(0);
	}

	function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault();

			if (visible.length === 0) {
				return;
			}

			setActiveIndex((current) => {
				return (current + 1) % visible.length;
			});

			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();

			if (visible.length === 0) {
				return;
			}

			setActiveIndex((current) => {
				return (current - 1 + visible.length) % visible.length;
			});
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			selectIndex(safeIndex);
		}
	}

	let activeDescendant: string | undefined;
	if (visible[safeIndex] !== undefined) {
		activeDescendant = `${listboxId}-option-${safeIndex}`;
	}

	let listBody: ReactNode;
	if (visible.length === 0) {
		listBody = (
			<div className="px-3 py-6 text-center text-sm text-muted-foreground">
				{resolvedEmpty}
			</div>
		);
	} else {
		listBody = (
			<ul
				id={listboxId}
				role="listbox"
				aria-label="Commands"
				className="max-h-72 overflow-y-auto py-1"
			>
				{visible.map((item, index) => {
					let optionClass =
						"flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none";
					if (index === safeIndex) {
						optionClass = cn(
							optionClass,
							"bg-accent text-accent-foreground",
						);
					} else {
						optionClass = cn(
							optionClass,
							"text-foreground hover:bg-accent/60",
						);
					}
					if (item.disabled === true) {
						optionClass = cn(
							optionClass,
							"pointer-events-none opacity-50",
						);
					}

					let groupNode: ReactNode = null;
					if (item.group !== undefined && item.group.length > 0) {
						groupNode = (
							<span className="ml-auto text-xs text-muted-foreground">
								{item.group}
							</span>
						);
					}

					let isSelected = false;
					if (index === safeIndex) {
						isSelected = true;
					}

					let isDisabled = false;
					if (item.disabled === true) {
						isDisabled = true;
					}

					return (
						<li
							key={item.id}
							id={`${listboxId}-option-${index}`}
							role="option"
							aria-selected={isSelected}
							aria-disabled={isDisabled}
							className={optionClass}
							onMouseEnter={() => {
								setActiveIndex(index);
							}}
							onClick={() => {
								selectIndex(index);
							}}
							onKeyDown={(event) => {
								if (
									event.key === "Enter" ||
									event.key === " "
								) {
									event.preventDefault();
									selectIndex(index);
								}
							}}
						>
							<span className="truncate">{item.label}</span>
							{groupNode}
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<Modal
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) {
					setQuery("");
					setActiveIndex(0);
				}
			}}
			title={resolvedTitle}
			className={cn("max-w-lg p-0", className)}
			showCloseButton={false}
		>
			<div
				data-slot="command-palette"
				className="-mx-5 -my-4 flex flex-col"
			>
				<div className="border-b border-border px-3 py-2">
					<Input
						role="combobox"
						aria-expanded={true}
						aria-controls={listboxId}
						aria-autocomplete="list"
						aria-activedescendant={activeDescendant}
						aria-label="Filter commands"
						placeholder={resolvedPlaceholder}
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setActiveIndex(0);
						}}
						onKeyDown={onInputKeyDown}
					/>
				</div>
				{listBody}
			</div>
		</Modal>
	);
}

export type { CommandPaletteItem, CommandPaletteProps };
export { CommandPalette, filterPaletteItems };
