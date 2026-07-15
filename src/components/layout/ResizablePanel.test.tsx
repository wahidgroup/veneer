import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ResizablePanel } from "./ResizablePanel.js";

describe("ResizablePanel", () => {
	it("renders start and end panes with separator metadata", () => {
		render(
			<ResizablePanel
				defaultSize={40}
				minSize={20}
				maxSize={80}
				start={<div>Start pane</div>}
				end={<div>End pane</div>}
			/>,
		);

		expect(screen.getByText("Start pane")).toBeInTheDocument();
		expect(screen.getByText("End pane")).toBeInTheDocument();

		const handle = screen.getByRole("separator", { name: "Resize panels" });
		expect(handle).toHaveAttribute("aria-orientation", "vertical");
		expect(handle).toHaveAttribute("aria-valuenow", "40");
		expect(handle).toHaveAttribute("aria-valuemin", "20");
		expect(handle).toHaveAttribute("aria-valuemax", "80");
	});

	it.each([
		{
			orientation: "horizontal" as const,
			ariaOrientation: "vertical",
			growKey: "{ArrowRight}",
			shrinkKey: "{ArrowLeft}",
			startLabel: "Start pane",
			endLabel: "End pane",
			defaultSize: 50,
		},
		{
			orientation: "vertical" as const,
			ariaOrientation: "horizontal",
			growKey: "{ArrowDown}",
			shrinkKey: "{ArrowUp}",
			startLabel: "Top pane",
			endLabel: "Bottom pane",
			defaultSize: 30,
		},
	])(
		"resizes with arrow keys on $orientation orientation",
		async ({
			orientation,
			ariaOrientation,
			growKey,
			shrinkKey,
			startLabel,
			endLabel,
			defaultSize,
		}) => {
			const user = userEvent.setup();

			render(
				<ResizablePanel
					orientation={orientation}
					defaultSize={defaultSize}
					start={<div>{startLabel}</div>}
					end={<div>{endLabel}</div>}
				/>,
			);

			const handle = screen.getByRole("separator", {
				name: "Resize panels",
			});
			expect(handle).toHaveAttribute("aria-orientation", ariaOrientation);

			handle.focus();

			await user.keyboard(growKey);
			expect(handle).toHaveAttribute(
				"aria-valuenow",
				String(defaultSize + 5),
			);

			await user.keyboard(shrinkKey);
			expect(handle).toHaveAttribute(
				"aria-valuenow",
				String(defaultSize),
			);
		},
	);

	it("resizes with pointer drag on horizontal orientation", () => {
		const { container } = render(
			<div style={{ width: 200, height: 100 }}>
				<ResizablePanel
					defaultSize={50}
					start={<div>Start pane</div>}
					end={<div>End pane</div>}
				/>
			</div>,
		);

		const root = container.querySelector("[data-slot='resizable-panel']");
		expect(root).not.toBeNull();
		Object.defineProperty(root, "getBoundingClientRect", {
			configurable: true,
			value: () => {
				return {
					width: 200,
					height: 100,
					top: 0,
					left: 0,
					right: 200,
					bottom: 100,
					x: 0,
					y: 0,
					toJSON: () => {
						return {};
					},
				};
			},
		});

		const handle = screen.getByRole("separator", { name: "Resize panels" });
		fireEvent.pointerDown(handle, {
			button: 0,
			clientX: 100,
			pointerId: 1,
		});
		fireEvent(
			window,
			new PointerEvent("pointermove", {
				bubbles: true,
				clientX: 140,
				pointerId: 1,
			}),
		);
		fireEvent(
			window,
			new PointerEvent("pointerup", {
				bubbles: true,
				clientX: 140,
				pointerId: 1,
			}),
		);

		expect(handle).toHaveAttribute("aria-valuenow", "70");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ResizablePanel
				start={<div>Start pane</div>}
				end={<div>End pane</div>}
			/>,
		);
	});
});
