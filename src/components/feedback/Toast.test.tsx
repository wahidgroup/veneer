import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import type { ToastPlacement } from "./Toast.js";
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
			expectedClass: "border-info",
			wash: "[--toast-wash:var(--info)]",
			label: "default info",
		},
		{
			type: "success" as const,
			role: "status" as const,
			expectedClass: "border-success",
			wash: "[--toast-wash:var(--success-muted)]",
			label: "success",
		},
		{
			type: "error" as const,
			role: "alert" as const,
			expectedClass: "border-destructive",
			wash: "[--toast-wash:var(--destructive-muted)]",
			label: "error",
		},
		{
			type: "warning" as const,
			role: "status" as const,
			expectedClass: "border-warning",
			wash: "[--toast-wash:var(--warning)]",
			label: "warning",
		},
	])(
		"applies $label variant class",
		({ type, role, expectedClass, wash }) => {
			render(
				<Toast
					message="Test"
					type={type}
					onClose={noopClose}
					duration={0}
					fade={false}
				/>,
			);
			const node = screen.getByRole(role);
			expect(node.className).toContain(expectedClass);
			expect(node.className).toContain("bg-card");
			expect(node.className).toContain(wash);
		},
	);

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

	it("merges className onto the toast panel", () => {
		render(
			<Toast
				message="Styled"
				duration={0}
				fade={false}
				className="toast-extra"
				onClose={noopClose}
			/>,
		);
		expect(screen.getByRole("status")).toHaveClass("toast-extra");
	});

	it("has no accessibility violations", async () => {
		vi.useRealTimers();
		render(
			<Toast
				message="A11y check"
				onClose={noopClose}
				duration={0}
				fade={false}
			/>,
		);
		const results = await axe(screen.getByRole("status"));
		expect(results).toHaveNoViolations();
	});

	describe("placement", () => {
		const PLACEMENT_CLASS: Record<ToastPlacement, string> = {
			floating: "fixed",
			stacked: "relative",
		};

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
			expect(node.className).toContain(PLACEMENT_CLASS.floating);
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
			expect(node.className).toContain(PLACEMENT_CLASS.stacked);
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
			expect(node.className).toContain(PLACEMENT_CLASS.stacked);
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
			expect(node.className).toContain(PLACEMENT_CLASS.floating);
		});
	});

	describe("position", () => {
		it.each([
			{
				position: "top-right" as const,
				classes: ["top-4", "right-4"],
			},
			{
				position: "top-left" as const,
				classes: ["top-4", "left-4"],
			},
			{
				position: "bottom-right" as const,
				classes: ["bottom-4", "right-4"],
			},
			{
				position: "bottom-left" as const,
				classes: ["bottom-4", "left-4"],
			},
		])("places floating toast at $position", ({ position, classes }) => {
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
			for (const className of classes) {
				expect(node.className).toContain(className);
			}
		});
	});
});

describe("ToastViewport", () => {
	it("renders a fixed stack with pointer-events disabled", () => {
		render(<ToastViewport />);

		const viewport = document.querySelector("[data-slot='toast-viewport']");
		expect(viewport).toBeInTheDocument();
		expect(viewport?.className).toContain("fixed");
		expect(viewport?.className).toContain("z-toast");
		expect(viewport?.className).toContain("pointer-events-none");
		expect(viewport?.className).toContain("top-4");
		expect(viewport?.className).toContain("right-4");
	});

	it.each([
		{
			position: "bottom-left" as const,
			classes: ["bottom-4", "left-4"],
		},
		{
			position: "top-left" as const,
			classes: ["top-4", "left-4"],
		},
	])("honors position $position", ({ position, classes }) => {
		render(<ToastViewport position={position} />);

		const viewport = document.querySelector("[data-slot='toast-viewport']");
		expect(viewport?.getAttribute("data-position")).toBe(position);
		for (const className of classes) {
			expect(viewport?.className).toContain(className);
		}
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
			expect(toast.className).toContain("pointer-events-auto");
		}
	});

	it("merges a caller-provided className with viewport defaults", () => {
		render(<ToastViewport className="left-4 right-auto" />);
		const viewport = document.querySelector("[data-slot='toast-viewport']");

		expect(viewport?.className).toContain("left-4");
		expect(viewport?.className).toContain("right-auto");
		expect(viewport?.className).not.toContain("right-4");
	});

	it("has no accessibility violations when populated", async () => {
		render(
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

		const results = await axe(document.body);
		expect(results).toHaveNoViolations();
	});
});
