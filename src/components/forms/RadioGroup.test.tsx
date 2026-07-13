import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { RadioGroup } from "./RadioGroup.js";

const OPTIONS = [
	{ value: "public", label: "Public" },
	{ value: "private", label: "Private" },
];

describe("RadioGroup", () => {
	it("selects an option and notifies", async () => {
		const user = userEvent.setup();
		let selected = "";
		render(
			<RadioGroup
				legend="Network"
				options={OPTIONS}
				value={selected}
				onValueChange={(value) => {
					selected = value;
				}}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "Private" }));
		expect(selected).toBe("private");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<RadioGroup legend="Network" options={OPTIONS} />,
		);
	});
});
