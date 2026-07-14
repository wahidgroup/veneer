import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Card } from "./Card.js";

describe("Card", () => {
	it("renders children with card slot chrome", () => {
		const { container } = render(
			<Card>
				<span>Settings</span>
			</Card>,
		);

		const root = container.querySelector("[data-slot='card']");
		expect(root).not.toBeNull();
		expect(root).toHaveAttribute("data-size", "md");
		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it.each([
		{ size: "sm" as const, expected: "p-3" },
		{ size: "md" as const, expected: "p-4" },
	])("applies size $size padding", ({ size, expected }) => {
		const { container } = render(<Card size={size}>Body</Card>);
		const root = container.querySelector("[data-slot='card']");
		expect(root).toHaveAttribute("data-size", size);
		expect(root?.className).toContain(expected);
	});

	it("merges className onto the root", () => {
		const { container } = render(<Card className="card-extra">Body</Card>);
		expect(container.querySelector("[data-slot='card']")).toHaveClass(
			"card-extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Card>
				<p>Grouped content</p>
			</Card>,
		);
	});
});
