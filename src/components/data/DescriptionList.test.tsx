import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { DescriptionList } from "./DescriptionList.js";

describe("DescriptionList", () => {
	it("renders terms and descriptions", () => {
		render(
			<DescriptionList
				items={[
					{ term: "Region", description: "us-east-1" },
					{ term: "Stack", description: "prod-api" },
				]}
			/>,
		);
		expect(screen.getByText("Region")).toBeInTheDocument();
		expect(screen.getByText("us-east-1")).toBeInTheDocument();
		expect(screen.getByText("Stack")).toBeInTheDocument();
		expect(screen.getByText("prod-api")).toBeInTheDocument();
	});

	it.each([{ columns: 1 as const }, { columns: 2 as const }])("applies columns $columns", ({ columns }) => {
		const { container } = render(<DescriptionList columns={columns} items={[{ term: "A", description: "1" }]} />);
		expect(container.querySelector("[data-slot='description-list']")).toHaveAttribute(
			"data-columns",
			String(columns),
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<DescriptionList items={[{ term: "ARN", description: "arn:aws:…" }]} />);
	});
});
