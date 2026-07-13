/**
 * Immutable add / update / remove by row id.
 * Unmatched `update` ids are ignored (use `add` to insert).
 */
interface RowTransaction<TData> {
	add?: TData[];
	update?: TData[];
	remove?: string[];
}

/**
 * Apply an immutable row transaction keyed by `getRowId`.
 * Removes run first, then updates replace matching rows, then adds append
 * when the id is not already present.
 */
function applyRowTransaction<TData>(
	rows: TData[],
	transaction: RowTransaction<TData>,
	getRowId: (row: TData) => string,
): TData[] {
	const removeIds = new Set<string>();
	if (transaction.remove !== undefined) {
		for (const id of transaction.remove) {
			removeIds.add(id);
		}
	}

	const updates = new Map<string, TData>();
	if (transaction.update !== undefined) {
		for (const row of transaction.update) {
			updates.set(getRowId(row), row);
		}
	}

	const next: TData[] = [];
	for (const row of rows) {
		const id = getRowId(row);
		if (removeIds.has(id)) {
			continue;
		}

		const updated = updates.get(id);
		if (updated !== undefined) {
			next.push(updated);
			updates.delete(id);
			continue;
		}

		next.push(row);
	}

	if (transaction.add !== undefined) {
		const existingIds = new Set<string>();
		for (const row of next) {
			existingIds.add(getRowId(row));
		}

		for (const row of transaction.add) {
			const id = getRowId(row);
			if (existingIds.has(id)) {
				continue;
			}

			existingIds.add(id);
			next.push(row);
		}
	}

	return next;
}

export type { RowTransaction };
export { applyRowTransaction };
