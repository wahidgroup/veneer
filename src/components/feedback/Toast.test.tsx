import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Toast, ToastViewport } from "./Toast.js";

function noopClose(): void {
	/* intentional no-op for static renders */
}

describe("Toast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders the message", () => {
		render(
			<Toast
				message="Saved!"
				onClose={noopClose}
				duration={0}
				fade={false}
			/>,
		);
		expect(screen.getByText("Saved!")).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveAttribute(
			"data-slot",
			"toast",
		);
	});

	it.each([
		{
			type: undefined,
			role: "status" as const,
			label: "default info",
		},
		{
			type: "success" as const,
			role: "status" as const,
			label: "success",
		},
		{
			type: "error" as const,
			role: "alert" as const,
			label: "error",
		},
		{
			type: "warning" as const,
			role: "status" as const,
			label: "warning",
		},
	])("exposes $label role", ({ type, role }) => {
		render(
			<Toast
				message="Test"
				type={type}
				onClose={noopClose}
				duration={0}
				fade={false}
			/>,
		);
		expect(screen.getByRole(role)).toBeInTheDocument();
	});

	it("calls onClose after the default duration", () => {
		let closed = false;
		render(
			<Toast
				message="Auto"
				fade={false}
				onClose={() => {
					closed = true;
				}}
			/>,
		);

		expect(closed).toBe(false);
		vi.advanceTimersByTime(3000);
		expect(closed).toBe(true);
	});

	it("calls onClose after a custom duration", () => {
		let closed = false;
		render(
			<Toast
				message="Custom"
				duration={5000}
				fade={false}
				onClose={() => {
					closed = true;
				}}
			/>,
		);

		vi.advanceTimersByTime(4999);
		expect(closed).toBe(false);

		vi.advanceTimersByTime(1);
		expect(closed).toBe(true);
	});

	it("does not auto-dismiss when duration is 0", () => {
		let closed = false;
		render(
			<Toast
				message="Sticky"
				duration={0}
				fade={false}
				onClose={() => {
					closed = true;
				}}
			/>,
		);

		vi.advanceTimersByTime(10_000);
		expect(closed).toBe(false);
	});

	it("fades out before calling onClose", () => {
		let closed = false;
		render(
			<Toast
				message="Fade"
				duration={1000}
				fade={{ enterMs: 0, exitMs: 250 }}
				onClose={() => {
					closed = true;
				}}
			/>,
		);

		act(() => {
			vi.advanceTimersByTime(0);
		});
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(closed).toBe(false);
		expect(screen.getByRole("status")).toHaveAttribute(
			"data-phase",
			"exit",
		);

		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(closed).toBe(true);
	});

	it("applies configured opacity when shown", () => {
		render(
			<Toast
				message="Dim"
				duration={0}
				fade={false}
				opacity={0.5}
				onClose={noopClose}
			/>,
		);
		expect(screen.getByRole("status")).toHaveStyle({ opacity: "0.5" });
	});

	it("keeps independent dismiss timers when onClose identity changes", () => {
		let closedA = false;
		let closedB = false;

		const { rerender } = render(
			<>
				<Toast
					message="A"
					duration={1000}
					fade={false}
					onClose={() => {
						closedA = true;
					}}
				/>
				<Toast
					message="B"
					duration={3000}
					fade={false}
					onClose={() => {
						closedB = true;
					}}
				/>
			</>,
		);

		act(() => {
			vi.advanceTimersByTime(500);
		});

		rerender(
			<>
				<Toast
					message="A"
					duration={1000}
					fade={false}
					onClose={() => {
						closedA = true;
					}}
				/>
				<Toast
					message="B"
					duration={3000}
					fade={false}
					onClose={() => {
						closedB = true;
					}}
				/>
			</>,
		);

		act(() => {
			vi.advanceTimersByTime(500);
		});
		expect(closedA).toBe(true);
		expect(closedB).toBe(false);

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(closedB).toBe(true);
	});

	it("calls onClose when the close button is clicked", async () => {
		vi.useRealTimers();
		const user = userEvent.setup();
		let closed = false;

		render(
			<Toast
				message="Close me"
				duration={0}
				fade={false}
				onClose={() => {
					closed = true;
				}}
			/>,
		);

		await user.click(screen.getByLabelText("Close toast"));
		expect(closed).toBe(true);
	});

	it("runs action callbacks", async () => {
		vi.useRealTimers();
		const user = userEvent.setup();
		let acted = "";

		render(
			<Toast
				message="Undo?"
				duration={0}
				fade={false}
				actions={[
					{
						label: "Undo",
						onClick: () => {
							acted = "undo";
						},
					},
					{
						label: "Details",
						onClick: () => {
							acted = "details";
						},
					},
				]}
				onClose={noopClose}
			/>,
		);

		await user.click(screen.getByLabelText("Undo"));
		expect(acted).toBe("undo");

		await user.click(screen.getByLabelText("Details"));
		expect(acted).toBe("details");
	});

	it("has no accessibility violations", async () => {
		vi.useRealTimers();
		await expectNoA11yViolations(
			<Toast
				message="A11y check"
				onClose={noopClose}
				duration={0}
				fade={false}
			/>,
		);
	});

	describe("placement", () => {
		it("defaults to floating when standalone", () => {
			render(
				<Toast
					message="Placement"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>,
			);

			const node = screen.getByRole("status");
			expect(node.getAttribute("data-placement")).toBe("floating");
		});

		it("defaults to stacked inside a ToastViewport", () => {
			render(
				<ToastViewport>
					<Toast
						message="Placement"
						onClose={noopClose}
						duration={0}
						fade={false}
					/>
				</ToastViewport>,
			);
			const node = screen.getByRole("status");
			expect(node.getAttribute("data-placement")).toBe("stacked");
		});

		it("explicit stacked prop overrides standalone default", () => {
			render(
				<Toast
					message="Placement"
					onClose={noopClose}
					duration={0}
					fade={false}
					placement="stacked"
				/>,
			);

			const node = screen.getByRole("status");
			expect(node.getAttribute("data-placement")).toBe("stacked");
		});

		it("explicit floating prop overrides viewport default", () => {
			render(
				<ToastViewport>
					<Toast
						message="Placement"
						onClose={noopClose}
						duration={0}
						fade={false}
						placement="floating"
					/>
				</ToastViewport>,
			);

			const node = screen.getByRole("status");
			expect(node.getAttribute("data-placement")).toBe("floating");
		});
	});

	describe("position", () => {
		it.each([
			{ position: "top-right" as const },
			{ position: "top-left" as const },
			{ position: "bottom-right" as const },
			{ position: "bottom-left" as const },
		])("places floating toast at $position", ({ position }) => {
			render(
				<Toast
					message="Corner"
					onClose={noopClose}
					duration={0}
					fade={false}
					position={position}
				/>,
			);
			const node = screen.getByRole("status");
			expect(node.getAttribute("data-position")).toBe(position);
		});
	});
});

describe("ToastViewport", () => {
	it.each([
		{ position: "bottom-left" as const },
		{ position: "top-left" as const },
	])("honors position $position", ({ position }) => {
		render(<ToastViewport position={position} />);

		const viewport = document.querySelector("[data-slot='toast-viewport']");
		expect(viewport?.getAttribute("data-position")).toBe(position);
	});

	it("stacks multiple toasts as siblings inside the viewport", () => {
		render(
			<ToastViewport>
				<Toast
					message="First"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>
				<Toast
					message="Second"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>
				<Toast
					message="Third"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>
			</ToastViewport>,
		);

		const viewport = document.querySelector("[data-slot='toast-viewport']");
		const toasts = viewport?.querySelectorAll("[data-slot='toast']");
		expect(toasts?.length).toBe(3);
		for (const toast of toasts ?? []) {
			expect(toast.getAttribute("data-placement")).toBe("stacked");
		}
	});

	it("has no accessibility violations when populated", async () => {
		await expectNoA11yViolations(
			<ToastViewport>
				<Toast
					message="A11y A"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>
				<Toast
					message="A11y B"
					onClose={noopClose}
					duration={0}
					fade={false}
				/>
			</ToastViewport>,
		);
	});
});
