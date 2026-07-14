import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { CopyButton } from "./CopyButton.js";

const clipboardStore = { text: "" };

function installClipboard() {
	clipboardStore.text = "";
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: {
			writeText: (text: string) => {
				clipboardStore.text = text;
				return Promise.resolve();
			},
			readText: () => {
				return Promise.resolve(clipboardStore.text);
			},
		},
	});
}

beforeEach(() => {
	installClipboard();
});

afterEach(() => {
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: undefined,
	});
});

describe("CopyButton", () => {
	it("copies value and flips to the copied affordance", async () => {
		const user = userEvent.setup();

		installClipboard();

		const seen: string[] = [];
		render(
			<CopyButton
				value="arn:aws:s3:::bucket"
				onCopied={(value) => {
					seen.push(value);
				}}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		);
		expect(
			await screen.findByRole("button", { name: "Copied" }),
		).toHaveAttribute("data-copied", "true");
		expect(clipboardStore.text).toBe("arn:aws:s3:::bucket");
		expect(seen).toEqual(["arn:aws:s3:::bucket"]);
	});

	it("resets after resetMs", async () => {
		const user = userEvent.setup();

		installClipboard();
		render(<CopyButton value="id-1" resetMs={20} />);

		await user.click(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		);
		expect(
			await screen.findByRole("button", { name: "Copied" }),
		).toBeInTheDocument();

		await act(async () => {
			await new Promise((resolve) => {
				window.setTimeout(resolve, 30);
			});
		});

		expect(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		).toHaveAttribute("data-copied", "false");
	});

	it("merges className onto the button", () => {
		render(<CopyButton value="x" className="copy-extra" />);
		expect(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		).toHaveClass("copy-extra");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<CopyButton value="stack-1" />);
	});
});
