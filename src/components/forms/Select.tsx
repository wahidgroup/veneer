import type { FieldOption, OptionFilterMode } from "./fieldOption.js";
import type { FieldPickerSharedProps } from "./OptionPicker.js";
import { OptionPicker } from "./OptionPicker.js";

interface SelectProps extends FieldPickerSharedProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

/**
 * Alias for FieldOption.
 * @deprecated Prefer FieldOption.
 */
type SelectOption = FieldOption;

/**
 * Single-value listbox.
 */
function Select({ searchable, filterMode, ...rest }: SelectProps) {
	let isSearchable = searchable;
	isSearchable ??= false;

	let resolvedFilterMode: OptionFilterMode = "local";
	if (filterMode !== undefined) {
		resolvedFilterMode = filterMode;
	}

	return (
		<OptionPicker
			{...rest}
			searchable={isSearchable}
			filterMode={resolvedFilterMode}
			dataSlot="select"
		/>
	);
}

export type { SelectOption, SelectProps };
export { Select };
