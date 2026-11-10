import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { TagInput } from "./TagInput.js";

describe("TagInput", () => {
	it("adds a tag on Enter", async () => {
		const user = userEvent.setup();
		const batches: string[][] = [];

		function Harness() {
			const [tags, setTags] = useState<string[]>([]);
			return (
				<TagInput
					aria-label="Tags"
					value={tags}
					onChange={(next) => {
						batches.push(next);
						setTags(next);
					}}
				/>
			);
		}

		render(<Harness />);

		const input = screen.getByPlaceholderText("Add tag");

		await user.type(input, "env:prod{Enter}");

		expect(batches.at(-1)).toEqual(["env:prod"]);
		expect(screen.getByRole("button", { name: "Remove env:prod" })).toBeInTheDocument();
	});

	it("removes a tag via chip", async () => {
		const user = userEvent.setup();
		const batches: string[][] = [];

		function Harness() {
			const [tags, setTags] = useState(["a", "b"]);
			return (
				<TagInput
					value={tags}
					onChange={(next) => {
						batches.push(next);
						setTags(next);
					}}
				/>
			);
		}

		render(<Harness />);

		await user.click(screen.getByRole("button", { name: "Remove a" }));
		expect(batches.at(-1)).toEqual(["b"]);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<TagInput aria-label="Tags" />);
	});
});
