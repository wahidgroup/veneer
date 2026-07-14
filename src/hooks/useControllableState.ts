import { useCallback, useState } from "react";

interface UseControllableStateParams<T> {
	prop?: T;
	defaultProp: T;
	onChange?: (value: T) => void;
}

type SetControllableState<T> = (next: T) => void;

/**
 * Controlled when `prop` is defined; otherwise internal state from
 * `defaultProp`. Do not switch modes for the lifetime of the component.
 */
function useControllableState<T>({
	prop,
	defaultProp,
	onChange,
}: UseControllableStateParams<T>): [T, SetControllableState<T>] {
	const [uncontrolled, setUncontrolled] = useState(defaultProp);
	const isControlled = prop !== undefined;

	let value = uncontrolled;
	if (isControlled) {
		value = prop;
	}

	const setValue = useCallback<SetControllableState<T>>(
		(next) => {
			if (!isControlled) {
				setUncontrolled(next);
			}

			if (onChange !== undefined) {
				onChange(next);
			}
		},
		[isControlled, onChange],
	);

	return [value, setValue];
}

export type { SetControllableState, UseControllableStateParams };
export { useControllableState };
