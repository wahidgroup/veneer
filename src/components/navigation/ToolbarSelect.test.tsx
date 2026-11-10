import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ToolbarSelect } from "./ToolbarSelect.js";

const OPTIONS = [
	{ value: "acct-1", label: "Prod", description: "111122223333" },
	{ value: "acct-2", label: "Staging", description: "444455556666" },
	{ value: "acct-3", label: "Sandbox", disabled: true },
];

describe("ToolbarSelect", () => {
	it("opens, selects an option, and closes", async () => {
		const user = userEvent.setup();
		const seen: string[] = [];

		render(
			<ToolbarSelect
				aria-label="Account"
				options={OPTIONS}
				defaultValue="acct-1"
				onChange={(value) => {
					seen.push(value);
				}}
			/>,
		);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Account: Prod" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Account: Prod" }));
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		await user.click(screen.getByRole("option", { name: /Staging/ }));
		expect(seen).toEqual(["acct-2"]);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Account: Staging" })).toBeInTheDocument();
	});

	it("supports controlled value", async () => {
		const user = userEvent.setup();
		const seen: string[] = [];

		const { rerender } = render(
			<ToolbarSelect
				aria-label="Region"
				options={[
					{ value: "us-east-1", label: "N. Virginia" },
					{ value: "eu-west-1", label: "Ireland" },
				]}
				value="us-east-1"
				onChange={(value) => {
					seen.push(value);
				}}
			/>,
		);

		expect(screen.getByRole("button", { name: "Region: N. Virginia" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Region: N. Virginia" }));
		await user.click(screen.getByRole("option", { name: "Ireland" }));
		expect(seen).toEqual(["eu-west-1"]);

		rerender(
			<ToolbarSelect
				aria-label="Region"
				options={[
					{ value: "us-east-1", label: "N. Virginia" },
					{ value: "eu-west-1", label: "Ireland" },
				]}
				value="eu-west-1"
				onChange={(value) => {
					seen.push(value);
				}}
			/>,
		);
		expect(screen.getByRole("button", { name: "Region: Ireland" })).toBeInTheDocument();
	});

	it("falls back to the raw value when options lack a match", () => {
		render(<ToolbarSelect aria-label="Account" options={OPTIONS} value="acct-missing" />);
		expect(screen.getByRole("button", { name: "Account: acct-missing" })).toBeInTheDocument();
	});

	it("skips disabled options", async () => {
		const user = userEvent.setup();
		const seen: string[] = [];

		render(
			<ToolbarSelect
				aria-label="Account"
				options={OPTIONS}
				onChange={(value) => {
					seen.push(value);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Account: Select" }));
		expect(screen.getByRole("option", { name: "Sandbox" })).toBeDisabled();

		await user.click(screen.getByRole("option", { name: "Sandbox" }));
		expect(seen).toEqual([]);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("moves focus with arrow keys and commits with Enter", async () => {
		const user = userEvent.setup();
		const seen: string[] = [];

		render(
			<ToolbarSelect
				aria-label="Account"
				options={OPTIONS}
				defaultValue="acct-1"
				onChange={(value) => {
					seen.push(value);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Account: Prod" }));
		const listbox = screen.getByRole("listbox");
		expect(within(listbox).getByRole("option", { name: /Prod/ })).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(within(listbox).getByRole("option", { name: /Staging/ })).toHaveFocus();

		await user.keyboard("{Enter}");
		expect(seen).toEqual(["acct-2"]);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("closes once on Escape and restores the trigger", async () => {
		const user = userEvent.setup();

		render(
			<ToolbarSelect
				aria-label="Account"
				options={OPTIONS}
				defaultValue="acct-1"
			/>,
		);

		const trigger = screen.getByRole("button", { name: "Account: Prod" });
		await user.click(trigger);
		expect(screen.getByRole("listbox")).toBeInTheDocument();
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		expect(trigger).toHaveFocus();
	});

	it("supports Home, End, and Escape", async () => {
		const user = userEvent.setup();

		render(<ToolbarSelect aria-label="Account" options={OPTIONS} defaultValue="acct-1" />);

		await user.click(screen.getByRole("button", { name: "Account: Prod" }));
		const listbox = screen.getByRole("listbox");

		await user.keyboard("{End}");
		expect(within(listbox).getByRole("option", { name: /Staging/ })).toHaveFocus();

		await user.keyboard("{Home}");
		expect(within(listbox).getByRole("option", { name: /Prod/ })).toHaveFocus();

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("has no accessibility violations when closed", async () => {
		await expectNoA11yViolations(<ToolbarSelect aria-label="Account" options={OPTIONS} />);
	});

	it("has no accessibility violations when open", async () => {
		const user = userEvent.setup();
		render(<ToolbarSelect aria-label="Account" options={OPTIONS} />);

		await user.click(screen.getByRole("button", { name: "Account: Select" }));

		const results = await axe(screen.getByRole("listbox"));
		expect(results).toHaveNoViolations();
	});
});
