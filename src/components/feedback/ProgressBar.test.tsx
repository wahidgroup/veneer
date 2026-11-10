import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
		const { rerender } = render(<ProgressBar aria-label="Deploy" value={-5} max={50} />);
		expect(screen.getByRole("progressbar", { name: "Deploy" })).toHaveAttribute("aria-valuenow", "0");

		rerender(<ProgressBar aria-label="Deploy" value={80} max={50} />);
		expect(screen.getByRole("progressbar", { name: "Deploy" })).toHaveAttribute("aria-valuenow", "50");
	});

	it("renders an optional label", () => {
		render(<ProgressBar aria-label="Deploy" value={10} label="Applying…" />);
		expect(screen.getByText("Applying…")).toBeInTheDocument();
	});

	it.each([{ size: "sm" as const }, { size: "md" as const }, { size: "lg" as const }])(
		"applies data-size $size",
		({ size }) => {
			render(<ProgressBar aria-label="Deploy" value={25} size={size} />);

			const bar = screen.getByRole("progressbar", { name: "Deploy" });
			expect(bar).toHaveAttribute("data-size", size);
		},
	);

	it("has no accessibility violations when determinate", async () => {
		await expectNoA11yViolations(<ProgressBar aria-label="Deploy" value={60} />);
	});

	it("has no accessibility violations when indeterminate", async () => {
		await expectNoA11yViolations(<ProgressBar aria-label="Sync" />);
	});
});
