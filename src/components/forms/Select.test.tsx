import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Select } from "./Select.js";

const OPTIONS = [
	{ value: "us-east-1", label: "US East" },
	{ value: "eu-west-1", label: "EU West" },
];

describe("Select", () => {
	it("renders options and selects a value", async () => {
		const user = userEvent.setup();

		render(
			<Select aria-label="Region" options={OPTIONS} defaultValue="" />,
		);

		const select = screen.getByRole("combobox", { name: "Region" });
		await user.selectOptions(select, "eu-west-1");
		expect(select).toHaveValue("eu-west-1");
	});

	it("marks invalid state", () => {
		render(<Select aria-label="Region" options={OPTIONS} invalid />);
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Select aria-label="Region" options={OPTIONS} />,
		);
	});
});
