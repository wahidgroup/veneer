import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Breadcrumbs } from "./Breadcrumbs.js";

describe("Breadcrumbs", () => {
	it("renders a trail with the last crumb as plain text", () => {
		render(
			<Breadcrumbs
				items={[{ label: "Org", href: "/org" }, { label: "Project", href: "/project" }, { label: "Stack" }]}
			/>,
		);

		expect(screen.getByRole("link", { name: "Org" })).toHaveAttribute("href", "/org");
		expect(screen.getByRole("link", { name: "Project" })).toHaveAttribute("href", "/project");
		expect(screen.queryByRole("link", { name: "Stack" })).toBeNull();
		expect(screen.getByText("Stack")).toBeInTheDocument();
	});

	it("uses renderLink for non-final crumbs", () => {
		render(
			<Breadcrumbs
				items={[{ label: "Org", href: "/org" }, { label: "Stack" }]}
				renderLink={({ href, children }) => {
					return (
						<a href={href} data-router="1">
							{children}
						</a>
					);
				}}
			/>,
		);

		expect(screen.getByRole("link", { name: "Org" })).toHaveAttribute("data-router", "1");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Breadcrumbs items={[{ label: "Org", href: "/org" }, { label: "Stack" }]} />);
	});
});
