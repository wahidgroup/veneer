import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import type { FieldOption, OptionFilterMode } from "./fieldOption.js";
import { usePopover } from "../../hooks/usePopover.js";
import { DISMISS_LAYER_TIER_CLASS } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Loading } from "../feedback/Loading.js";
import { Badge } from "../indicators/Badge.js";
import { Portal } from "../overlays/Portal.js";
import { Button } from "./Button.js";
import { filterFieldOptions, findOptionLabel } from "./fieldOption.js";
import { controlVariants } from "./FormField.js";

interface OptionPickerBaseProps extends Omit<
	ComponentProps<"div">,
	"onChange" | "defaultValue" | "className"
> {
	options: FieldOption[];
	id?: string;
	/**
	 * Native form field name for single-value pickers. Omitted when
	 * `disabled` or `multiple`. Multi Combobox does not serialize `name`.
	 */
	name?: string;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	searchable?: boolean;
	filterMode?: OptionFilterMode;
	loading?: boolean;
	noOptionsText?: string;
	searchPlaceholder?: string;
	onSearchChange?: (query: string) => void;
	className?: string;
	dataSlot: "combobox" | "select";
}

/**
 * Shared Select / Combobox control props (without listbox slot).
 */
type FieldPickerSharedProps = Omit<OptionPickerBaseProps, "dataSlot">;

interface OptionPickerSingleProps extends OptionPickerBaseProps {
	multiple?: false;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

interface OptionPickerMultiProps extends OptionPickerBaseProps {
	multiple: true;
	value?: string[];
	defaultValue?: string[];
	onChange?: (values: string[]) => void;
}

type OptionPickerProps = OptionPickerSingleProps | OptionPickerMultiProps;

/**
 * Shared listbox picker used by Combobox and Select. Transport-blind:
 * parent supplies `options` / `loading` / `onSearchChange`.
 */
function OptionPicker(props: OptionPickerProps) {
	const {
		options,
		id,
		name,
		disabled,
		invalid,
		placeholder,
		searchable,
		filterMode,
		loading,
		noOptionsText,
		searchPlaceholder,
		onSearchChange,
		dataSlot,
		className,
		multiple,
		value: _value,
		defaultValue: _defaultValue,
		onChange: _onChange,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		...rest
	} = props;

	void _value;
	void _defaultValue;
	void _onChange;

	let isSearchable = searchable;
	isSearchable ??= true;

	let resolvedFilterMode: OptionFilterMode = "local";
	if (filterMode !== undefined) {
		resolvedFilterMode = filterMode;
	}

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
	const listboxSlot = `${dataSlot}-listbox`;

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
		const hadQuery = query.length > 0;
		setOpen(false);
		setQuery("");
		setActiveIndex(0);

		if (hadQuery && onSearchChange !== undefined) {
			onSearchChange("");
		}
	};

	const { setReference, setFloating, floatingStyles } = usePopover({
		open,
		onClose: close,
		matchTriggerWidth: true,
	});

	const visibleOptions = useMemo(() => {
		return filterFieldOptions(
			options,
			query,
			isSearchable,
			resolvedFilterMode,
		);
	}, [options, query, isSearchable, resolvedFilterMode]);

	const selectedLabel = findOptionLabel(options, selectedSingle);

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
		const hadQuery = query.length > 0;
		setQuery("");
		setActiveIndex(0);

		if (hadQuery && onSearchChange !== undefined) {
			onSearchChange("");
		}
	}

	function selectOption(option: FieldOption) {
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
			event.preventDefault();

			if (!open) {
				openList();
				return;
			}

			const option = visibleOptions[activeIndex];
			if (option !== undefined) {
				selectOption(option);
			}

			return;
		}
	}

	let chips: ReactNode = null;
	if (isMulti && selectedMulti.length > 0) {
		chips = (
			<div className="flex flex-wrap gap-1.5 pb-2">
				{selectedMulti.map((item) => {
					const label = findOptionLabel(options, item);
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
							className="h-auto rounded-sm p-0 hover:bg-transparent"
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
					data-slot={listboxSlot}
					aria-multiselectable={isMulti}
					className={cn(
						DISMISS_LAYER_TIER_CLASS,
						"overflow-auto rounded-md border border-border bg-card shadow-md",
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

	let hiddenField: ReactNode = null;
	if (name !== undefined && !isMulti && disabled !== true) {
		hiddenField = (
			<input type="hidden" name={name} value={selectedSingle} />
		);
	}

	return (
		<div
			ref={setReference}
			data-slot={dataSlot}
			className="relative w-full"
			{...rest}
		>
			{hiddenField}
			{chips}
			<div className="relative">
				<input
					id={controlId}
					type="text"
					role="combobox"
					disabled={disabled}
					readOnly={readOnly}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
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
						readOnly && "cursor-pointer caret-transparent",
						className,
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
	FieldPickerSharedProps,
	OptionPickerMultiProps,
	OptionPickerProps,
	OptionPickerSingleProps,
};
export { OptionPicker };
