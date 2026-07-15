import { describe, expect, it } from "vitest";

import { portAnchor, portSlotOnSide } from "./flowStatus.js";

describe("portAnchor", () => {
	it("centers a lone port on the side", () => {
		expect(portAnchor("EAST", 100, 100)).toEqual({ x: 100, y: 50 });
		expect(portAnchor("WEST", 100, 100)).toEqual({ x: 0, y: 50 });
	});

	it("spreads multiple ports evenly along the side", () => {
		expect(portAnchor("EAST", 100, 120, 0, 3)).toEqual({ x: 100, y: 30 });
		expect(portAnchor("EAST", 100, 120, 1, 3)).toEqual({ x: 100, y: 60 });
		expect(portAnchor("EAST", 100, 120, 2, 3)).toEqual({ x: 100, y: 90 });
	});

	it("honors an explicit ratio over slot spread", () => {
		expect(portAnchor("EAST", 100, 200, 0, 3, 0.25)).toEqual({
			x: 100,
			y: 50,
		});
	});
});

describe("portSlotOnSide", () => {
	it("indexes peers on the same side only", () => {
		const ports = [
			{ id: "amount", side: "EAST" as const },
			{ id: "address", side: "EAST" as const },
			{ id: "in", side: "WEST" as const },
		];
		expect(portSlotOnSide(ports, "amount", "EAST")).toEqual({
			index: 0,
			count: 2,
		});
		expect(portSlotOnSide(ports, "address", "EAST")).toEqual({
			index: 1,
			count: 2,
		});
		expect(portSlotOnSide(ports, "in", "WEST")).toEqual({
			index: 0,
			count: 1,
		});
	});
});
