import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { CodeBlock } from "./CodeBlock.js";

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

describe("CodeBlock", () => {
	it("renders plain code inside pre/code", () => {
		const { container } = render(<CodeBlock code={'resource "aws_s3_bucket" "logs" {}'} />);

		expect(screen.getByText('resource "aws_s3_bucket" "logs" {}')).toBeInTheDocument();
		expect(container.querySelector("[data-slot='code-block']")).not.toBeNull();
		expect(container.querySelector("[data-slot='code-block-code']")).not.toBeNull();
	});

	it("shows the language label in the toolbar", () => {
		render(<CodeBlock code="print('hi')" language="python" />);
		expect(screen.getByText("python")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeInTheDocument();
	});

	it("hides copy when showCopy is false", () => {
		render(<CodeBlock code="x = 1" language="python" showCopy={false} />);
		expect(screen.getByText("python")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Copy to clipboard" })).not.toBeInTheDocument();
	});

	it("copies code through CopyButton", async () => {
		const user = userEvent.setup();
		const snippet = "export const STACK = 'prod';";

		installClipboard();

		render(<CodeBlock code={snippet} />);

		await user.click(screen.getByRole("button", { name: "Copy to clipboard" }));
		expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
		expect(clipboardStore.text).toBe(snippet);
	});

	it("renders aria-hidden line numbers when enabled", () => {
		const { container } = render(<CodeBlock code={"alpha\nbeta"} showLineNumbers showCopy={false} />);
		expect(container.querySelector("[data-slot='code-block']")).toHaveAttribute("data-line-numbers", "true");

		const numbers = container.querySelectorAll("[data-slot='code-block-line-number']");
		expect(numbers).toHaveLength(2);
		expect(numbers[0]).toHaveAttribute("aria-hidden", "true");
		expect(numbers[0]).toHaveTextContent("1");
		expect(numbers[1]).toHaveTextContent("2");
		expect(screen.getByText("alpha")).toBeInTheDocument();
		expect(screen.getByText("beta")).toBeInTheDocument();
	});

	it("applies tabSize to the pre via CSS tab-size", () => {
		const { container } = render(<CodeBlock code={"a\tb"} tabSize={4} showCopy={false} />);
		const root = container.querySelector("[data-slot='code-block']");
		expect(root).toHaveAttribute("data-tab-size", "4");
		expect(container.querySelector("[data-slot='code-block-pre']")).toHaveStyle({ tabSize: "4" });
	});

	it("applies aria-label to the pre region", () => {
		const { container } = render(<CodeBlock code="echo hi" aria-label="Shell snippet" showCopy={false} />);
		expect(container.querySelector("[data-slot='code-block-pre']")).toHaveAttribute("aria-label", "Shell snippet");
	});

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(
			<CodeBlock code={'resource "aws_vpc" "main" {}'} language="hcl" aria-label="VPC resource" />,
		);
	});
});
