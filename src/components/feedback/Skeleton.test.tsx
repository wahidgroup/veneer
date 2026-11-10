import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Skeleton } from "./Skeleton.js";

describe("Skeleton", () => {
	it.each([
		{ shape: "line" as const },
		{ shape: "title" as const },
		{ shape: "avatar" as const },
		{ shape: "block" as const },
	])("applies shape $shape", ({ shape }) => {
		const { container } = render(<Skeleton shape={shape} />);
		expect(container.querySelector("[data-slot='skeleton']")).toHaveAttribute("data-shape", shape);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<Skeleton shape="block" />);
	});
});
