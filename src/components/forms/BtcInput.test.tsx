import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { BtcInput } from "./BtcInput.js";

describe("BtcInput", () => {
	it.each([
		{
			label: "BTC major draft",
			unit: undefined,
			ariaLabel: "Bitcoin",
			typed: "0.00015000",
			expectedSats: 15000,
		},
		{
			label: "integer sats unit",
			unit: "sats" as const,
			ariaLabel: "Sats",
			typed: "15000",
			expectedSats: 15000,
		},
	])("commits satoshis from $label", async ({ unit, ariaLabel, typed, expectedSats }) => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<BtcInput
				aria-label={ariaLabel}
				locale="en-US"
				unit={unit}
				onAmountSatsChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("textbox", { name: ariaLabel });
		await user.type(input, typed);
		await user.tab();

		const committedSats = values.at(-1);
		expect(committedSats).toBe(expectedSats);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<BtcInput aria-label="Bitcoin" locale="en-US" />);
	});
});
