import { describe, expect, it } from "vitest";

import { truncateMiddle } from "./truncateMiddle.js";

describe("truncateMiddle", () => {
	it.each([
		{
			label: "short value unchanged",
			value: "abcdef",
			options: { start: 4, end: 4 },
			expected: "abcdef",
		},
		{
			label: "start and end with ellipsis",
			value: "12345678901234567890",
			options: { start: 6, end: 6 },
			expected: "123456…567890",
		},
		{
			label: "default start and end of 6",
			value: "0123456789ABCDEF",
			options: undefined,
			expected: "012345…ABCDEF",
		},
	])("formats $label", ({ value, options, expected }) => {
		const truncated = truncateMiddle(value, options);
		expect(truncated).toBe(expected);
	});
});
