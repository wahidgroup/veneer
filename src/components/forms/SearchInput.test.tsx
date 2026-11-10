import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { SearchInput } from "./SearchInput.js";

describe("SearchInput", () => {
	it("updates the value and clears", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<SearchInput
				debounceMs={0}
				onValueChange={(value) => {
					values.push(value);
				}}
			/>,
		);

		const input = screen.getByRole("searchbox");
		await user.type(input, "eks");
		expect(input).toHaveValue("eks");

		await user.click(screen.getByRole("button", { name: "Clear search" }));
		expect(input).toHaveValue("");
	});

	it("syncs draft when controlled value changes", () => {
		const { rerender } = render(<SearchInput value="alpha" debounceMs={0} />);
		expect(screen.getByRole("searchbox")).toHaveValue("alpha");

		rerender(<SearchInput value="beta" debounceMs={0} />);
		expect(screen.getByRole("searchbox")).toHaveValue("beta");
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<SearchInput debounceMs={0} />);
	});
});
