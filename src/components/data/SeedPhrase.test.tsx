import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { DEFAULT_WORD_SLOT_CH, SeedPhrase } from "./SeedPhrase.js";

const WORDS = ["alpha", "bravo", "charlie", "delta"];
const MASK = "•".repeat(DEFAULT_WORD_SLOT_CH);

describe("SeedPhrase", () => {
	it("masks words until revealed", async () => {
		const user = userEvent.setup();

		render(<SeedPhrase words={WORDS} defaultRevealed={false} />);

		expect(
			screen.getByRole("list", { name: "Seed phrase words" }),
		).toBeInTheDocument();
		expect(screen.queryByText("alpha")).not.toBeInTheDocument();
		expect(screen.getAllByText(MASK)).toHaveLength(4);

		await user.click(
			screen.getByRole("button", { name: "Reveal seed phrase" }),
		);
		expect(screen.getByText("alpha")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Hide seed phrase" }),
		).toHaveAttribute("aria-pressed", "true");
	});

	it.each([
		{
			label: "4 words default -> 4 cols",
			words: WORDS,
			expected: "4",
		},
		{
			label: "12 words default -> 4 cols",
			words: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"],
			expected: "4",
		},
		{
			label: "15 words default -> 3 cols",
			words: [
				"a",
				"b",
				"c",
				"d",
				"e",
				"f",
				"g",
				"h",
				"i",
				"j",
				"k",
				"l",
				"m",
				"n",
				"o",
			],
			expected: "3",
		},
		{
			label: "18 words default -> 3 cols",
			words: [
				"a",
				"b",
				"c",
				"d",
				"e",
				"f",
				"g",
				"h",
				"i",
				"j",
				"k",
				"l",
				"m",
				"n",
				"o",
				"p",
				"q",
				"r",
			],
			expected: "3",
		},
		{
			label: "24 words default -> 4 cols",
			words: [
				"a",
				"b",
				"c",
				"d",
				"e",
				"f",
				"g",
				"h",
				"i",
				"j",
				"k",
				"l",
				"m",
				"n",
				"o",
				"p",
				"q",
				"r",
				"s",
				"t",
				"u",
				"v",
				"w",
				"x",
			],
			expected: "4",
		},
	])("$label", ({ words, expected }) => {
		render(<SeedPhrase words={words} defaultRevealed={false} />);

		const list = screen.getByRole("list", {
			name: "Seed phrase words",
		});
		expect(list).toHaveAttribute("data-columns", expected);
		expect(list).toHaveAttribute("data-word-count", String(words.length));
	});

	it("honors explicit columns prop", () => {
		render(
			<SeedPhrase words={WORDS} columns={2} defaultRevealed={false} />,
		);

		expect(
			screen.getByRole("list", { name: "Seed phrase words" }),
		).toHaveAttribute("data-columns", "2");
	});

	it("keeps fixed word slot width across reveal toggle", async () => {
		const user = userEvent.setup();

		render(<SeedPhrase words={WORDS} defaultRevealed={false} />);

		const list = screen.getByRole("list", { name: "Seed phrase words" });
		const firstSlot = list.querySelector("li span:last-child");
		expect(firstSlot).not.toBeNull();
		expect(firstSlot).toHaveStyle({
			width: `${String(DEFAULT_WORD_SLOT_CH)}ch`,
		});

		await user.click(
			screen.getByRole("button", { name: "Reveal seed phrase" }),
		);

		expect(firstSlot).toHaveStyle({
			width: `${String(DEFAULT_WORD_SLOT_CH)}ch`,
		});
	});

	it("renders verify inputs and reports word changes", async () => {
		const user = userEvent.setup();
		const changes: { index: number; value: string }[] = [];

		function Harness() {
			const [values, setValues] = useState(["", "", "", ""]);

			return (
				<SeedPhrase
					words={WORDS}
					verifyMode
					defaultRevealed
					values={values}
					onWordChange={(index, value) => {
						changes.push({ index, value });
						setValues((current) => {
							const next = [...current];
							next[index] = value;
							return next;
						});
					}}
				/>
			);
		}

		render(<Harness />);

		const first = screen.getByRole("textbox", { name: "Word 1" });
		await user.type(first, "alp");
		expect(first).toHaveValue("alp");
		expect(changes.at(-1)).toEqual({ index: 0, value: "alp" });
	});

	it.each([
		{ showCopy: true, revealed: true, present: true },
		{ showCopy: true, revealed: false, present: true },
		{ showCopy: false, revealed: true, present: false },
		{ showCopy: false, revealed: false, present: false },
	])(
		"copy present=$present when showCopy=$showCopy revealed=$revealed",
		({ showCopy, revealed, present }) => {
			render(
				<SeedPhrase
					words={WORDS}
					defaultRevealed={revealed}
					showCopy={showCopy}
				/>,
			);

			const copy = screen.queryByRole("button", {
				name: "Copy seed phrase",
			});
			expect(copy !== null).toBe(present);
		},
	);

	it("has no accessibility violations when hidden", async () => {
		await expectNoA11yViolations(
			<SeedPhrase words={WORDS} defaultRevealed={false} />,
		);
	});

	it("has no accessibility violations when revealed", async () => {
		const { container } = render(
			<SeedPhrase words={WORDS} defaultRevealed />,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
