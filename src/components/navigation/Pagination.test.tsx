import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Pagination } from "./Pagination.js";

function noopPageChange(_pageIndex: number): void {
	/* intentional no-op for static renders */
}

interface HarnessProps {
	initialPageIndex?: number;
	pageCount?: number;
	itemCount?: number;
	pageSize?: number;
	disabled?: boolean;
	className?: string;
	"aria-label"?: string;
}

function PaginationHarness({
	initialPageIndex,
	pageCount,
	itemCount,
	pageSize,
	disabled,
	className,
	"aria-label": ariaLabel,
}: HarnessProps) {
	let startIndex = initialPageIndex;
	startIndex ??= 0;

	let totalPages = pageCount;
	totalPages ??= 5;

	const [pageIndex, setPageIndex] = useState(startIndex);

	return (
		<Pagination
			pageIndex={pageIndex}
			pageCount={totalPages}
			itemCount={itemCount}
			pageSize={pageSize}
			disabled={disabled}
			className={className}
			aria-label={ariaLabel}
			onPageChange={setPageIndex}
		/>
	);
}

describe("Pagination", () => {
	it("renders a labelled navigation landmark with page status", () => {
		render(<Pagination pageIndex={0} pageCount={4} onPageChange={noopPageChange} />);
		expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
		expect(screen.getByText("Page 1 of 4")).toBeInTheDocument();
	});

	it("uses a custom aria-label on the nav landmark", () => {
		render(<Pagination pageIndex={0} pageCount={2} aria-label="Stacks" onPageChange={noopPageChange} />);
		expect(screen.getByRole("navigation", { name: "Stacks" })).toBeInTheDocument();
	});

	it.each([
		{
			pageIndex: 0,
			pageSize: 10,
			itemCount: 87,
			label: "1–10 of 87",
		},
		{
			pageIndex: 8,
			pageSize: 10,
			itemCount: 87,
			label: "81–87 of 87",
		},
		{
			pageIndex: 0,
			pageSize: 25,
			itemCount: 0,
			label: "0 rows",
		},
	])("shows range $label for pageIndex $pageIndex", ({ pageIndex, pageSize, itemCount, label }) => {
		render(
			<Pagination
				pageIndex={pageIndex}
				pageCount={9}
				pageSize={pageSize}
				itemCount={itemCount}
				onPageChange={noopPageChange}
			/>,
		);
		expect(screen.getByText(label)).toBeInTheDocument();
	});

	it("omits the range when itemCount is not provided", () => {
		const { container } = render(<Pagination pageIndex={0} pageCount={3} onPageChange={noopPageChange} />);
		expect(container.querySelector("[data-slot='pagination-range']")).toBeNull();
	});

	it("disables Previous on the first page and Next on the last", () => {
		const { rerender } = render(<Pagination pageIndex={0} pageCount={3} onPageChange={noopPageChange} />);
		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

		rerender(<Pagination pageIndex={2} pageCount={3} onPageChange={noopPageChange} />);
		expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
	});

	it("force-disables both controls when disabled is set", () => {
		render(<Pagination pageIndex={1} pageCount={4} disabled onPageChange={noopPageChange} />);

		expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
	});

	it("advances and retreats the controlled pageIndex", async () => {
		const user = userEvent.setup();

		render(<PaginationHarness pageCount={3} />);
		expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next page" }));
		expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();

		await user.click(screen.getByRole("button", { name: "Previous page" }));
		expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Pagination pageIndex={1} pageCount={5} pageSize={10} itemCount={47} onPageChange={noopPageChange} />,
		);
	});
});
