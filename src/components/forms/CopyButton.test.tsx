import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { CopyButton } from "./CopyButton.js";

const clipboardStore = { text: "", failNext: false };

function installClipboard() {
	clipboardStore.text = "";
	clipboardStore.failNext = false;
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: {
			writeText: (text: string) => {
				if (clipboardStore.failNext) {
					return Promise.reject(new Error("clipboard denied"));
				}

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
	vi.useRealTimers();
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

	it("stays idle when clipboard write fails", async () => {
		const user = userEvent.setup();

		installClipboard();

		clipboardStore.failNext = true;

		const seen: string[] = [];
		render(
			<CopyButton
				value="secret"
				onCopied={(value) => {
					seen.push(value);
				}}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		);
		await act(async () => {
			await Promise.resolve();
		});

		expect(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		).toHaveAttribute("data-copied", "false");
		expect(clipboardStore.text).toBe("");
		expect(seen).toEqual([]);
	});

	it("resets after resetMs", async () => {
		vi.useFakeTimers();
		installClipboard();
		render(<CopyButton value="id-1" resetMs={20} />);

		fireEvent.click(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(
			screen.getByRole("button", { name: "Copied" }),
		).toBeInTheDocument();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(20);
		});

		expect(
			screen.getByRole("button", { name: "Copy to clipboard" }),
		).toHaveAttribute("data-copied", "false");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<CopyButton value="stack-1" />);
	});
});
