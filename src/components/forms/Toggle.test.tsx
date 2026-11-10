import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Toggle } from "./Toggle.js";

describe("Toggle", () => {
	it("toggles aria-checked when uncontrolled", async () => {
		const user = userEvent.setup();

		render(<Toggle label="High availability" />);

		const sw = screen.getByRole("switch", { name: "High availability" });
		expect(sw).toHaveAttribute("aria-checked", "false");

		await user.click(sw);
		expect(sw).toHaveAttribute("aria-checked", "true");
	});

	it("reports checked changes when controlled", async () => {
		const user = userEvent.setup();
		let on = false;
		const { rerender } = render(
			<Toggle
				label="HA"
				checked={on}
				onCheckedChange={(next) => {
					on = next;
				}}
			/>,
		);

		await user.click(screen.getByRole("switch"));
		expect(on).toBe(true);

		rerender(
			<Toggle
				label="HA"
				checked={on}
				onCheckedChange={(next) => {
					on = next;
				}}
			/>,
		);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Toggle label="HA" />);
	});
});
