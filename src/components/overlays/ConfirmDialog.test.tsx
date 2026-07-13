import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

function noopOpenChange(_open: boolean): void {
	/* intentional no-op for static renders */
}

function noopConfirm(): void {
	/* intentional no-op for static renders */
}

describe("ConfirmDialog", () => {
	it("confirms without a phrase gate", async () => {
		const user = userEvent.setup();
		let confirmed = false;
		let open = true;

		render(
			<ConfirmDialog
				open={open}
				title="Apply changes"
				description="Apply this change set?"
				onOpenChange={(next) => {
					open = next;
				}}
				onConfirm={() => {
					confirmed = true;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Confirm" }));
		expect(confirmed).toBe(true);
		expect(open).toBe(false);
	});

	it("keeps confirm disabled until the phrase matches", async () => {
		const user = userEvent.setup();
		let confirmed = false;

		render(
			<ConfirmDialog
				open
				title="Destroy stack"
				confirmPhrase="prod-api"
				confirmLabel="Destroy"
				variant="danger"
				onOpenChange={noopOpenChange}
				onConfirm={() => {
					confirmed = true;
				}}
			/>,
		);

		const confirm = screen.getByRole("button", { name: "Destroy" });
		expect(confirm).toBeDisabled();

		await user.type(
			screen.getByLabelText(/Type prod-api to confirm/),
			"prod-api",
		);
		expect(confirm).toBeEnabled();

		await user.click(confirm);
		expect(confirmed).toBe(true);
	});

	it("cancels without confirming", async () => {
		const user = userEvent.setup();
		let confirmed = false;
		let open = true;

		render(
			<ConfirmDialog
				open={open}
				title="Cancel me"
				onOpenChange={(next) => {
					open = next;
				}}
				onConfirm={() => {
					confirmed = true;
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Cancel" }));
		expect(confirmed).toBe(false);
		expect(open).toBe(false);
	});

	it("merges className onto the dialog panel", () => {
		render(
			<ConfirmDialog
				open
				title="Sized"
				className="confirm-extra"
				onOpenChange={noopOpenChange}
				onConfirm={noopConfirm}
			/>,
		);

		expect(screen.getByRole("dialog")).toHaveClass("confirm-extra");
	});

	it("has no accessibility violations when open", async () => {
		await expectNoA11yViolations(
			<ConfirmDialog
				open
				title="A11y"
				description="Safe to confirm."
				onOpenChange={noopOpenChange}
				onConfirm={noopConfirm}
			/>,
		);
	});
});
