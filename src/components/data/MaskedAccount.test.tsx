import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { MaskedAccount } from "./MaskedAccount.js";

const IBAN = "DE89370400440532013000";

describe("MaskedAccount", () => {
	it("masks by default showing the last four characters", () => {
		render(<MaskedAccount value={IBAN} showCopy={false} />);
		expect(screen.getByText("••••3000")).toBeInTheDocument();
	});

	it("formats unmasked IBAN in groups of four", () => {
		render(<MaskedAccount value={IBAN} masked={false} format="iban" showCopy={false} />);
		expect(screen.getByText("DE89 3704 0044 0532 0130 00")).toBeInTheDocument();
	});

	it("copies the full account value", () => {
		render(<MaskedAccount value={IBAN} />);
		expect(screen.getByRole("button", { name: "Copy account number" })).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<MaskedAccount value={IBAN} showCopy={false} />);
	});
});
