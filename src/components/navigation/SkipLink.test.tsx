import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { SkipLink } from "./SkipLink.js";

describe("SkipLink", () => {
	it("renders as a link to main by default", () => {
		render(<SkipLink />);

		const link = screen.getByRole("link", {
			name: "Skip to main content",
		});
		expect(link).toHaveAttribute("data-slot", "skip-link");
		expect(link).toHaveAttribute("href", "#main");
	});

	it("moves focus to the hash target on activate", async () => {
		const user = userEvent.setup();

		render(
			<div>
				<SkipLink href="#demo-main" />
				<main id="demo-main" tabIndex={-1}>
					Content
				</main>
			</div>,
		);

		await user.click(
			screen.getByRole("link", { name: "Skip to main content" }),
		);
		expect(document.activeElement).toBe(screen.getByRole("main"));
	});

	it("honors custom label children", () => {
		render(<SkipLink>Skip to content</SkipLink>);
		expect(
			screen.getByRole("link", { name: "Skip to content" }),
		).toBeInTheDocument();
	});

	it("merges className onto the root", () => {
		render(<SkipLink className="skip-extra" />);
		expect(
			screen.getByRole("link", { name: "Skip to main content" }),
		).toHaveClass("skip-extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<SkipLink />);
	});
});
