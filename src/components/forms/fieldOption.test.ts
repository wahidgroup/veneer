import { describe, expect, it } from "vitest";

import { filterFieldOptions, findOptionLabel } from "./fieldOption.js";

const OPTIONS = [
	{ value: "us-east-1", label: "US East" },
	{ value: "eu-west-1", label: "EU West" },
	{ value: "ap-south-1", label: "AP South", disabled: true },
];

describe("findOptionLabel", () => {
	it.each([
		{ value: undefined, label: "" },
		{ value: "eu-west-1", label: "EU West" },
		{ value: "missing", label: "" },
	])("maps $value to $label", ({ value, label }) => {
		expect(findOptionLabel(OPTIONS, value)).toBe(label);
	});

	it("resolves empty-string option values", () => {
		const withEmpty = [
			{ value: "", label: "Select region" },
			{ value: "us-east-1", label: "US East" },
		];
		expect(findOptionLabel(withEmpty, "")).toBe("Select region");
	});
});

describe("filterFieldOptions", () => {
	it("returns all options when not searchable", () => {
		expect(filterFieldOptions(OPTIONS, "east", false, "local")).toEqual(
			OPTIONS,
		);
	});

	it("returns all options for remote filter mode", () => {
		expect(filterFieldOptions(OPTIONS, "east", true, "remote")).toEqual(
			OPTIONS,
		);
	});

	it("filters labels locally when searchable", () => {
		expect(filterFieldOptions(OPTIONS, "east", true, "local")).toEqual([
			{ value: "us-east-1", label: "US East" },
		]);
	});

	it("matches option values as well as labels", () => {
		expect(filterFieldOptions(OPTIONS, "eu-west", true, "local")).toEqual([
			{ value: "eu-west-1", label: "EU West" },
		]);
	});

	it("returns all options for empty local query", () => {
		expect(filterFieldOptions(OPTIONS, "  ", true, "local")).toEqual(
			OPTIONS,
		);
	});
});
