import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FormField } from "./FormField.js";
import { MoneyInput } from "./MoneyInput.js";

type MinorListener = (value: number | undefined) => void;

function collectMinors(): {
	values: (number | undefined)[];
	onAmountMinorChange: MinorListener;
} {
	const values: (number | undefined)[] = [];
	const onAmountMinorChange: MinorListener = (value) => {
		values.push(value);
	};
	return { values, onAmountMinorChange };
}

describe("MoneyInput", () => {
	it.each([
		{
			label: "USD cents on blur",
			currency: "USD",
			ariaLabel: "Amount",
			typed: "19.99",
			expectedMinor: 1999,
			expectedDisplay: "19.99",
		},
		{
			label: "JPY whole units on blur",
			currency: "JPY",
			ariaLabel: "Yen",
			typed: "1980",
			expectedMinor: 1980,
			expectedDisplay: "1980",
		},
		{
			label: "BTC sats on blur",
			currency: "BTC",
			ariaLabel: "Bitcoin",
			typed: "0.00015000",
			expectedMinor: 15000,
			expectedDisplay: "0.00015",
		},
	])("commits $label", async ({ currency, ariaLabel, typed, expectedMinor, expectedDisplay }) => {
		const user = userEvent.setup();
		const { values, onAmountMinorChange } = collectMinors();

		render(
			<MoneyInput
				currency={currency}
				locale="en-US"
				aria-label={ariaLabel}
				onAmountMinorChange={onAmountMinorChange}
			/>,
		);

		const input = screen.getByRole("textbox", { name: ariaLabel });
		await user.type(input, typed);
		await user.tab();

		const committedMinor = values.at(-1);
		expect(committedMinor).toBe(expectedMinor);
		expect(input).toHaveValue(expectedDisplay);
	});

	it("commits on Enter", async () => {
		const user = userEvent.setup();
		const { values, onAmountMinorChange } = collectMinors();
		const yenWholeUnits = 1980;

		render(<MoneyInput currency="JPY" locale="en-US" aria-label="Yen" onAmountMinorChange={onAmountMinorChange} />);

		const input = screen.getByRole("textbox", { name: "Yen" });
		await user.type(input, String(yenWholeUnits));
		await user.keyboard("{Enter}");
		expect(values.at(-1)).toBe(yenWholeUnits);
		expect(input).toHaveValue("1980");
	});

	it("emits undefined when cleared", async () => {
		const user = userEvent.setup();
		const { values, onAmountMinorChange } = collectMinors();
		const defaultUsdCents = 500;

		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				defaultAmountMinor={defaultUsdCents}
				onAmountMinorChange={onAmountMinorChange}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Amount" });
		await user.clear(input);
		await user.tab();
		expect(values.at(-1)).toBeUndefined();
	});

	it("restores the last good value when draft is invalid", async () => {
		const user = userEvent.setup();
		const { values, onAmountMinorChange } = collectMinors();
		const defaultUsdCents = 100;

		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				defaultAmountMinor={defaultUsdCents}
				onAmountMinorChange={onAmountMinorChange}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Amount" });
		await user.clear(input);
		await user.type(input, "nope");
		await user.tab();
		expect(input).toHaveValue("1");
		expect(values).toHaveLength(0);
	});

	it("updates draft when controlled amountMinor changes", async () => {
		const user = userEvent.setup();
		const initialUsdCents = 100;
		const bumpedUsdCents = 250;

		function Harness() {
			const [minor, setMinor] = useState<number | null>(initialUsdCents);
			return (
				<>
					<button type="button" onClick={() => setMinor(bumpedUsdCents)}>
						Bump
					</button>
					<MoneyInput
						currency="USD"
						locale="en-US"
						aria-label="Amount"
						amountMinor={minor}
						onAmountMinorChange={(value) => {
							if (value === undefined) {
								setMinor(null);
								return;
							}
							setMinor(value);
						}}
					/>
				</>
			);
		}

		render(<Harness />);
		const input = screen.getByRole("textbox", { name: "Amount" });
		expect(input).toHaveValue("1");
		await user.click(screen.getByRole("button", { name: "Bump" }));
		expect(input).toHaveValue("2.5");
	});

	it("supports controlled empty via amountMinor null", async () => {
		const user = userEvent.setup();
		const initialUsdCents = 500;

		function Harness() {
			const [minor, setMinor] = useState<number | null>(initialUsdCents);
			return (
				<>
					<button type="button" onClick={() => setMinor(null)}>
						Clear
					</button>
					<MoneyInput
						currency="USD"
						locale="en-US"
						aria-label="Amount"
						amountMinor={minor}
						onAmountMinorChange={(value) => {
							if (value === undefined) {
								setMinor(null);
								return;
							}
							setMinor(value);
						}}
					/>
				</>
			);
		}

		render(<Harness />);

		const input = screen.getByRole("textbox", { name: "Amount" });
		expect(input).toHaveValue("5");

		await user.click(screen.getByRole("button", { name: "Clear" }));
		expect(input).toHaveValue("");

		await user.clear(input);
		await user.type(input, "1.25");
		await user.tab();
		expect(input).toHaveValue("1.25");
	});

	it("submits committed minor units via hidden name field", async () => {
		const user = userEvent.setup();
		const submitted: string[] = [];
		const defaultUsdCents = 1999;

		render(
			<form
				onSubmit={(event) => {
					event.preventDefault();
					const data = new FormData(event.currentTarget);
					const raw = data.get("pay");
					if (typeof raw === "string") {
						submitted.push(raw);
					}
				}}
			>
				<MoneyInput
					currency="USD"
					locale="en-US"
					aria-label="Amount"
					name="pay"
					defaultAmountMinor={defaultUsdCents}
				/>
				<button type="submit">Save</button>
			</form>,
		);

		await user.click(screen.getByRole("button", { name: "Save" }));
		expect(submitted.at(-1)).toBe("1999");

		const input = screen.getByRole("textbox", { name: "Amount" });
		await user.clear(input);
		await user.type(input, "10.50");
		await user.tab();
		await user.click(screen.getByRole("button", { name: "Save" }));
		expect(submitted.at(-1)).toBe("1050");
	});

	it("clears the committed value when currency changes", async () => {
		const user = userEvent.setup();
		const { values, onAmountMinorChange } = collectMinors();
		const defaultUsdCents = 1999;

		function Harness() {
			const [currency, setCurrency] = useState("USD");
			return (
				<>
					<button type="button" onClick={() => setCurrency("BTC")}>
						To BTC
					</button>
					<MoneyInput
						currency={currency}
						locale="en-US"
						aria-label="Amount"
						defaultAmountMinor={defaultUsdCents}
						onAmountMinorChange={onAmountMinorChange}
					/>
				</>
			);
		}

		render(<Harness />);
		const input = screen.getByRole("textbox", { name: "Amount" });
		expect(input).toHaveValue("19.99");
		await user.click(screen.getByRole("button", { name: "To BTC" }));
		expect(input).toHaveValue("");
		expect(values.at(-1)).toBeUndefined();
	});

	it("shows startAdornment override", () => {
		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				startAdornment={<span data-testid="custom-adornment">¤</span>}
			/>,
		);
		expect(screen.getByTestId("custom-adornment")).toBeInTheDocument();
	});

	it("sets aria-invalid when invalid", () => {
		render(<MoneyInput currency="USD" locale="en-US" aria-label="Amount" invalid />);
		expect(screen.getByRole("textbox", { name: "Amount" })).toHaveAttribute("aria-invalid", "true");
	});

	it("pairs with FormField for accessible labeling", () => {
		render(
			<FormField label="Pay" htmlFor="pay-amount">
				<MoneyInput id="pay-amount" currency="USD" locale="en-US" />
			</FormField>,
		);
		expect(screen.getByLabelText("Pay")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<MoneyInput currency="USD" locale="en-US" aria-label="Amount" />);
	});
});
