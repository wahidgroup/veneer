/**
 * Progress max default. Treats missing or non-positive as 100.
 */
function resolveProgressMax(max?: number): number {
	let resolved = max;
	resolved ??= 100;
	if (resolved <= 0) {
		return 100;
	}

	return resolved;
}

export { resolveProgressMax };
