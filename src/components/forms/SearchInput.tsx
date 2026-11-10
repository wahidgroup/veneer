import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { useDebounce } from "../../hooks/useDebounce.js";
import { cn } from "../../utils/cn.js";
import { Button } from "./Button.js";
import { controlVariants } from "./FormField.js";

interface SearchInputProps extends Omit<ComponentProps<"div">, "onChange"> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
	disabled?: boolean;
	startAdornment?: ReactNode;
}

/**
 * Search field with optional debounce and clear control. Defaults to a Search icon;
 * pass `startAdornment` to override.
 */
function SearchInput({
	value: controlledValue,
	defaultValue,
	onValueChange,
	placeholder,
	debounceMs,
	disabled,
	startAdornment,
	className,
	...rest
}: SearchInputProps) {
	const isControlled = controlledValue !== undefined;

	let initial = "";
	if (isControlled) {
		initial = controlledValue;
	} else if (defaultValue !== undefined) {
		initial = defaultValue;
	}

	const [draft, setDraft] = useState(initial);
	const [prevControlled, setPrevControlled] = useState(controlledValue);

	/**
	 * Sync draft when controlled `value` changes. Prefer this over
	 * effect+setState - `react-hooks/set-state-in-effect` rejects the effect form.
	 * @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	 */
	if (isControlled && controlledValue !== prevControlled) {
		setPrevControlled(controlledValue);
		setDraft(controlledValue);
	}

	let delay = debounceMs;
	delay ??= 300;

	const debouncedValue = useDebounce(draft, delay);

	useEffect(() => {
		if (onValueChange !== undefined) {
			onValueChange(debouncedValue);
		}
	}, [debouncedValue, onValueChange]);

	let resolvedPlaceholder = placeholder;
	resolvedPlaceholder ??= "Search";

	let clearNode: ReactNode = null;
	if (draft.length > 0 && disabled !== true) {
		clearNode = (
			<Button
				variant="ghost"
				size="icon"
				aria-label="Clear search"
				className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2"
				onClick={() => {
					setDraft("");
				}}
			>
				<X className="size-4" aria-hidden="true" />
			</Button>
		);
	}

	let resolvedAdornment: ReactNode = <Search className="size-4" aria-hidden="true" />;
	if (startAdornment !== undefined) {
		resolvedAdornment = startAdornment;
	}

	return (
		<div data-slot="search-input" className={cn("relative w-full", className)} {...rest}>
			<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
				{resolvedAdornment}
			</span>
			<input
				type="search"
				value={draft}
				disabled={disabled}
				placeholder={resolvedPlaceholder}
				aria-label={resolvedPlaceholder}
				className={cn(
					controlVariants({ invalid: false }),
					"py-2 pl-9 pr-10",
					"[&::-webkit-search-cancel-button]:hidden",
					"[&::-webkit-search-decoration]:hidden",
				)}
				onChange={(event) => {
					setDraft(event.target.value);
				}}
			/>
			{clearNode}
		</div>
	);
}

export type { SearchInputProps };
export { SearchInput };
