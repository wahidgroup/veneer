import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Badge } from "./Badge.js";

describe("Badge", () => {
	it("renders text content with data-slot", () => {
		render(<Badge>Active</Badge>);

		const badge = screen.getByText("Active");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveAttribute("data-slot", "badge");
	});

	it.each([
		{ variant: undefined, label: "default" },
		{ variant: "success" as const, label: "success" },
		{ variant: "warning" as const, label: "warning" },
		{ variant: "danger" as const, label: "danger" },
	])("renders $label variant with data-slot", ({ variant }) => {
		render(<Badge variant={variant}>Tag</Badge>);
		const badge = screen.getByText("Tag");
		expect(badge).toHaveAttribute("data-slot", "badge");
		expect(badge).toHaveTextContent("Tag");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Badge>Accessible</Badge>);
	});
});
