import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ProgressBar } from "./ProgressBar.js";

describe("ProgressBar", () => {
	it("exposes determinate progressbar values", () => {
		render(<ProgressBar aria-label="Deploy" value={40} max={100} />);

		const bar = screen.getByRole("progressbar", { name: "Deploy" });
		expect(bar).toHaveAttribute("aria-valuemin", "0");
		expect(bar).toHaveAttribute("aria-valuemax", "100");
		expect(bar).toHaveAttribute("aria-valuenow", "40");
		expect(bar).toHaveAttribute("data-indeterminate", "false");
	});

	it("omits aria-valuenow when indeterminate", () => {
		render(<ProgressBar aria-label="Sync" />);

		const bar = screen.getByRole("progressbar", { name: "Sync" });
		expect(bar).not.toHaveAttribute("aria-valuenow");
		expect(bar).toHaveAttribute("data-indeterminate", "true");
	});

	it("clamps value below zero and above max", () => {
		const { rerender } = render(
			<ProgressBar aria-label="Deploy" value={-5} max={50} />,
		);
		expect(
			screen.getByRole("progressbar", { name: "Deploy" }),
		).toHaveAttribute("aria-valuenow", "0");

		rerender(<ProgressBar aria-label="Deploy" value={80} max={50} />);
		expect(
			screen.getByRole("progressbar", { name: "Deploy" }),
		).toHaveAttribute("aria-valuenow", "50");
	});

	it("renders an optional label", () => {
		render(
			<ProgressBar aria-label="Deploy" value={10} label="Applying…" />,
		);
		expect(screen.getByText("Applying…")).toBeInTheDocument();
	});

	it.each([
		{ size: "sm" as const, expected: "h-1.5" },
		{ size: "md" as const, expected: "h-2.5" },
		{ size: "lg" as const, expected: "h-3.5" },
	])("applies $size track height", ({ size, expected }) => {
		render(<ProgressBar aria-label="Deploy" value={25} size={size} />);

		const bar = screen.getByRole("progressbar", { name: "Deploy" });
		expect(bar.className).toContain(expected);
		expect(bar).toHaveAttribute("data-size", size);
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<ProgressBar
				aria-label="Deploy"
				value={10}
				className="progress-extra"
			/>,
		);
		expect(
			container.querySelector("[data-slot='progress-bar']"),
		).toHaveClass("progress-extra");
	});

	it("has no accessibility violations when determinate", async () => {
		await expectNoA11yViolations(
			<ProgressBar aria-label="Deploy" value={60} />,
		);
	});

	it("has no accessibility violations when indeterminate", async () => {
		const { container } = render(<ProgressBar aria-label="Sync" />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
