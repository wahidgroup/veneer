import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ActionMenu } from "./ActionMenu.js";

describe("ActionMenu", () => {
	it("opens, selects an item, and closes", async () => {
		const user = userEvent.setup();
		let selected = "";

		render(
			<ActionMenu
				label="Stack"
				items={[
					{
						key: "edit",
						label: "Edit",
						onSelect: () => {
							selected = "edit";
						},
					},
					{
						key: "destroy",
						label: "Destroy",
						variant: "danger",
						onSelect: () => {
							selected = "destroy";
						},
					},
				]}
			/>,
		);

		expect(screen.queryByRole("menu")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Stack/ }));
		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.click(screen.getByRole("menuitem", { name: "Edit" }));
		expect(selected).toBe("edit");
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});

	it("skips disabled items", async () => {
		const user = userEvent.setup();
		let selected = "";

		render(
			<ActionMenu
				items={[
					{
						key: "locked",
						label: "Locked",
						disabled: true,
						onSelect: () => {
							selected = "locked";
						},
					},
					{
						key: "ok",
						label: "Ok",
						onSelect: () => {
							selected = "ok";
						},
					},
				]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Actions/ }));
		expect(screen.getByRole("menuitem", { name: "Locked" })).toBeDisabled();

		await user.click(screen.getByRole("menuitem", { name: "Locked" }));
		expect(selected).toBe("");

		await user.click(screen.getByRole("menuitem", { name: "Ok" }));
		expect(selected).toBe("ok");
	});

	it("moves focus with arrow keys", async () => {
		const user = userEvent.setup();

		render(
			<ActionMenu
				items={[
					{
						key: "a",
						label: "Alpha",
						onSelect: () => {
							/* intentional no-op */
						},
					},
					{
						key: "b",
						label: "Beta",
						onSelect: () => {
							/* intentional no-op */
						},
					},
				]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Actions/ }));
		expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(screen.getByRole("menuitem", { name: "Beta" })).toHaveFocus();

		await user.keyboard("{ArrowUp}");
		expect(screen.getByRole("menuitem", { name: "Alpha" })).toHaveFocus();
	});

	it("renders a divider as separator", async () => {
		const user = userEvent.setup();

		render(
			<ActionMenu
				items={[
					{
						key: "a",
						label: "Alpha",
						onSelect: () => {
							/* intentional no-op */
						},
					},
					{ key: "d1", type: "divider" },
					{
						key: "b",
						label: "Beta",
						onSelect: () => {
							/* intentional no-op */
						},
					},
				]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Actions/ }));
		expect(screen.getByRole("separator")).toBeInTheDocument();
	});

	it("has no accessibility violations when closed", async () => {
		await expectNoA11yViolations(
			<ActionMenu
				items={[
					{
						key: "a",
						label: "Alpha",
						onSelect: () => {
							/* intentional no-op */
						},
					},
				]}
			/>,
		);
	});

	it("has no accessibility violations when open", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<ActionMenu
				items={[
					{
						key: "a",
						label: "Alpha",
						onSelect: () => {
							/* intentional no-op */
						},
					},
				]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /Actions/ }));
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
