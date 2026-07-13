import { describe, expect, it } from "vitest";
import * as lib from "./index.js";

/**
 * Runtime export lock
 */
const EXPECTED_EXPORTS = new Set([
	"Badge",
	"badgeVariants",
	"Button",
	"buttonVariants",
	"cn",
	"cva",
	"Loading",
	"loadingVariants",
]);

describe("public API surface", () => {
	it("exposes exactly the expected set of runtime exports", () => {
		const actualKeys = new Set(Object.keys(lib));

		const missing = [...EXPECTED_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_EXPORTS.has(k);
		});

		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});
});
