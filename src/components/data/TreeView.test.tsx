import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { TreeView } from "./TreeView.js";

const NETWORK = [
	{
		id: "vpc",
		label: "vpc-prod",
		children: [
			{
				id: "subnet-a",
				label: "subnet-a",
				children: [
					{ id: "eni-1", label: "eni-1a" },
					{ id: "eni-2", label: "eni-1b", disabled: true },
				],
			},
			{ id: "subnet-b", label: "subnet-b" },
		],
	},
	{ id: "igw", label: "igw-main" },
];

describe("TreeView", () => {
	it("renders a tree with collapsed parents by default", () => {
		render(<TreeView aria-label="Network" items={NETWORK} />);

		expect(
			screen.getByRole("tree", { name: "Network" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("treeitem", { name: "subnet-a" })).toBeNull();
		expect(
			screen.getByRole("treeitem", { name: "igw-main" }),
		).toBeInTheDocument();
	});

	it("expands on ArrowRight and moves to child on second ArrowRight", async () => {
		const user = userEvent.setup();
		render(<TreeView aria-label="Network" items={NETWORK} />);

		const vpc = screen.getByRole("treeitem", { name: "vpc-prod" });
		vpc.focus();

		await user.keyboard("{ArrowRight}");
		expect(vpc).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toBeInTheDocument();

		await user.keyboard("{ArrowRight}");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveFocus();
	});

	it("collapses on ArrowLeft and returns to parent", async () => {
		const user = userEvent.setup();
		render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc", "subnet-a"]}
			/>,
		);

		const eni = screen.getByRole("treeitem", { name: "eni-1a" });
		eni.focus();

		await user.keyboard("{ArrowLeft}");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveFocus();

		await user.keyboard("{ArrowLeft}");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveAttribute("aria-expanded", "false");
	});

	it("activates end nodes with Enter and toggles parents", async () => {
		const user = userEvent.setup();
		const activated: string[] = [];

		render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc", "subnet-a"]}
				onActivate={(id) => {
					activated.push(id);
				}}
			/>,
		);

		screen.getByRole("treeitem", { name: "eni-1a" }).focus();
		await user.keyboard("{Enter}");
		expect(activated).toEqual(["eni-1"]);

		screen.getByRole("treeitem", { name: "subnet-a" }).focus();
		await user.keyboard("{Enter}");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveAttribute("aria-expanded", "false");
		expect(activated).toEqual(["eni-1"]);
	});

	it("skips disabled nodes on ArrowDown", async () => {
		const user = userEvent.setup();
		render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc", "subnet-a"]}
			/>,
		);

		screen.getByRole("treeitem", { name: "eni-1a" }).focus();

		await user.keyboard("{ArrowDown}");
		expect(
			screen.getByRole("treeitem", { name: "subnet-b" }),
		).toHaveFocus();
	});

	it("reports expandedIds when controlled", async () => {
		const user = userEvent.setup();
		let expanded = ["vpc"];
		const { rerender } = render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				expandedIds={expanded}
				onExpandedIdsChange={(ids) => {
					expanded = ids;
				}}
			/>,
		);

		screen.getByRole("treeitem", { name: "vpc-prod" }).focus();

		await user.keyboard("{Enter}");
		expect(expanded).not.toContain("vpc");

		rerender(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				expandedIds={expanded}
				onExpandedIdsChange={(ids) => {
					expanded = ids;
				}}
			/>,
		);
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "false");
	});

	it("does not collapse ancestors when a child is clicked", async () => {
		const user = userEvent.setup();
		const activated: string[] = [];

		render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc", "subnet-a"]}
				onActivate={(id) => {
					activated.push(id);
				}}
			/>,
		);

		await user.click(screen.getByRole("treeitem", { name: "eni-1a" }));
		expect(activated).toEqual(["eni-1"]);
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "eni-1a" }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("treeitem", { name: "subnet-b" }));
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "subnet-b" }),
		).toBeInTheDocument();
	});

	it("expands a nested parent on click without collapsing its ancestor", async () => {
		const user = userEvent.setup();
		render(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc"]}
			/>,
		);

		await user.click(screen.getByRole("treeitem", { name: "subnet-a" }));
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "subnet-a" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "eni-1a" }),
		).toBeInTheDocument();
	});

	it("renders item.end without changing the accessible name", () => {
		const { container } = render(
			<TreeView
				aria-label="Network"
				items={[
					{
						id: "vpc",
						label: "vpc-prod",
						end: <span data-testid="vpc-pill">3 AZ</span>,
					},
				]}
			/>,
		);

		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toBeInTheDocument();
		expect(screen.getByTestId("vpc-pill")).toHaveTextContent("3 AZ");
		expect(
			container.querySelector("[data-slot='tree-view-end']"),
		).not.toBeNull();
	});

	it("aligns item.end snug or justify", () => {
		const { container, rerender } = render(
			<TreeView
				aria-label="Network"
				endAlign="snug"
				items={[
					{
						id: "vpc",
						label: "vpc-prod",
						end: <span>3 AZ</span>,
					},
				]}
			/>,
		);
		expect(
			container.querySelector("[data-slot='tree-view-end']"),
		).toHaveAttribute("data-align", "snug");
		expect(
			container.querySelector("[data-slot='tree-view-end']"),
		).not.toHaveClass("ml-auto");

		rerender(
			<TreeView
				aria-label="Network"
				endAlign="justify"
				items={[
					{
						id: "vpc",
						label: "vpc-prod",
						end: <span>3 AZ</span>,
					},
				]}
			/>,
		);
		expect(
			container.querySelector("[data-slot='tree-view-end']"),
		).toHaveAttribute("data-align", "justify");
		expect(
			container.querySelector("[data-slot='tree-view-end']"),
		).toHaveClass("ml-auto");
	});

	it("does not toggle expand when clicking item.end", async () => {
		const user = userEvent.setup();
		render(
			<TreeView
				aria-label="Network"
				items={[
					{
						id: "vpc",
						label: "vpc-prod",
						end: <span data-testid="vpc-pill">pill</span>,
						children: [{ id: "child", label: "child" }],
					},
				]}
				defaultExpandedIds={["vpc"]}
			/>,
		);

		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "child" }),
		).toBeInTheDocument();

		await user.click(screen.getByTestId("vpc-pill"));
		expect(
			screen.getByRole("treeitem", { name: "vpc-prod" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("treeitem", { name: "child" }),
		).toBeInTheDocument();
	});

	it("moves focus with typeahead", async () => {
		const user = userEvent.setup();
		render(<TreeView aria-label="Network" items={NETWORK} />);

		screen.getByRole("treeitem", { name: "vpc-prod" }).focus();

		await user.keyboard("i");
		expect(
			screen.getByRole("treeitem", { name: "igw-main" }),
		).toHaveFocus();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<TreeView
				aria-label="Network"
				items={NETWORK}
				defaultExpandedIds={["vpc"]}
			/>,
		);
	});
});
