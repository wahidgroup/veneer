import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import type { ActionMenuEntry } from "./ActionMenu.js";
import { ContextMenu } from "./ContextMenu.js";

const MENU_ITEMS: ActionMenuEntry[] = [
	{
		key: "copy",
		label: "Copy",
		onSelect: () => {
			/* intentional no-op */
		},
	},
	{
		key: "delete",
		label: "Delete",
		variant: "danger",
		onSelect: () => {
			/* intentional no-op */
		},
	},
];

function renderMenu(items: ActionMenuEntry[] = MENU_ITEMS) {
	return render(
		<ContextMenu items={items}>
			<div>Target area</div>
		</ContextMenu>,
	);
}

function openMenu(clientX = 120, clientY = 80) {
	fireEvent.contextMenu(screen.getByText("Target area"), {
		clientX,
		clientY,
	});
}

describe("ContextMenu", () => {
	it("opens at pointer, selects an item, and closes", async () => {
		const user = userEvent.setup();
		let selected = "";

		renderMenu([
			{
				key: "copy",
				label: "Copy",
				onSelect: () => {
					selected = "copy";
				},
			},
			{
				key: "delete",
				label: "Delete",
				variant: "danger",
				onSelect: () => {
					selected = "delete";
				},
			},
		]);

		expect(screen.queryByRole("menu")).not.toBeInTheDocument();

		openMenu();

		const menu = screen.getByRole("menu");
		expect(menu).toBeInTheDocument();
		expect(menu).toHaveStyle({ top: "80px", left: "120px" });
		expect(screen.getByRole("menuitem", { name: "Copy" })).toHaveFocus();

		await user.click(screen.getByRole("menuitem", { name: "Copy" }));
		expect(selected).toBe("copy");
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("closes on Escape", async () => {
		const user = userEvent.setup();

		renderMenu();
		openMenu();
		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("closes on outside click", async () => {
		const user = userEvent.setup();

		render(
			<div>
				<ContextMenu items={MENU_ITEMS}>
					<div>Target area</div>
				</ContextMenu>
				<button type="button">Outside</button>
			</div>,
		);

		openMenu();
		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Outside" }));
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("has no accessibility violations when closed", async () => {
		await expectNoA11yViolations(
			<ContextMenu items={MENU_ITEMS}>
				<div>Target area</div>
			</ContextMenu>,
		);
	});

	it("has no accessibility violations when open", async () => {
		const { container } = renderMenu();
		openMenu();

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
