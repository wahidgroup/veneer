import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { CircularProgress } from "./CircularProgress.js";

describe("CircularProgress", () => {
	it.each([
		{ size: "sm" as const },
		{ size: "md" as const },
		{ size: "lg" as const },
	])("sets data-size $size", ({ size }) => {
		render(<CircularProgress aria-label="Upload" value={40} size={size} />);
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"data-size",
			size,
		);
	});

	it("sets aria-valuenow when determinate", () => {
		render(<CircularProgress aria-label="Upload" value={25} max={50} />);
		const bar = screen.getByRole("progressbar", { name: "Upload" });
		expect(bar).toHaveAttribute("aria-valuenow", "25");
		expect(bar).toHaveAttribute("aria-valuemax", "50");
	});

	it("omits aria-valuenow when indeterminate", () => {
		render(<CircularProgress aria-label="Working" />);
		const bar = screen.getByRole("progressbar");
		expect(bar).not.toHaveAttribute("aria-valuenow");
		expect(bar).toHaveAttribute("data-indeterminate", "true");
	});

	it("applies className to the root", () => {
		render(
			<CircularProgress
				aria-label="Upload"
				value={10}
				className="extra"
			/>,
		);
		expect(screen.getByRole("progressbar")).toHaveClass("extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<CircularProgress aria-label="Upload" value={60} />,
		);
	});
});
