import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { AppShell } from "./AppShell.js";

describe("AppShell", () => {
	it("renders landmarks for header, sidebar, and main", () => {
		render(
			<AppShell header={<div>Brand</div>} sidebar={<div>Nav</div>}>
				<p>Content</p>
			</AppShell>,
		);

		expect(screen.getByRole("banner")).toHaveTextContent("Brand");
		expect(screen.getByRole("complementary")).toHaveTextContent("Nav");
		expect(screen.getByRole("main")).toHaveTextContent("Content");
	});

	it("marks collapsed state on the root", () => {
		const { container } = render(
			<AppShell sidebarCollapsed sidebar={<div>Nav</div>}>
				Main
			</AppShell>,
		);
		const root = container.querySelector("[data-slot='app-shell']");
		expect(root).toHaveAttribute("data-collapsed", "true");
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<AppShell className="shell-extra">Main</AppShell>,
		);
		expect(container.querySelector("[data-slot='app-shell']")).toHaveClass(
			"shell-extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<AppShell
				header={<div>Header</div>}
				sidebar={<nav aria-label="Sections">Nav</nav>}
			>
				<p>Page</p>
			</AppShell>,
		);
	});
});
