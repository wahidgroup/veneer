import { describe, expect, it } from "vitest";

import { portAnchor, portSlotOnSide } from "./flowStatus.js";

describe("portAnchor", () => {
	it.each([
		{
			label: "lone EAST port centered",
			side: "EAST" as const,
			width: 100,
			height: 100,
			index: undefined,
			count: undefined,
			ratio: undefined,
			expected: { x: 100, y: 50 },
		},
		{
			label: "lone WEST port centered",
			side: "WEST" as const,
			width: 100,
			height: 100,
			index: undefined,
			count: undefined,
			ratio: undefined,
			expected: { x: 0, y: 50 },
		},
		{
			label: "EAST slot 0 of 3",
			side: "EAST" as const,
			width: 100,
			height: 120,
			index: 0,
			count: 3,
			ratio: undefined,
			expected: { x: 100, y: 30 },
		},
		{
			label: "EAST slot 1 of 3",
			side: "EAST" as const,
			width: 100,
			height: 120,
			index: 1,
			count: 3,
			ratio: undefined,
			expected: { x: 100, y: 60 },
		},
		{
			label: "EAST slot 2 of 3",
			side: "EAST" as const,
			width: 100,
			height: 120,
			index: 2,
			count: 3,
			ratio: undefined,
			expected: { x: 100, y: 90 },
		},
		{
			label: "explicit ratio over slot spread",
			side: "EAST" as const,
			width: 100,
			height: 200,
			index: 0,
			count: 3,
			ratio: 0.25,
			expected: { x: 100, y: 50 },
		},
	])("$label", ({ side, width, height, index, count, ratio, expected }) => {
		const anchor = portAnchor(side, width, height, index, count, ratio);
		expect(anchor).toEqual(expected);
	});
});

describe("portSlotOnSide", () => {
	const ports = [
		{ id: "amount", side: "EAST" as const },
		{ id: "address", side: "EAST" as const },
		{ id: "in", side: "WEST" as const },
	];

	it.each([
		{
			label: "first EAST peer",
			portId: "amount",
			side: "EAST" as const,
			expected: { index: 0, count: 2 },
		},
		{
			label: "second EAST peer",
			portId: "address",
			side: "EAST" as const,
			expected: { index: 1, count: 2 },
		},
		{
			label: "lone WEST peer",
			portId: "in",
			side: "WEST" as const,
			expected: { index: 0, count: 1 },
		},
	])("$label", ({ portId, side, expected }) => {
		const slot = portSlotOnSide(ports, portId, side);
		expect(slot).toEqual(expected);
	});
});
