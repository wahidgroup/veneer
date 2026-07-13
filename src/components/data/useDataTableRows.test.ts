import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDataTableRows } from "./useDataTableRows.js";

interface Row {
	id: string;
	name: string;
}

function getRowId(row: Row): string {
	return row.id;
}

describe("useDataTableRows", () => {
	it("applies transactions to the local row list", () => {
		const { result } = renderHook(() => {
			return useDataTableRows<Row>(
				[{ id: "a", name: "Alpha" }],
				getRowId,
			);
		});

		act(() => {
			result.current.apply({
				update: [{ id: "a", name: "Alpha-2" }],
				add: [{ id: "b", name: "Beta" }],
			});
		});

		expect(result.current.rows).toEqual([
			{ id: "a", name: "Alpha-2" },
			{ id: "b", name: "Beta" },
		]);

		act(() => {
			result.current.apply({ remove: ["a"] });
		});

		expect(result.current.rows).toEqual([{ id: "b", name: "Beta" }]);
	});
});
