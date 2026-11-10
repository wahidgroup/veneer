import { useState } from "react";

import type { RowTransaction } from "./applyRowTransaction.js";
import { applyRowTransaction } from "./applyRowTransaction.js";

/**
 * Local row list with AG-style transactions for live / websocket patches.
 * `initialRows` seeds state once; later source changes use `setRows` or `apply`.
 */
function useDataTableRows<TData>(initialRows: TData[], getRowId: (row: TData) => string) {
	const [rows, setRows] = useState(initialRows);

	function apply(transaction: RowTransaction<TData>) {
		setRows((prev) => {
			const next = applyRowTransaction(prev, transaction, getRowId);
			return next;
		});
	}

	return {
		rows,
		setRows,
		apply,
	};
}

export { useDataTableRows };
