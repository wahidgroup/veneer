import type { FieldOption, OptionFilterMode } from "./fieldOption.js";
import type { FieldPickerSharedProps } from "./OptionPicker.js";
import { OptionPicker } from "./OptionPicker.js";

type ComboboxBaseProps = FieldPickerSharedProps;

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

/**
 * Alias for FieldOption.
 * @deprecated Prefer FieldOption.
 */
type ComboboxOption = FieldOption;

/**
 * Searchable listbox for large option sets. Use `multiple` for chip multi-select.
 * `filterMode="local"` (default) filters `options` in the control; `"remote"`
 * leaves filtering to the parent via `onSearchChange` (API typeahead).
 * Pair with `FormField` via matching `id` / `htmlFor`.
 */
function Combobox(props: ComboboxProps) {
	let searchable = props.searchable;
	searchable ??= true;

	return <OptionPicker {...props} searchable={searchable} dataSlot="combobox" />;
}

export type { ComboboxMultiProps, ComboboxOption, ComboboxProps, ComboboxSingleProps, FieldOption, OptionFilterMode };
export { Combobox };
