import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useId, useLayoutEffect, useState } from "react";

import { usePopover } from "../../hooks/usePopover.js";
import { DISMISS_LAYER_TIER_CLASS } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { Portal } from "../overlays/Portal.js";

interface ToolbarSelectOption {
	value: string;
	label: string;
	description?: ReactNode;
	disabled?: boolean;
}

interface ToolbarSelectProps {
	options: ToolbarSelectOption[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	"aria-label": string;
	className?: string;
}

function listEnabledOptions(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'));
}

function findOptionLabel(options: ToolbarSelectOption[], value: string): string | undefined {
	for (const option of options) {
		if (option.value === value) {
			return option.label;
		}
	}

	return undefined;
}

/**
 * Shell-chrome single-select. Ghost Button trigger + portaled listbox.
 * Compose in TopNav for account/region pickers; long searchable lists stay Combobox.
 */
function ToolbarSelect({
	options,
	value,
	defaultValue,
	onChange,
	placeholder,
	disabled,
	"aria-label": ariaLabel,
	className,
}: ToolbarSelectProps) {
	let isDisabled = disabled;
	isDisabled ??= false;

	let resolvedPlaceholder = placeholder;
	resolvedPlaceholder ??= "Select";

	const listboxId = useId();
	const [open, setOpen] = useState(false);
	const [uncontrolledValue, setUncontrolledValue] = useState(() => {
		let initial = defaultValue;
		initial ??= "";
		return initial;
	});

	const isControlled = value !== undefined;
	let currentValue = uncontrolledValue;
	if (isControlled) {
		currentValue = value;
	}

	const { setReference, setFloating, floatingStyles, focusable } = usePopover({
		open,
		onClose: () => {
			setOpen(false);
		},
		matchTriggerWidth: false,
	});

	useLayoutEffect(() => {
		if (!focusable) {
			return;
		}

		const listbox = document.getElementById(listboxId);
		if (listbox === null) {
			return;
		}

		const enabled = listEnabledOptions(listbox);
		if (enabled.length === 0) {
			return;
		}

		let focusTarget = enabled[0];
		if (currentValue.length > 0) {
			for (const optionEl of enabled) {
				if (optionEl.dataset.value === currentValue) {
					focusTarget = optionEl;
					break;
				}
			}
		}

		if (focusTarget !== undefined) {
			focusTarget.focus();
		}
	}, [focusable, listboxId, currentValue]);

	function commitValue(next: string) {
		if (!isControlled) {
			setUncontrolledValue(next);
		}
		if (onChange !== undefined) {
			onChange(next);
		}
		setOpen(false);
	}

	function onListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const listbox = event.currentTarget;
		const enabled = listEnabledOptions(listbox);
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

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();

			const activeOption = enabled[index];
			if (activeOption === undefined) {
				return;
			}

			const nextValue = activeOption.dataset.value;
			if (nextValue === undefined) {
				return;
			}

			commitValue(nextValue);
			return;
		}

		let nextIndex: number;
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

	let triggerLabel = resolvedPlaceholder;
	if (currentValue.length > 0) {
		const matched = findOptionLabel(options, currentValue);
		if (matched !== undefined) {
			triggerLabel = matched;
		} else {
			triggerLabel = currentValue;
		}
	}

	const triggerAriaLabel = `${ariaLabel}: ${triggerLabel}`;

	let listNode: ReactNode = null;
	if (open) {
		listNode = (
			<Portal>
				<div
					ref={setFloating}
					id={listboxId}
					role="listbox"
					data-slot="toolbar-select-listbox"
					tabIndex={-1}
					aria-label={ariaLabel}
					style={floatingStyles}
					className={cn(
						DISMISS_LAYER_TIER_CLASS,
						"max-h-72 min-w-44 overflow-auto rounded-md border border-border bg-card py-1 shadow-md",
					)}
					onKeyDown={onListboxKeyDown}
				>
					{options.map((option) => {
						const selected = option.value === currentValue;
						const optionDisabled = option.disabled === true;

						let optionClass =
							"flex h-auto w-full flex-col items-stretch gap-0.5 rounded-none px-3 py-2 text-left";
						if (optionDisabled) {
							optionClass = cn(optionClass, "opacity-50");
						} else {
							optionClass = cn(optionClass, "text-foreground hover:bg-accent focus:bg-accent");
						}
						if (selected) {
							optionClass = cn(optionClass, "bg-accent/60");
						}

						let descriptionNode: ReactNode = null;
						if (option.description !== undefined) {
							descriptionNode = (
								<span className="text-xs text-muted-foreground">{option.description}</span>
							);
						}

						return (
							<Button
								key={option.value}
								type="button"
								variant="ghost"
								role="option"
								tabIndex={-1}
								data-value={option.value}
								disabled={optionDisabled}
								aria-disabled={optionDisabled}
								aria-selected={selected}
								className={optionClass}
								onClick={() => {
									if (optionDisabled) {
										return;
									}
									commitValue(option.value);
								}}
							>
								<span className="text-sm font-medium">{option.label}</span>
								{descriptionNode}
							</Button>
						);
					})}
				</div>
			</Portal>
		);
	}

	return (
		<div data-slot="toolbar-select" className={cn("relative inline-flex", className)}>
			<span ref={setReference} className="inline-flex">
				<Button
					variant="ghost"
					size="sm"
					disabled={isDisabled}
					aria-label={triggerAriaLabel}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={listboxId}
					onClick={() => {
						if (isDisabled) {
							return;
						}
						setOpen(!open);
					}}
				>
					<span className="max-w-40 truncate">{triggerLabel}</span>
					<ChevronDown className="size-4 shrink-0" aria-hidden="true" />
				</Button>
			</span>
			{listNode}
		</div>
	);
}

export type { ToolbarSelectOption, ToolbarSelectProps };
export { ToolbarSelect };
