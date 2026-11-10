/**
 * Shared option model for Select and Combobox.
 */
interface FieldOption {
	value: string;
	label: string;
	disabled?: boolean;
}

/**
 * How the control filters its option list while the user types.
 * `local` filters `options` in the control. `remote` shows `options` as-is
 * (parent owns fetch via `onSearchChange`).
 */
type OptionFilterMode = "local" | "remote";

function findOptionLabel(options: FieldOption[], value: string | undefined): string {
	if (value === undefined) {
		return "";
	}

	for (const option of options) {
		if (option.value === value) {
			return option.label;
		}
	}

	return "";
}

function filterFieldOptions(
	options: FieldOption[],
	query: string,
	searchable: boolean,
	filterMode: OptionFilterMode,
): FieldOption[] {
	if (!searchable) {
		return options;
	}
	if (filterMode === "remote") {
		return options;
	}

	const normalized = query.trim().toLowerCase();
	if (normalized.length === 0) {
		return options;
	}

	return options.filter((option) => {
		return option.value.toLowerCase().includes(normalized) || option.label.toLowerCase().includes(normalized);
	});
}

export type { FieldOption, OptionFilterMode };
export { filterFieldOptions, findOptionLabel };
