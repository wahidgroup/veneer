import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "./Tabs.js";

function DemoTabs({
	value,
	onValueChange,
	className,
}: {
	value?: string;
	onValueChange?: (value: string) => void;
	className?: string;
}) {
	return (
		<Tabs
			defaultValue="one"
			value={value}
			onValueChange={onValueChange}
			className={className}
		>
			<TabsList aria-label="Demo tabs">
				<TabsTrigger value="one">One</TabsTrigger>
				<TabsTrigger value="two">Two</TabsTrigger>
				<TabsTrigger value="three" disabled>
					Three
				</TabsTrigger>
			</TabsList>
			<TabsPanel value="one">Panel one</TabsPanel>
			<TabsPanel value="two">Panel two</TabsPanel>
			<TabsPanel value="three">Panel three</TabsPanel>
		</Tabs>
	);
}

describe("Tabs", () => {
	it("shows the default panel and switches on click", async () => {
		const user = userEvent.setup();

		render(<DemoTabs />);

		expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one");
		expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
			"aria-selected",
			"true",
		);

		await user.click(screen.getByRole("tab", { name: "Two" }));
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
		expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
	});

	it("reports value changes when controlled", async () => {
		const user = userEvent.setup();
		let active = "one";
		const { rerender } = render(
			<DemoTabs
				value={active}
				onValueChange={(next) => {
					active = next;
				}}
			/>,
		);

		await user.click(screen.getByRole("tab", { name: "Two" }));
		expect(active).toBe("two");

		rerender(
			<DemoTabs
				value={active}
				onValueChange={(next) => {
					active = next;
				}}
			/>,
		);
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
	});

	it("skips disabled tabs on click", async () => {
		const user = userEvent.setup();

		render(<DemoTabs />);

		await user.click(screen.getByRole("tab", { name: "Three" }));
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one");
	});

	it("moves focus with arrow keys", async () => {
		const user = userEvent.setup();

		render(<DemoTabs />);

		screen.getByRole("tab", { name: "One" }).focus();

		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
	});

	it("merges className onto the root", () => {
		const { container } = render(<DemoTabs className="tabs-extra" />);
		expect(container.querySelector('[data-slot="tabs"]')).toHaveClass(
			"tabs-extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<DemoTabs />);
	});

	it("throws when used outside Tabs", () => {
		expect(() => {
			render(<TabsTrigger value="one">One</TabsTrigger>);
		}).toThrow("Tabs components must be used within Tabs");
	});
});
