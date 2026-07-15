import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { CRYPTO_CURRENCY_UI } from "./currencyCatalog.js";
import { FormField } from "./FormField.js";
import { MoneyInput } from "./MoneyInput.js";

describe("MoneyInput", () => {
	it("commits USD cents on blur", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				onAmountMinorChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Amount" });
		await user.type(input, "19.99");
		await user.tab();
		expect(values.at(-1)).toBe(1999);
		expect(input).toHaveValue("19.99");
	});

	it("commits JPY with zero fraction digits", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<MoneyInput
				currency="JPY"
				locale="en-US"
				aria-label="Yen"
				onAmountMinorChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Yen" });
		await user.type(input, "1980");
		await user.keyboard("{Enter}");
		expect(values.at(-1)).toBe(1980);
		expect(input).toHaveValue("1980");
	});

	it("commits BTC sats with eight fraction digits", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<MoneyInput
				currency="BTC"
				locale="en-US"
				aria-label="Bitcoin"
				currencies={CRYPTO_CURRENCY_UI}
				onAmountMinorChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Bitcoin" });
		await user.type(input, "0.00015000");
		await user.tab();
		expect(values.at(-1)).toBe(15000);
		expect(input).toHaveValue("0.00015");
	});

	it("renders the Bitcoin icon adornment for BTC", () => {
		const { container } = render(
			<MoneyInput
				currency="BTC"
				locale="en-US"
				aria-label="Bitcoin"
				currencies={CRYPTO_CURRENCY_UI}
			/>,
		);
		expect(
			container.querySelector("[data-slot='money-input'] svg"),
		).not.toBeNull();
		expect(
			screen.getByRole("textbox", { name: "Bitcoin" }).className,
		).toContain("pl-9");
	});

	it("emits undefined when cleared", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				defaultAmountMinor={500}
				onAmountMinorChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("textbox", { name: "Amount" });
		await user.clear(input);
		await user.tab();
		expect(values.at(-1)).toBeUndefined();
	});

	it("restores the last good value when draft is invalid", async () => {
		const user = userEvent.setup();
		const values: (number | undefined)[] = [];

		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				defaultAmountMinor={100}
				onAmountMinorChange={(value) => {
					values.push(value);
				}}
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

		function Harness() {
			const [minor, setMinor] = useState<number | null>(100);
			return (
				<>
					<button type="button" onClick={() => setMinor(250)}>
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
		expect(screen.getByRole("textbox", { name: "Amount" })).toHaveValue(
			"1",
		);
		await user.click(screen.getByRole("button", { name: "Bump" }));
		expect(screen.getByRole("textbox", { name: "Amount" })).toHaveValue(
			"2.5",
		);
	});

	it("supports controlled empty via amountMinor null", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [minor, setMinor] = useState<number | null>(500);
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
					defaultAmountMinor={1999}
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
		render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				invalid
			/>,
		);
		expect(screen.getByRole("textbox", { name: "Amount" })).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	it("merges className onto the root", () => {
		const { container } = render(
			<MoneyInput
				currency="USD"
				locale="en-US"
				aria-label="Amount"
				className="my-money"
			/>,
		);
		expect(
			container.querySelector("[data-slot='money-input']")?.className,
		).toContain("my-money");
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
		const { container } = render(
			<MoneyInput currency="USD" locale="en-US" aria-label="Amount" />,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
