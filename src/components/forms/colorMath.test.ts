import { describe, expect, it } from "vitest";

import {
	hexToHsv,
	hexToRgb,
	hsvToHex,
	hsvToRgb,
	normalizeHex,
	rgbToHex,
	rgbToHsv,
} from "./colorMath.js";

describe("colorMath", () => {
	it.each([
		{ hex: "#000000", r: 0, g: 0, b: 0 },
		{ hex: "#ffffff", r: 255, g: 255, b: 255 },
		{ hex: "#ff0000", r: 255, g: 0, b: 0 },
		{ hex: "#00ff00", r: 0, g: 255, b: 0 },
		{ hex: "#0000ff", r: 0, g: 0, b: 255 },
		{ hex: "#112233", r: 17, g: 34, b: 51 },
	])("rgbToHex / hexToRgb round-trip $hex", ({ hex, r, g, b }) => {
		expect(rgbToHex({ r, g, b })).toBe(hex);
		expect(hexToRgb(hex)).toEqual({ r, g, b });
	});

	it.each([
		{ input: "#abc", expected: "#aabbcc" },
		{ input: "ABC", expected: "#aabbcc" },
		{ input: " #FfFfFf ", expected: "#ffffff" },
	])("normalizeHex($input) -> $expected", ({ input, expected }) => {
		expect(normalizeHex(input)).toBe(expected);
	});

	it.each(["", "#gg0000", "#1234", "not-a-color", "#12345"])(
		"normalizeHex rejects %s",
		(input) => {
			expect(normalizeHex(input)).toBeNull();
			expect(hexToRgb(input)).toBeNull();
			expect(hexToHsv(input)).toBeNull();
		},
	);

	it.each([
		{ hex: "#ff0000", h: 0, s: 1, v: 1 },
		{ hex: "#00ff00", h: 120, s: 1, v: 1 },
		{ hex: "#0000ff", h: 240, s: 1, v: 1 },
		{ hex: "#000000", h: 0, s: 0, v: 0 },
		{ hex: "#ffffff", h: 0, s: 0, v: 1 },
	])("hsv round-trip for $hex", ({ hex, h, s, v }) => {
		const hsv = hexToHsv(hex);
		expect(hsv).not.toBeNull();
		expect(hsv?.h).toBeCloseTo(h, 5);
		expect(hsv?.s).toBeCloseTo(s, 5);
		expect(hsv?.v).toBeCloseTo(v, 5);
		expect(hsvToHex({ h, s, v })).toBe(hex);
	});

	it("hsvToRgb matches rgbToHsv for mid tones", () => {
		const rgb = { r: 128, g: 64, b: 192 };
		const hsv = rgbToHsv(rgb);
		const back = hsvToRgb(hsv);
		expect(back.r).toBeCloseTo(rgb.r, 0);
		expect(back.g).toBeCloseTo(rgb.g, 0);
		expect(back.b).toBeCloseTo(rgb.b, 0);
	});
});
