import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

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
		{
			size: undefined,
			expectedH: "h-12",
			expectedW: "w-12",
			label: "default md",
		},
		{
			size: "sm" as const,
			expectedH: "h-8",
			expectedW: "w-8",
			label: "sm",
		},
		{
			size: "lg" as const,
			expectedH: "h-16",
			expectedW: "w-16",
			label: "lg",
		},
	])(
		"applies $label spinner size classes",
		({ size, expectedH, expectedW }) => {
			const { container } = render(<Loading size={size} />);
			const spinner = container.querySelector(".animate-spin");
			expect(spinner?.className).toContain(expectedH);
			expect(spinner?.className).toContain(expectedW);
		},
	);

	it("renders skeleton bones", () => {
		const { container } = render(<Loading variant="skeleton" lines={4} />);
		const root = screen.getByRole("status");
		expect(root).toHaveAttribute("data-variant", "skeleton");
		const bones = container.querySelectorAll(".animate-pulse");
		expect(bones.length).toBe(4);
	});

	it("merges custom className", () => {
		render(<Loading className="my-class" />);
		const root = screen.getByRole("status");
		expect(root.className).toContain("my-class");
	});

	it("has no accessibility violations for spinner", async () => {
		const { container } = render(<Loading text="Loading..." />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("has no accessibility violations for skeleton", async () => {
		const { container } = render(<Loading variant="skeleton" lines={3} />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
