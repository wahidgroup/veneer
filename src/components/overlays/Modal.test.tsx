import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Modal } from "./Modal.js";

function noopOpenChange(_open: boolean): void {
	/* intentional no-op for closed/static renders */
}

function requireHtmlElement(node: Element | null): HTMLElement {
	if (!(node instanceof HTMLElement)) {
		throw new Error("expected HTMLElement");
	}

	return node;
}

describe("Modal", () => {
	it("renders dialog content when open", () => {
		render(
			<Modal open title="Confirm destroy" onOpenChange={noopOpenChange}>
				Destroy this stack?
			</Modal>,
		);

		expect(
			screen.getByRole("dialog", { name: "Confirm destroy" }),
		).toBeInTheDocument();
		expect(screen.getByText("Destroy this stack?")).toBeInTheDocument();
	});

	it("renders nothing when closed", () => {
		render(
			<Modal open={false} title="Hidden" onOpenChange={noopOpenChange}>
				Body
			</Modal>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("closes on Escape", async () => {
		const user = userEvent.setup();
		let open = true;
		const { rerender } = render(
			<Modal
				open={open}
				title="Esc me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Modal>,
		);

		await user.keyboard("{Escape}");
		expect(open).toBe(false);

		rerender(
			<Modal
				open={open}
				title="Esc me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Modal>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("closes when the close button is clicked", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Modal
				open={open}
				title="Close me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Modal>,
		);

		await user.click(screen.getByRole("button", { name: "Close" }));
		expect(open).toBe(false);
	});

	it("closes when the backdrop is clicked", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Modal
				open={open}
				title="Backdrop"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Modal>,
		);

		await user.click(
			requireHtmlElement(
				document.querySelector('[data-slot="modal-backdrop"]'),
			),
		);
		expect(open).toBe(false);
	});

	it("does not close on backdrop when disabled", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Modal
				open={open}
				title="Sticky"
				closeOnBackdropClick={false}
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Modal>,
		);

		await user.click(
			requireHtmlElement(
				document.querySelector('[data-slot="modal-backdrop"]'),
			),
		);
		expect(open).toBe(true);
	});

	it("traps Tab focus inside the dialog", async () => {
		const user = userEvent.setup();
		render(
			<Modal open title="Trap" onOpenChange={noopOpenChange}>
				<button type="button">First</button>
				<button type="button">Second</button>
			</Modal>,
		);

		const close = screen.getByRole("button", { name: "Close" });
		const first = screen.getByRole("button", { name: "First" });
		const second = screen.getByRole("button", { name: "Second" });

		expect(close).toHaveFocus();

		await user.tab();
		expect(first).toHaveFocus();

		await user.tab();
		expect(second).toHaveFocus();

		await user.tab();
		expect(close).toHaveFocus();
	});

	it("restores focus to the invoker when closed", async () => {
		const user = userEvent.setup();
		let open = false;
		const { rerender } = render(
			<div>
				<button type="button">Open modal</button>
				<Modal
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Modal>
			</div>,
		);

		const invoker = screen.getByRole("button", { name: "Open modal" });
		await user.click(invoker);
		open = true;
		rerender(
			<div>
				<button type="button">Open modal</button>
				<Modal
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Modal>
			</div>,
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		await user.keyboard("{Escape}");
		expect(open).toBe(false);

		rerender(
			<div>
				<button type="button">Open modal</button>
				<Modal
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Modal>
			</div>,
		);
		expect(invoker).toHaveFocus();
	});

	it("merges className onto the dialog panel", () => {
		render(
			<Modal
				open
				title="Sized"
				className="modal-extra"
				onOpenChange={noopOpenChange}
			>
				Body
			</Modal>,
		);
		expect(screen.getByRole("dialog")).toHaveClass("modal-extra");
	});

	it("has no accessibility violations when open", async () => {
		await expectNoA11yViolations(
			<Modal open title="A11y" onOpenChange={noopOpenChange}>
				Accessible body
			</Modal>,
		);
	});
});
