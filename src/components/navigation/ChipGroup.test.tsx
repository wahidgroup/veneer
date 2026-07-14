import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ChipGroup } from "./ChipGroup.js";

describe("ChipGroup", () => {
	it("renders a named group of toggle chips", () => {
		render(
			<ChipGroup
				aria-label="Regions"
				items={[
					{ id: "us-east-1", label: "us-east-1", pressed: true },
					{ id: "eu-west-1", label: "eu-west-1" },
				]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
			/>,
		);

		const group = screen.getByRole("group", { name: "Regions" });
		expect(group).toHaveAttribute("data-slot", "chip-group");
		expect(
			screen.getByRole("button", { name: "us-east-1" }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			screen.getByRole("button", { name: "eu-west-1" }),
		).toHaveAttribute("aria-pressed", "false");
	});

	it("reports pressed changes with the chip id", async () => {
		const user = userEvent.setup();
		let lastId = "";
		let lastPressed = false;

		render(
			<ChipGroup
				aria-label="Status"
				items={[{ id: "healthy", label: "Healthy", pressed: false }]}
				onPressedChange={(id, pressed) => {
					lastId = id;
					lastPressed = pressed;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Healthy" }));
		expect(lastId).toBe("healthy");
		expect(lastPressed).toBe(true);
	});

	it("dismisses via a labeled remove control", async () => {
		const user = userEvent.setup();
		let dismissed = "";

		render(
			<ChipGroup
				aria-label="Tags"
				items={[
					{
						id: "prod",
						label: "prod",
						pressed: true,
						dismissible: true,
					},
				]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
				onDismiss={(id) => {
					dismissed = id;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Remove prod" }));
		expect(dismissed).toBe("prod");
	});

	it("hides dismiss when onDismiss is omitted", () => {
		render(
			<ChipGroup
				aria-label="Tags"
				items={[
					{
						id: "prod",
						label: "prod",
						dismissible: true,
					},
				]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Remove prod" }),
		).not.toBeInTheDocument();
	});

	it("invokes onClearAll from the clear control", async () => {
		const user = userEvent.setup();
		let cleared = false;

		render(
			<ChipGroup
				aria-label="Filters"
				items={[{ id: "a", label: "A", pressed: true }]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
				onClearAll={() => {
					cleared = true;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Clear all" }));
		expect(cleared).toBe(true);
	});

	it("disables toggle and dismiss when the item is disabled", () => {
		render(
			<ChipGroup
				aria-label="Locked"
				items={[
					{
						id: "locked",
						label: "Locked",
						pressed: true,
						disabled: true,
						dismissible: true,
					},
				]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
				onDismiss={() => {
					/* intentional no-op */
				}}
			/>,
		);

		expect(screen.getByRole("button", { name: "Locked" })).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Remove Locked" }),
		).toBeDisabled();
	});

	it("merges className onto the group root", () => {
		render(
			<ChipGroup
				aria-label="Extra"
				className="chip-extra"
				items={[{ id: "x", label: "X" }]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
			/>,
		);
		expect(screen.getByRole("group", { name: "Extra" })).toHaveClass(
			"chip-extra",
		);
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<ChipGroup
				aria-label="Regions"
				items={[
					{ id: "us-east-1", label: "us-east-1", pressed: true },
					{ id: "eu-west-1", label: "eu-west-1", dismissible: true },
				]}
				onPressedChange={() => {
					/* intentional no-op */
				}}
				onDismiss={() => {
					/* intentional no-op */
				}}
				onClearAll={() => {
					/* intentional no-op */
				}}
			/>,
		);
	});
});
