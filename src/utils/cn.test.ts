import { describe, expect, it } from "vitest";
import { cn } from "./cn.js";

describe("cn", () => {
	it("returns an empty string when called with no arguments", () => {
		expect(cn()).toBe("");
	});

	it("passes through a single class string", () => {
		expect(cn("text-red-500")).toBe("text-red-500");
	});

	it("merges multiple class strings", () => {
		expect(cn("px-4", "py-2", "text-sm")).toBe("px-4 py-2 text-sm");
	});

	it("filters out falsy values", () => {
		expect(cn("px-4", false, null, undefined, 0, "py-2")).toBe("px-4 py-2");
	});

	it.each([
		{
			input: ["px-4", "px-8"] as const,
			expected: "px-8",
			label: "spacing",
		},
		{
			input: ["text-red-500", "text-blue-500"] as const,
			expected: "text-blue-500",
			label: "color",
		},
	])(
		"resolves conflicting $label utilities to the last one",
		({ input, expected }) => {
			expect(cn(...input)).toBe(expected);
		},
	);

	it("supports conditional class objects", () => {
		expect(cn("base", { "text-bold": true, "text-italic": false })).toBe(
			"base text-bold",
		);
	});

	it("supports arrays of classes", () => {
		expect(cn(["px-2", "py-2"], "text-sm")).toBe("px-2 py-2 text-sm");
	});
});
