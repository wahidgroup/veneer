import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { SideNav } from "./SideNav.js";

const ITEMS = [
	{ id: "overview", label: "Overview", href: "/overview", active: true },
	{ id: "stacks", label: "Stacks", href: "/stacks" },
	{ id: "locked", label: "Locked", href: "/locked", disabled: true },
];

describe("SideNav", () => {
	it("renders links and marks the active item", () => {
		render(<SideNav items={ITEMS} />);

		expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(screen.getByRole("link", { name: "Stacks" })).toHaveAttribute(
			"href",
			"/stacks",
		);
		expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
			"href",
			"/overview",
		);
	});

	it("renders disabled items as non-links", () => {
		render(<SideNav items={ITEMS} />);

		expect(screen.queryByRole("link", { name: "Locked" })).toBeNull();
		expect(screen.getByLabelText("Locked")).toHaveAttribute(
			"aria-disabled",
			"true",
		);
	});

	it("hides labels when collapsed and keeps aria-label", () => {
		render(<SideNav items={ITEMS} collapsed />);

		expect(screen.queryByText("Overview")).toBeNull();
		expect(
			screen.getByRole("link", { name: "Overview" }),
		).toBeInTheDocument();
	});

	it("uses renderLink when provided", () => {
		render(
			<SideNav
				items={[{ id: "home", label: "Home", href: "/home" }]}
				renderLink={({ href, children, className, ...rest }) => {
					return (
						<a
							href={href}
							className={className}
							data-custom="1"
							{...rest}
						>
							{children}
						</a>
					);
				}}
			/>,
		);

		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
			"data-custom",
			"1",
		);
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<SideNav items={ITEMS} className="side-extra" />,
		);
		expect(container.querySelector("[data-slot='side-nav']")).toHaveClass(
			"side-extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<SideNav items={ITEMS} />);
	});
});
