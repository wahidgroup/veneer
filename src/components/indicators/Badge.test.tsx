import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { Badge } from "./Badge.js";

describe("Badge", () => {
	it("renders text content with data-slot", () => {
		render(<Badge>Active</Badge>);

		const badge = screen.getByText("Active");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveAttribute("data-slot", "badge");
	});

	it.each([
		{ variant: undefined, expectedClass: "bg-muted", label: "default" },
		{
			variant: "success" as const,
			expectedClass: "bg-success-muted",
			label: "success",
		},
		{
			variant: "warning" as const,
			expectedClass: "bg-warning",
			label: "warning",
		},
		{
			variant: "danger" as const,
			expectedClass: "bg-destructive-muted",
			label: "danger",
		},
	])("applies $label variant class", ({ variant, expectedClass }) => {
		render(<Badge variant={variant}>Tag</Badge>);
		expect(screen.getByText("Tag").className).toContain(expectedClass);
	});

	it("merges custom className", () => {
		render(<Badge className="my-custom">Custom</Badge>);
		expect(screen.getByText("Custom").className).toContain("my-custom");
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Badge>Accessible</Badge>);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
