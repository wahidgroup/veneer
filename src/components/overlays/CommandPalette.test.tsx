import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { CommandPalette } from "./CommandPalette.js";

const ITEMS = [
	{
		id: "stacks",
		label: "Go to stacks",
		group: "Navigate",
		keywords: ["inventory"],
	},
	{ id: "deploy", label: "Deploy stack", group: "Actions" },
	{
		id: "settings",
		label: "Open settings",
		group: "Navigate",
		disabled: true,
	},
];

describe("CommandPalette", () => {
	it("filters items and selects with Enter", async () => {
		const user = userEvent.setup();
		const selected: string[] = [];
		const opens: boolean[] = [];

		render(
			<CommandPalette
				open
				onOpenChange={(open) => {
					opens.push(open);
				}}
				items={ITEMS}
				onSelect={(item) => {
					selected.push(item.id);
				}}
			/>,
		);

		const input = screen.getByRole("combobox", { name: "Filter commands" });
		await user.type(input, "deploy");

		const listbox = screen.getByRole("listbox");
		expect(within(listbox).getAllByRole("option")).toHaveLength(1);

		await user.keyboard("{Enter}");
		expect(selected).toEqual(["deploy"]);
		expect(opens.at(-1)).toBe(false);
	});

	it("shows empty text when nothing matches", async () => {
		const user = userEvent.setup();

		render(
			<CommandPalette
				open
				onOpenChange={() => {
					/* controlled */
				}}
				items={ITEMS}
				onSelect={() => {
					/* no-op */
				}}
				emptyText="Nothing here"
			/>,
		);

		await user.type(screen.getByRole("combobox", { name: "Filter commands" }), "zzzz");
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("has no accessibility violations when open", async () => {
		await expectNoA11yViolations(
			<CommandPalette
				open
				onOpenChange={() => {
					/* controlled */
				}}
				items={ITEMS}
				onSelect={() => {
					/* no-op */
				}}
			/>,
		);
	});
});
