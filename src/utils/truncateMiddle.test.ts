import { describe, expect, it } from "vitest";

import { truncateMiddle } from "./truncateMiddle.js";

describe("truncateMiddle", () => {
	it("returns short values unchanged", () => {
		expect(truncateMiddle("abcdef", { start: 4, end: 4 })).toBe("abcdef");
	});

	it("keeps start and end characters with an ellipsis", () => {
		expect(
			truncateMiddle("12345678901234567890", {
				start: 6,
				end: 6,
			}),
		).toBe("123456…567890");
	});

	it("uses default start and end of 6", () => {
		expect(truncateMiddle("0123456789ABCDEF")).toBe("012345…ABCDEF");
	});
});
