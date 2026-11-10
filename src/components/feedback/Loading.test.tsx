import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Loading } from "./Loading.js";

describe("Loading", () => {
	it("sets data-slot and status role", () => {
		render(<Loading />);
		const status = screen.getByRole("status", { name: "Loading" });
		expect(status).toHaveAttribute("data-slot", "loading");
		expect(status).toHaveAttribute("data-variant", "spinner");
	});

	it("does not render text when none is provided", () => {
		const { container } = render(<Loading />);
		expect(container.querySelector("p")).toBeNull();
	});

	it("renders text when provided", () => {
		render(<Loading text="Loading data..." />);
		expect(screen.getByText("Loading data...")).toBeInTheDocument();
	});

	it.each([
		{ size: undefined, expected: "md", label: "default md" },
		{ size: "sm" as const, expected: "sm", label: "sm" },
		{ size: "lg" as const, expected: "lg", label: "lg" },
	])("exposes $label size on data-size", ({ size, expected }) => {
		render(<Loading size={size} />);
		expect(screen.getByRole("status")).toHaveAttribute("data-size", expected);
	});

	it("renders skeleton bones", () => {
		const { container } = render(<Loading variant="skeleton" lines={4} />);
		const root = screen.getByRole("status");
		expect(root).toHaveAttribute("data-variant", "skeleton");
		const bones = container.querySelectorAll(".animate-pulse");
		expect(bones.length).toBe(4);
	});

	it("has no accessibility violations for spinner", async () => {
		await expectNoA11yViolations(<Loading text="Loading..." />);
	});

	it("has no accessibility violations for skeleton", async () => {
		await expectNoA11yViolations(<Loading variant="skeleton" lines={3} />);
	});
});
