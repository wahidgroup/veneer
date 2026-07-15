import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { MoneyAmount } from "./MoneyAmount.js";

describe("MoneyAmount", () => {
	it("renders a formatted minor-unit amount", () => {
		const { container } = render(
			<MoneyAmount amountMinor={1999} currency="USD" locale="en-US" />,
		);

		const node = container.querySelector("[data-slot='money-amount']");
		expect(node).not.toBeNull();
		expect(node?.textContent?.replace(/\u00a0/g, " ")).toContain("19.99");
	});

	it("merges className", () => {
		const { container } = render(
			<MoneyAmount
				amountMinor={100}
				currency="USD"
				locale="en-US"
				className="my-money"
			/>,
		);
		expect(
			container.querySelector("[data-slot='money-amount']")?.className,
		).toContain("my-money");
	});

	it("has no accessibility violations", async () => {
		const { container } = render(
			<MoneyAmount amountMinor={500} currency="USD" locale="en-US" />,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
		expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
	});
});
