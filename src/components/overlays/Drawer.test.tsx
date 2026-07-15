import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Drawer } from "./Drawer.js";

function noopOpenChange(_open: boolean): void {
	/* intentional no-op for closed/static renders */
}

function requireHtmlElement(node: Element | null): HTMLElement {
	if (!(node instanceof HTMLElement)) {
		throw new Error("expected HTMLElement");
	}

	return node;
}

describe("Drawer", () => {
	it("renders dialog content when open", () => {
		render(
			<Drawer open title="Instance detail" onOpenChange={noopOpenChange}>
				vpc-0123456789abcdef0
			</Drawer>,
		);

		expect(
			screen.getByRole("dialog", { name: "Instance detail" }),
		).toBeInTheDocument();
		expect(screen.getByText("vpc-0123456789abcdef0")).toBeInTheDocument();
		expect(document.querySelector('[data-slot="drawer"]')).toHaveAttribute(
			"data-side",
			"right",
		);
	});

	it("renders nothing when closed", () => {
		render(
			<Drawer open={false} title="Hidden" onOpenChange={noopOpenChange}>
				Body
			</Drawer>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it.each([["right"], ["left"], ["top"], ["bottom"]] as const)(
		"places the panel on the %s edge",
		(side) => {
			render(
				<Drawer
					open
					side={side}
					title="Side"
					onOpenChange={noopOpenChange}
				>
					Body
				</Drawer>,
			);

			const shell = requireHtmlElement(
				document.querySelector('[data-slot="drawer"]'),
			);
			expect(shell).toHaveAttribute("data-side", side);
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		},
	);

	it("closes on Escape", async () => {
		const user = userEvent.setup();
		let open = true;
		const { rerender } = render(
			<Drawer
				open={open}
				title="Esc me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Drawer>,
		);

		await user.keyboard("{Escape}");
		expect(open).toBe(false);

		rerender(
			<Drawer
				open={open}
				title="Esc me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Drawer>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("closes when the close button is clicked", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Drawer
				open={open}
				title="Close me"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Drawer>,
		);

		await user.click(screen.getByRole("button", { name: "Close" }));
		expect(open).toBe(false);
	});

	it("hides the header close control when showCloseButton is false", () => {
		let open = true;
		render(
			<Drawer
				open={open}
				title="No header close"
				showCloseButton={false}
				onOpenChange={(next) => {
					open = next;
				}}
			>
				<button type="button">Body close</button>
			</Drawer>,
		);

		expect(
			screen.queryByRole("button", { name: "Close" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Body close" }),
		).toBeInTheDocument();
	});

	it("closes when the backdrop is clicked", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Drawer
				open={open}
				title="Backdrop"
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Drawer>,
		);

		await user.click(
			requireHtmlElement(
				document.querySelector('[data-slot="drawer-backdrop"]'),
			),
		);
		expect(open).toBe(false);
	});

	it("does not close on backdrop when disabled", async () => {
		const user = userEvent.setup();
		let open = true;
		render(
			<Drawer
				open={open}
				title="Sticky"
				closeOnBackdropClick={false}
				onOpenChange={(next) => {
					open = next;
				}}
			>
				Body
			</Drawer>,
		);

		await user.click(
			requireHtmlElement(
				document.querySelector('[data-slot="drawer-backdrop"]'),
			),
		);
		expect(open).toBe(true);
	});

	it("traps Tab focus inside the dialog", async () => {
		const user = userEvent.setup();
		render(
			<Drawer open title="Trap" onOpenChange={noopOpenChange}>
				<button type="button">First</button>
				<button type="button">Second</button>
			</Drawer>,
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
				<button type="button">Open drawer</button>
				<Drawer
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Drawer>
			</div>,
		);

		const invoker = screen.getByRole("button", { name: "Open drawer" });
		await user.click(invoker);
		open = true;
		rerender(
			<div>
				<button type="button">Open drawer</button>
				<Drawer
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Drawer>
			</div>,
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		await user.keyboard("{Escape}");
		expect(open).toBe(false);

		rerender(
			<div>
				<button type="button">Open drawer</button>
				<Drawer
					open={open}
					title="Restore"
					onOpenChange={(next) => {
						open = next;
					}}
				>
					Body
				</Drawer>
			</div>,
		);
		expect(invoker).toHaveFocus();
	});

	it("has no accessibility violations when open", async () => {
		await expectNoA11yViolations(
			<Drawer open title="A11y" onOpenChange={noopOpenChange}>
				Accessible body
			</Drawer>,
		);
	});
});
