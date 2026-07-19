import type {
	OnChangeFn,
	RowSelectionState,
	Updater,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

import type {
	DataTableQuery,
	DataTableRowSelection,
} from "./DataTable.types.js";
import { buildQueryKey, resolveUpdater } from "./dataTableQuery.js";

interface UseDataTableSelectionArgs<TData> {
	controlledSelection: DataTableRowSelection | undefined;
	onRowSelectionChange:
		((selection: DataTableRowSelection) => void) | undefined;
	activeQuery: DataTableQuery;
	pageSize: number;
	data: TData[];
	getRowId: (row: TData) => string;
}

interface UseDataTableSelectionResult {
	rowSelection: DataTableRowSelection;
	onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

/**
 * Controlled/uncontrolled row selection plus query-stable prune of stale ids.
 */
function useDataTableSelection<TData>({
	controlledSelection,
	onRowSelectionChange,
	activeQuery,
	pageSize,
	data,
	getRowId,
}: UseDataTableSelectionArgs<TData>): UseDataTableSelectionResult {
	const [uncontrolledSelection, setUncontrolledSelection] =
		useState<DataTableRowSelection>({});

	let rowSelection: DataTableRowSelection = uncontrolledSelection;
	if (controlledSelection !== undefined) {
		rowSelection = controlledSelection;
	}

	const lastQueryKeyRef = useRef("");
	const lastDataIdsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		const queryKey = buildQueryKey(activeQuery, pageSize);
		const currentIds = new Set<string>();
		for (const row of data) {
			currentIds.add(getRowId(row));
		}

		if (lastQueryKeyRef.current !== queryKey) {
			lastQueryKeyRef.current = queryKey;
			lastDataIdsRef.current = currentIds;

			return;
		}

		const previousIds = lastDataIdsRef.current;
		lastDataIdsRef.current = currentIds;

		const pruned: DataTableRowSelection = { ...rowSelection };
		let changed = false;
		for (const id of previousIds) {
			if (currentIds.has(id)) {
				continue;
			}
			if (pruned[id] === undefined) {
				continue;
			}

			delete pruned[id];

			changed = true;
		}

		if (!changed) {
			return;
		}
		if (onRowSelectionChange !== undefined) {
			onRowSelectionChange(pruned);
		}
		if (controlledSelection === undefined) {
			// Query-stable prune of stale ids; mirrors prior DataTable effect.
			// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional selection prune
			setUncontrolledSelection(pruned);
		}
		// Sync selection when data ids change under a stable query.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional prune on data/query identity
	}, [activeQuery, pageSize, data, getRowId]);

	const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (
		updater: Updater<RowSelectionState>,
	) => {
		if (controlledSelection !== undefined) {
			const next = resolveUpdater(updater, controlledSelection);
			if (onRowSelectionChange !== undefined) {
				onRowSelectionChange(next);
			}

			return;
		}

		setUncontrolledSelection((prev) => {
			const next = resolveUpdater(updater, prev);
			if (onRowSelectionChange !== undefined) {
				onRowSelectionChange(next);
			}

			return next;
		});
	};

	const result: UseDataTableSelectionResult = {
		rowSelection,
		onRowSelectionChange: handleRowSelectionChange,
	};
	return result;
}

export { useDataTableSelection };
export type { UseDataTableSelectionArgs, UseDataTableSelectionResult };
