import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./Accordion.js";

function DemoAccordion({
	type,
	value,
	defaultValue,
	onValueChange,
	collapsible,
	headingLevel,
}: {
	type?: "single" | "multiple";
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	collapsible?: boolean;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
	return (
		<Accordion
			type={type}
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			collapsible={collapsible}
			headingLevel={headingLevel}
		>
			<AccordionItem value="one">
				<AccordionTrigger>Section one</AccordionTrigger>
				<AccordionContent>Panel one</AccordionContent>
			</AccordionItem>
			<AccordionItem value="two">
				<AccordionTrigger>Section two</AccordionTrigger>
				<AccordionContent>Panel two</AccordionContent>
			</AccordionItem>
			<AccordionItem value="three">
				<AccordionTrigger>Section three</AccordionTrigger>
				<AccordionContent>Panel three</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

describe("Accordion", () => {
	it("opens one panel at a time in single mode", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion defaultValue="one" />);

		expect(screen.getByRole("region")).toHaveTextContent("Panel one");
		expect(
			screen.getByRole("button", { name: "Section one" }),
		).toHaveAttribute("aria-expanded", "true");

		await user.click(screen.getByRole("button", { name: "Section two" }));
		expect(screen.getByRole("region")).toHaveTextContent("Panel two");
		expect(
			screen.getByRole("button", { name: "Section one" }),
		).toHaveAttribute("aria-expanded", "false");
	});

	it("rotates caret when section opens and closes", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion defaultValue="one" collapsible />);

		const openTrigger = screen.getByRole("button", { name: "Section one" });
		const closedTrigger = screen.getByRole("button", {
			name: "Section two",
		});
		const openCaret = openTrigger.querySelector(
			'[data-slot="collapsible-caret"]',
		);
		const closedCaret = closedTrigger.querySelector(
			'[data-slot="collapsible-caret"]',
		);
		expect(openCaret).not.toBeNull();
		expect(closedCaret).not.toBeNull();
		expect(openCaret).toHaveClass("rotate-180");
		expect(closedCaret).not.toHaveClass("rotate-180");

		await user.click(openTrigger);
		expect(openCaret).not.toHaveClass("rotate-180");
	});

	it("keeps a section open in single mode when not collapsible", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion defaultValue="one" />);

		await user.click(screen.getByRole("button", { name: "Section one" }));
		expect(screen.getByRole("region")).toHaveTextContent("Panel one");
	});

	it("closes the active section when collapsible", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion defaultValue="one" collapsible />);

		await user.click(screen.getByRole("button", { name: "Section one" }));
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
	});

	it("allows multiple open panels in multiple mode", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion type="multiple" defaultValue={["one"]} />);

		await user.click(screen.getByRole("button", { name: "Section two" }));
		const regions = screen.getAllByRole("region");
		expect(regions).toHaveLength(2);
		expect(regions[0]).toHaveTextContent("Panel one");
		expect(regions[1]).toHaveTextContent("Panel two");
	});

	it("reports value changes when controlled", async () => {
		const user = userEvent.setup();
		let active = "one";
		const { rerender } = render(
			<DemoAccordion
				value={active}
				onValueChange={(next) => {
					active = String(next);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Section two" }));
		expect(active).toBe("two");

		rerender(
			<DemoAccordion
				value={active}
				onValueChange={(next) => {
					active = String(next);
				}}
			/>,
		);
		expect(screen.getByRole("region")).toHaveTextContent("Panel two");
	});

	it("wraps triggers in the configured heading level", () => {
		const { container } = render(<DemoAccordion headingLevel={4} />);
		expect(container.querySelector("h4")).not.toBeNull();
		expect(container.querySelector("h3")).toBeNull();
	});

	it("toggles with Space and Enter", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion collapsible />);

		screen.getByRole("button", { name: "Section one" }).focus();
		await user.keyboard("{Enter}");
		expect(screen.getByRole("region")).toHaveTextContent("Panel one");

		await user.keyboard(" ");
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
	});

	it("moves focus with Tab through triggers", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion />);

		await user.tab();
		expect(
			screen.getByRole("button", { name: "Section one" }),
		).toHaveFocus();

		await user.tab();
		expect(
			screen.getByRole("button", { name: "Section two" }),
		).toHaveFocus();

		await user.tab();
		expect(
			screen.getByRole("button", { name: "Section three" }),
		).toHaveFocus();
	});

	it("links panels with aria-labelledby when open", async () => {
		const user = userEvent.setup();

		render(<DemoAccordion />);

		await user.click(screen.getByRole("button", { name: "Section two" }));
		const trigger = screen.getByRole("button", { name: "Section two" });
		const panel = screen.getByRole("region");
		expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
	});

	it("renders data-slot attributes", () => {
		const { container } = render(<DemoAccordion defaultValue="one" />);
		expect(
			container.querySelector("[data-slot='accordion']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='accordion-item']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='accordion-trigger']"),
		).not.toBeNull();
		expect(
			container.querySelector("[data-slot='accordion-content']"),
		).not.toBeNull();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<DemoAccordion defaultValue="one" />);
	});

	it("throws when AccordionTrigger is used outside AccordionItem", () => {
		expect(() => {
			render(
				<Accordion>
					<AccordionTrigger>Orphan</AccordionTrigger>
				</Accordion>,
			);
		}).toThrow(
			"Accordion item components must be used within AccordionItem",
		);
	});

	it("throws when AccordionItem is used outside Accordion", () => {
		expect(() => {
			render(
				<AccordionItem value="one">
					<AccordionTrigger>Orphan</AccordionTrigger>
				</AccordionItem>,
			);
		}).toThrow("Accordion components must be used within Accordion");
	});
});
