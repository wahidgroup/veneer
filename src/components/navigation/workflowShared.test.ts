import { describe, expect, it } from "vitest";

import { stepEdgeFlags } from "./workflowShared.js";

describe("stepEdgeFlags", () => {
	it.each([
		{
			stepIds: [],
			value: "plan",
			isFirst: false,
			isLast: false,
		},
		{
			stepIds: ["region", "plan", "confirm"],
			value: "missing",
			isFirst: false,
			isLast: false,
		},
		{
			stepIds: ["region", "plan", "confirm"],
			value: "region",
			isFirst: true,
			isLast: false,
		},
		{
			stepIds: ["region", "plan", "confirm"],
			value: "plan",
			isFirst: false,
			isLast: false,
		},
		{
			stepIds: ["region", "plan", "confirm"],
			value: "confirm",
			isFirst: false,
			isLast: true,
		},
		{
			stepIds: ["only"],
			value: "only",
			isFirst: true,
			isLast: true,
		},
	])(
		"flags $value in [$stepIds] as first=$isFirst last=$isLast",
		({ stepIds, value, isFirst, isLast }) => {
			expect(stepEdgeFlags(stepIds, value)).toEqual({
				isFirst,
				isLast,
			});
		},
	);
});
