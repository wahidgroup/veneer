import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { usePopover } from "../../hooks/usePopover.js";
import { cn } from "../../utils/cn.js";
import { Loading } from "../feedback/Loading.js";
import { Badge } from "../indicators/Badge.js";
import { Portal } from "../overlays/Portal.js";
import { Button } from "./Button.js";
import { controlVariants } from "./FormField.js";

interface ComboboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface ComboboxBaseProps extends Omit<
	ComponentProps<"div">,
	"onChange" | "defaultValue"
> {
	options: ComboboxOption[];
	id?: string;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	searchable?: boolean;
	loading?: boolean;
	noOptionsText?: string;
	searchPlaceholder?: string;
	onSearchChange?: (query: string) => void;
}

interface ComboboxSingleProps extends ComboboxBaseProps {
	multiple?: false;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

interface ComboboxMultiProps extends ComboboxBaseProps {
	multiple: true;
	value?: string[];
	defaultValue?: string[];
	onChange?: (values: string[]) => void;
}

type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps;

function findLabel(
	options: ComboboxOption[],
	value: string | undefined,
): string {
	if (value === undefined || value.length === 0) {
		return "";
	}

	for (const option of options) {
		if (option.value === value) {
			return option.label;
		}
	}

	return "";
}

function filterOptions(
	options: ComboboxOption[],
	query: string,
	searchable: boolean,
): ComboboxOption[] {
	if (!searchable) {
		return options;
	}

	const normalized = query.trim().toLowerCase();
	if (normalized.length === 0) {
		return options;
	}

	return options.filter((option) => {
		return option.label.toLowerCase().includes(normalized);
	});
}

/**
 * Searchable listbox for large option sets. Use `multiple` for chip multi-select.
 * Pair with `FormField` via matching `id` / `htmlFor`.
 */
function Combobox(props: ComboboxProps) {
	const {
		options,
		id,
		disabled,
		invalid,
		placeholder,
		searchable,
		loading,
		noOptionsText,
		searchPlaceholder,
		onSearchChange,
		className,
		multiple,
		value: _value,
		defaultValue: _defaultValue,
		onChange: _onChange,
		...rest
	} = props;

	void _value;
	void _defaultValue;
	void _onChange;

	let isSearchable = searchable;
	isSearchable ??= true;

	let resolvedInvalid = invalid;
	resolvedInvalid ??= false;

	let resolvedPlaceholder = placeholder;
	resolvedPlaceholder ??= "Select...";

	let resolvedNoOptions = noOptionsText;
	resolvedNoOptions ??= "No options";

	let resolvedSearchPlaceholder = searchPlaceholder;
	resolvedSearchPlaceholder ??= "Search...";

	const listboxId = useId();
	const autoId = useId();
	let controlId = id;
	controlId ??= autoId;

	const isMulti = multiple === true;

	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);

	const [uncontrolledSingle, setUncontrolledSingle] = useState(() => {
		if (props.multiple !== true && typeof props.defaultValue === "string") {
			return props.defaultValue;
		}

		return "";
	});

	const [uncontrolledMulti, setUncontrolledMulti] = useState<string[]>(() => {
		if (props.multiple === true && Array.isArray(props.defaultValue)) {
			return props.defaultValue;
		}

		const empty: string[] = [];
		return empty;
	});

	let selectedSingle = uncontrolledSingle;
	if (props.multiple !== true && typeof props.value === "string") {
		selectedSingle = props.value;
	}

	let selectedMulti = uncontrolledMulti;
	if (props.multiple === true && Array.isArray(props.value)) {
		selectedMulti = props.value;
	}

	const close = () => {
		setOpen(false);
		setQuery("");
		setActiveIndex(0);
	};

	const { setReference, setFloating, floatingStyles } = usePopover({
		open,
		onClose: close,
		matchTriggerWidth: true,
	});

	const visibleOptions = useMemo(() => {
		return filterOptions(options, query, isSearchable);
	}, [options, query, isSearchable]);

	const selectedLabel = findLabel(options, selectedSingle);

	let inputDisplay = query;
	if (!open && !isMulti) {
		inputDisplay = selectedLabel;
	}

	let inputPlaceholder = resolvedPlaceholder;
	if (open && isSearchable) {
		inputPlaceholder = resolvedSearchPlaceholder;
	}

	function commitSingle(next: string) {
		if (props.multiple === true) {
			return;
		}
		if (props.value === undefined) {
			setUncontrolledSingle(next);
		}
		if (props.onChange !== undefined) {
			props.onChange(next);
		}

		close();
	}

	function commitMulti(next: string[]) {
		if (props.multiple !== true) {
			return;
		}
		if (props.value === undefined) {
			setUncontrolledMulti(next);
		}
		if (props.onChange !== undefined) {
			props.onChange(next);
		}
	}

	function toggleMulti(optionValue: string) {
		const exists = selectedMulti.includes(optionValue);
		let next: string[];
		if (exists) {
			next = selectedMulti.filter((item) => {
				return item !== optionValue;
			});
		} else {
			next = [...selectedMulti, optionValue];
		}

		commitMulti(next);
		setQuery("");
		setActiveIndex(0);
	}

	function selectOption(option: ComboboxOption) {
		if (option.disabled === true || disabled === true) {
			return;
		}

		if (isMulti) {
			toggleMulti(option.value);
			return;
		}

		commitSingle(option.value);
	}

	function openList() {
		if (disabled === true) {
			return;
		}

		setOpen(true);
		setActiveIndex(0);
	}

	function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (disabled === true) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();

			if (!open) {
				openList();
				return;
			}

			setActiveIndex((current) => {
				if (visibleOptions.length === 0) {
					return 0;
				}

				return (current + 1) % visibleOptions.length;
			});

			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();

			if (!open) {
				openList();
				return;
			}

			setActiveIndex((current) => {
				if (visibleOptions.length === 0) {
					return 0;
				}

				return (
					(current - 1 + visibleOptions.length) %
					visibleOptions.length
				);
			});

			return;
		}

		if (event.key === "Enter") {
			if (!open) {
				return;
			}

			event.preventDefault();

			const option = visibleOptions[activeIndex];
			if (option !== undefined) {
				selectOption(option);
			}

			return;
		}

		if (event.key === "Escape") {
			if (open) {
				event.preventDefault();
				close();
			}
		}
	}

	let chips: ReactNode = null;
	if (isMulti && selectedMulti.length > 0) {
		chips = (
			<div className="flex flex-wrap gap-1.5 pb-2">
				{selectedMulti.map((item) => {
					const label = findLabel(options, item);
					let chipLabel = label;
					if (chipLabel.length === 0) {
						chipLabel = item;
					}

					return (
						<Button
							key={item}
							variant="ghost"
							disabled={disabled}
							aria-label={`Remove ${chipLabel}`}
							className="h-auto rounded-full p-0 hover:bg-transparent"
							onClick={() => {
								toggleMulti(item);
							}}
						>
							<Badge
								variant="primary"
								size="sm"
								className="inline-flex items-center gap-1"
							>
								{chipLabel}
								<X className="size-3" aria-hidden="true" />
							</Badge>
						</Button>
					);
				})}
			</div>
		);
	}

	let listBody: ReactNode = null;
	if (loading === true) {
		listBody = (
			<div className="px-3 py-4">
				<Loading size="sm" text="Loading..." />
			</div>
		);
	} else if (visibleOptions.length === 0) {
		listBody = (
			<div className="px-3 py-2 text-sm text-muted-foreground">
				{resolvedNoOptions}
			</div>
		);
	} else {
		listBody = visibleOptions.map((option, index) => {
			let isSelected = false;
			if (isMulti) {
				isSelected = selectedMulti.includes(option.value);
			} else {
				isSelected = selectedSingle === option.value;
			}

			const isActive = index === activeIndex;

			let optionClass =
				"flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm";

			if (isSelected) {
				optionClass = cn(
					optionClass,
					"bg-primary/10 font-medium text-primary",
				);
				if (isActive) {
					optionClass = cn(
						optionClass,
						"ring-1 ring-inset ring-primary/40",
					);
				}
			} else if (isActive) {
				optionClass = cn(
					optionClass,
					"bg-accent text-accent-foreground",
				);
			} else {
				optionClass = cn(optionClass, "text-foreground hover:bg-muted");
			}

			if (option.disabled === true) {
				optionClass = cn(
					optionClass,
					"cursor-not-allowed opacity-50 hover:bg-transparent",
				);
			}

			let checkMark: ReactNode = (
				<span
					className="inline-flex size-4 shrink-0 items-center justify-center"
					aria-hidden="true"
				/>
			);
			if (isSelected) {
				checkMark = (
					<span
						className="inline-flex size-4 shrink-0 items-center justify-center text-primary"
						aria-hidden="true"
					>
						<Check className="size-3.5" aria-hidden="true" />
					</span>
				);
			}

			return (
				<div
					key={option.value}
					role="option"
					tabIndex={-1}
					aria-selected={isSelected}
					aria-disabled={option.disabled === true}
					id={`${listboxId}-option-${index}`}
					className={optionClass}
					onMouseEnter={() => {
						setActiveIndex(index);
					}}
					onMouseDown={(event) => {
						event.preventDefault();
						selectOption(option);
					}}
				>
					{checkMark}
					<span className="min-w-0 flex-1">{option.label}</span>
				</div>
			);
		});
	}

	let listNode: ReactNode = null;
	if (open) {
		listNode = (
			<Portal>
				<div
					ref={setFloating}
					id={listboxId}
					role="listbox"
					data-slot="combobox-listbox"
					aria-multiselectable={isMulti}
					className={cn(
						"z-dropdown overflow-auto rounded-lg border border-border bg-card shadow-md",
						"py-1",
					)}
					style={floatingStyles}
				>
					{listBody}
				</div>
			</Portal>
		);
	}

	let activeDescendant: string | undefined;
	if (open && visibleOptions[activeIndex] !== undefined) {
		activeDescendant = `${listboxId}-option-${activeIndex}`;
	}

	let readOnly = false;
	if (!isSearchable) {
		readOnly = true;
	}

	return (
		<div
			ref={setReference}
			data-slot="combobox"
			className={cn("relative w-full", className)}
			{...rest}
		>
			{chips}
			<div className="relative">
				<input
					id={controlId}
					type="text"
					role="combobox"
					disabled={disabled}
					readOnly={readOnly}
					aria-invalid={resolvedInvalid}
					aria-expanded={open}
					aria-controls={listboxId}
					aria-autocomplete="list"
					aria-activedescendant={activeDescendant}
					placeholder={inputPlaceholder}
					value={inputDisplay}
					className={cn(
						controlVariants({ invalid: resolvedInvalid }),
						"py-2 pr-10",
					)}
					onFocus={() => {
						openList();
					}}
					onChange={(event) => {
						if (!isSearchable || disabled === true) {
							return;
						}

						const next = event.target.value;
						setQuery(next);
						setOpen(true);
						setActiveIndex(0);

						if (onSearchChange !== undefined) {
							onSearchChange(next);
						}
					}}
					onKeyDown={onInputKeyDown}
				/>
				<ChevronDown
					className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
			</div>
			{listNode}
		</div>
	);
}

export type {
	ComboboxOption,
	ComboboxProps,
	ComboboxSingleProps,
	ComboboxMultiProps,
};
export { Combobox };
