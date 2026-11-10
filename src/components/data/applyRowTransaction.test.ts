import { describe, expect, it } from "vitest";

import { applyRowTransaction } from "./applyRowTransaction.js";

interface Row {
	id: string;
	name: string;
}

function getRowId(row: Row): string {
	return row.id;
}

describe("applyRowTransaction", () => {
	it("updates matching rows by id", () => {
		const rows: Row[] = [
			{ id: "a", name: "Alpha" },
			{ id: "b", name: "Beta" },
		];

		const next = applyRowTransaction(rows, { update: [{ id: "a", name: "Alpha-2" }] }, getRowId);

		expect(next).toEqual([
			{ id: "a", name: "Alpha-2" },
			{ id: "b", name: "Beta" },
		]);
	});

	it("removes rows by id", () => {
		const rows: Row[] = [
			{ id: "a", name: "Alpha" },
			{ id: "b", name: "Beta" },
		];

		const next = applyRowTransaction(rows, { remove: ["a"] }, getRowId);

		expect(next).toEqual([{ id: "b", name: "Beta" }]);
	});

	it("appends new rows and skips duplicate add ids", () => {
		const rows: Row[] = [{ id: "a", name: "Alpha" }];

		const next = applyRowTransaction(
			rows,
			{
				add: [
					{ id: "b", name: "Beta" },
					{ id: "a", name: "Dup" },
				],
			},
			getRowId,
		);

		expect(next).toEqual([
			{ id: "a", name: "Alpha" },
			{ id: "b", name: "Beta" },
		]);
	});

	it("applies remove then update then add in one pass", () => {
		const rows: Row[] = [
			{ id: "a", name: "Alpha" },
			{ id: "b", name: "Beta" },
		];

		const next = applyRowTransaction(
			rows,
			{
				remove: ["b"],
				update: [{ id: "a", name: "Alpha-2" }],
				add: [{ id: "c", name: "Gamma" }],
			},
			getRowId,
		);

		expect(next).toEqual([
			{ id: "a", name: "Alpha-2" },
			{ id: "c", name: "Gamma" },
		]);
	});

	it("ignores update ids that are not in the current rows", () => {
		const rows: Row[] = [{ id: "a", name: "Alpha" }];

		const next = applyRowTransaction(rows, { update: [{ id: "missing", name: "Nope" }] }, getRowId);

		expect(next).toEqual([{ id: "a", name: "Alpha" }]);
	});
});
