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
	it.each([
		{
			label: "all options when not searchable",
			query: "east",
			searchable: false,
			filterMode: "local" as const,
			expected: OPTIONS,
		},
		{
			label: "all options for remote filter mode",
			query: "east",
			searchable: true,
			filterMode: "remote" as const,
			expected: OPTIONS,
		},
		{
			label: "labels locally when searchable",
			query: "east",
			searchable: true,
			filterMode: "local" as const,
			expected: [{ value: "us-east-1", label: "US East" }],
		},
		{
			label: "option values as well as labels",
			query: "eu-west",
			searchable: true,
			filterMode: "local" as const,
			expected: [{ value: "eu-west-1", label: "EU West" }],
		},
		{
			label: "all options for empty local query",
			query: "  ",
			searchable: true,
			filterMode: "local" as const,
			expected: OPTIONS,
		},
	])("returns $label", ({ query, searchable, filterMode, expected }) => {
		const filtered = filterFieldOptions(OPTIONS, query, searchable, filterMode);
		expect(filtered).toEqual(expected);
	});
});
