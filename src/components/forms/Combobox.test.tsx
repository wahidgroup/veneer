import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Combobox } from "./Combobox.js";
import { FormField } from "./FormField.js";

const OPTIONS = [
	{ value: "us-east-1", label: "US East (N. Virginia)" },
	{ value: "eu-west-1", label: "EU West (Ireland)" },
	{ value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

function ignoreSingle(value: string) {
	void value;
}

describe("Combobox", () => {
	it("selects a single option from the listbox", async () => {
		const user = userEvent.setup();
		const values: string[] = [];
		render(
			<Combobox
				options={OPTIONS}
				value=""
				onChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("combobox");

		await user.click(input);

		const listbox = screen.getByRole("listbox");

		await user.click(
			within(listbox).getByRole("option", {
				name: "EU West (Ireland)",
			}),
		);

		expect(values).toEqual(["eu-west-1"]);
	});

	it("filters options while searching", async () => {
		const user = userEvent.setup();

		render(<Combobox options={OPTIONS} value="" onChange={ignoreSingle} />);

		const input = screen.getByRole("combobox");

		await user.click(input);
		await user.type(input, "Ireland");

		const listbox = screen.getByRole("listbox");
		expect(
			within(listbox)
				.getAllByRole("option")
				.map((node) => {
					return node.textContent;
				}),
		).toEqual(["EU West (Ireland)"]);
	});

	it("skips local filter when filterMode is remote", async () => {
		const user = userEvent.setup();
		const queries: string[] = [];

		render(
			<Combobox
				options={OPTIONS}
				value=""
				filterMode="remote"
				onChange={ignoreSingle}
				onSearchChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		const input = screen.getByRole("combobox");
		await user.click(input);
		await user.type(input, "zzz");

		const listbox = screen.getByRole("listbox");
		expect(within(listbox).getAllByRole("option")).toHaveLength(3);
		expect(queries.at(-1)).toBe("zzz");
	});

	it("clears onSearchChange when the list closes with a query", async () => {
		const user = userEvent.setup();
		const queries: string[] = [];

		render(
			<Combobox
				aria-label="Fruit"
				options={OPTIONS}
				value=""
				filterMode="remote"
				onChange={ignoreSingle}
				onSearchChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		const input = screen.getByRole("combobox");
		await user.click(input);
		await user.type(input, "ap");
		await user.keyboard("{Escape}");

		expect(screen.queryByRole("listbox")).toBeNull();
		expect(queries.at(-1)).toBe("");
	});

	it("toggles multi-select values and chips", async () => {
		const user = userEvent.setup();
		const batches: string[][] = [];

		function Harness() {
			const [selected, setSelected] = useState<string[]>([]);
			return (
				<Combobox
					multiple
					options={OPTIONS}
					value={selected}
					onChange={(next) => {
						batches.push(next);
						setSelected(next);
					}}
				/>
			);
		}

		render(<Harness />);

		const input = screen.getByRole("combobox");
		await user.click(input);
		const listbox = screen.getByRole("listbox");
		await user.click(
			within(listbox).getByRole("option", {
				name: "US East (N. Virginia)",
			}),
		);
		await user.click(
			within(listbox).getByRole("option", {
				name: "EU West (Ireland)",
			}),
		);

		expect(batches.at(-1)).toEqual(["us-east-1", "eu-west-1"]);
		expect(
			screen.getByRole("button", {
				name: "Remove US East (N. Virginia)",
			}),
		).toBeInTheDocument();
		expect(
			within(listbox).getByRole("option", {
				name: "US East (N. Virginia)",
				selected: true,
			}),
		).toBeInTheDocument();
		expect(
			within(listbox).getByRole("option", {
				name: "Asia Pacific (Singapore)",
				selected: false,
			}),
		).toBeInTheDocument();
	});

	it("marks the selected single option in the listbox", async () => {
		const user = userEvent.setup();

		render(<Combobox options={OPTIONS} value="eu-west-1" onChange={ignoreSingle} />);

		await user.click(screen.getByRole("combobox"));

		expect(
			within(screen.getByRole("listbox")).getByRole("option", {
				name: "EU West (Ireland)",
				selected: true,
			}),
		).toBeInTheDocument();
	});

	it.each([
		{ invalid: true, name: "invalid" },
		{ invalid: false, name: "valid" },
	] as const)("sets aria-invalid when $name", ({ invalid }) => {
		render(<Combobox options={OPTIONS} value="" invalid={invalid} onChange={ignoreSingle} />);
		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", String(invalid));
	});

	it("is disabled when disabled", () => {
		render(<Combobox options={OPTIONS} value="" disabled onChange={ignoreSingle} />);
		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("wires FormField label via id", () => {
		render(
			<FormField label="Region" htmlFor="region-cb">
				<Combobox id="region-cb" options={OPTIONS} value="" onChange={ignoreSingle} />
			</FormField>,
		);
		expect(screen.getByLabelText(/Region/)).toHaveAttribute("id", "region-cb");
	});

	it("closes once on Escape", async () => {
		const user = userEvent.setup();
		const queries: string[] = [];

		render(
			<Combobox
				options={OPTIONS}
				value=""
				onChange={ignoreSingle}
				onSearchChange={(query) => {
					queries.push(query);
				}}
			/>,
		);

		const input = screen.getByRole("combobox");
		await user.click(input);
		await user.type(input, "a");
		await user.keyboard("{Escape}");
		expect(queries).toEqual(["a", ""]);
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("closes on Escape", async () => {
		const user = userEvent.setup();

		render(<Combobox options={OPTIONS} value="" onChange={ignoreSingle} />);

		await user.click(screen.getByRole("combobox"));
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("has no accessibility violations when closed", async () => {
		await expectNoA11yViolations(<Combobox options={OPTIONS} value="" onChange={ignoreSingle} />);
	});

	it("has no accessibility violations when open", async () => {
		const user = userEvent.setup();

		render(<Combobox options={OPTIONS} value="" onChange={ignoreSingle} />);

		await user.click(screen.getByRole("combobox"));

		const results = await axe(document.body, {
			rules: {
				region: { enabled: false },
			},
		});
		expect(results).toHaveNoViolations();
	});
});
