import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Select } from "./Select.js";

const OPTIONS = [
	{ value: "us-east-1", label: "US East" },
	{ value: "eu-west-1", label: "EU West" },
];

describe("Select", () => {
	it("opens and selects a value", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<Select
				aria-label="Region"
				options={OPTIONS}
				defaultValue=""
				onChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		await user.click(screen.getByRole("combobox", { name: "Region" }));
		await user.click(screen.getByRole("option", { name: "EU West" }));
		expect(values).toEqual(["eu-west-1"]);
		expect(screen.getByRole("combobox")).toHaveValue("EU West");
	});

	it("marks invalid state", () => {
		render(<Select aria-label="Region" options={OPTIONS} invalid />);
		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
	});

	it("filters locally when searchable", async () => {
		const user = userEvent.setup();

		render(
			<Select
				aria-label="Region"
				options={OPTIONS}
				searchable
				value=""
				onChange={() => {
					/* controlled */
				}}
			/>,
		);

		const input = screen.getByRole("combobox");
		await user.click(input);
		await user.type(input, "EU");
		expect(screen.getByRole("option", { name: "EU West" })).toBeVisible();
		expect(screen.queryByRole("option", { name: "US East" })).toBeNull();
	});

	it("skips local filter when filterMode is remote", async () => {
		const user = userEvent.setup();
		const queries: string[] = [];

		render(
			<Select
				aria-label="Region"
				options={OPTIONS}
				searchable
				filterMode="remote"
				value=""
				onChange={() => {
					/* controlled */
				}}
				onSearchChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		const input = screen.getByRole("combobox");
		await user.click(input);
		await user.type(input, "z");
		expect(screen.getByRole("option", { name: "US East" })).toBeVisible();
		expect(screen.getByRole("option", { name: "EU West" })).toBeVisible();
		expect(queries.at(-1)).toBe("z");
	});

	it("shows the label for an empty-string option value", () => {
		render(
			<Select
				aria-label="Region"
				options={[
					{ value: "", label: "Select region" },
					{ value: "us-east-1", label: "US East" },
				]}
				value=""
				onChange={() => {
					/* controlled */
				}}
			/>,
		);

		expect(screen.getByRole("combobox")).toHaveValue("Select region");
	});

	it("omits the named hidden input when disabled", () => {
		const { container } = render(
			<Select
				aria-label="Region"
				name="region"
				options={OPTIONS}
				value="us-east-1"
				disabled
				onChange={() => {
					/* controlled */
				}}
			/>,
		);

		expect(container.querySelector('input[type="hidden"]')).toBeNull();
	});

	it("opens on Enter without submitting a parent form", async () => {
		const user = userEvent.setup();
		const submits: string[] = [];

		render(
			<form
				onSubmit={(event) => {
					event.preventDefault();
					submits.push("submit");
				}}
			>
				<Select aria-label="Region" options={OPTIONS} defaultValue="" />
				<button type="submit">Save</button>
			</form>,
		);

		const input = screen.getByRole("combobox", { name: "Region" });
		await user.click(input);
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("listbox")).toBeNull();

		await user.keyboard("{Enter}");
		expect(screen.getByRole("listbox")).toBeVisible();
		expect(submits).toEqual([]);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Select aria-label="Region" options={OPTIONS} />);
	});
});
