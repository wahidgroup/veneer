import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Popover } from "./Popover.js";

describe("Popover", () => {
	it("opens and closes with the trigger and Escape", async () => {
		const user = userEvent.setup();
		const opens: boolean[] = [];

		render(
			<Popover
				trigger="Details"
				defaultOpen={false}
				onOpenChange={(open) => {
					opens.push(open);
				}}
			>
				<button type="button">Inside</button>
			</Popover>,
		);

		expect(screen.queryByRole("dialog")).toBeNull();
		await user.click(screen.getByRole("button", { name: "Details" }));
		expect(screen.getByRole("dialog")).toBeVisible();
		expect(opens.at(-1)).toBe(true);

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(opens.at(-1)).toBe(false);
	});

	it("allows focusing interactive content inside", async () => {
		const user = userEvent.setup();

		render(
			<Popover trigger="Details" defaultOpen>
				<button type="button">Inside action</button>
			</Popover>,
		);

		await user.click(screen.getByRole("button", { name: "Inside action" }));
		expect(
			screen.getByRole("button", { name: "Inside action" }),
		).toHaveFocus();
	});

	it("has no accessibility violations when open", async () => {
		await expectNoA11yViolations(
			<Popover trigger="Details" defaultOpen title="More info">
				<button type="button">Action</button>
			</Popover>,
		);
	});
});
