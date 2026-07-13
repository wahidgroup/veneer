import { useEffect, useState } from "react";

/**
 * Returns `value` after it has been stable for `delayMs`.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const handle = globalThis.setTimeout(() => {
			setDebounced(value);
		}, delayMs);

		return () => {
			globalThis.clearTimeout(handle);
		};
	}, [value, delayMs]);

	return debounced;
}
