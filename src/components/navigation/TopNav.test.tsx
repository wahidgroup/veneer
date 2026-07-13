import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { TopNav } from "./TopNav.js";

describe("TopNav", () => {
	it("renders brand, center, start, and end slots", () => {
		render(
			<TopNav
				brand="Veneer"
				start={<span>Start</span>}
				end={<span>End</span>}
			>
				Center
			</TopNav>,
		);

		expect(screen.getByText("Veneer")).toBeInTheDocument();
		expect(screen.getByText("Start")).toBeInTheDocument();
		expect(screen.getByText("Center")).toBeInTheDocument();
		expect(screen.getByText("End")).toBeInTheDocument();
	});

	it("fires onMenuClick from the menu button", async () => {
		const user = userEvent.setup();
		let clicks = 0;

		render(
			<TopNav
				brand="Veneer"
				onMenuClick={() => {
					clicks += 1;
				}}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Toggle sidebar" }),
		);
		expect(clicks).toBe(1);
	});

	it("uses a custom menu label", () => {
		render(
			<TopNav
				brand="Veneer"
				onMenuClick={() => {
					return;
				}}
				menuLabel="Open nav"
			/>,
		);
		expect(
			screen.getByRole("button", { name: "Open nav" }),
		).toBeInTheDocument();
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<TopNav brand="Veneer" className="nav-extra" />,
		);
		expect(container.querySelector("[data-slot='top-nav']")).toHaveClass(
			"nav-extra",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<TopNav
				brand="Veneer"
				onMenuClick={() => {
					return;
				}}
				end={<button type="button">Account</button>}
			>
				Search
			</TopNav>,
		);
	});
});
