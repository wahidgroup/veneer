import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { AddressDisplay } from "./AddressDisplay.js";

const SAMPLE = "bc1q123456789012345678901234567890";

describe("AddressDisplay", () => {
	it("middle-truncates the address", () => {
		render(<AddressDisplay address={SAMPLE} showCopy={false} />);
		expect(screen.getByText("bc1q12…567890")).toBeInTheDocument();
		expect(screen.getByLabelText(SAMPLE)).toBeInTheDocument();
	});

	it("wires CopyButton to the full address", () => {
		render(<AddressDisplay address={SAMPLE} />);
		expect(
			screen.getByRole("button", { name: "Copy address" }),
		).toBeInTheDocument();
	});

	it("marks invalid addresses", () => {
		const { container } = render(
			<AddressDisplay address={SAMPLE} invalid showCopy={false} />,
		);
		expect(
			container.querySelector("[data-slot='address-display']"),
		).toHaveAttribute("data-invalid", "true");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<AddressDisplay address={SAMPLE} showCopy={false} />,
		);
	});
});
