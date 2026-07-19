import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ResourceGraph } from "./ResourceGraph.js";

const NODES = [
	{ id: "vpc", label: "VPC" },
	{ id: "subnet", label: "Subnet" },
	{ id: "sg", label: "SG" },
];

const EDGES = [
	{ from: "vpc", to: "subnet", label: "contains" },
	{ from: "subnet", to: "sg", label: "assoc" },
];

describe("ResourceGraph", () => {
	it("selects a node from the SVG", async () => {
		const user = userEvent.setup();
		const selected: string[] = [];

		render(
			<ResourceGraph
				aria-label="Network"
				nodes={NODES}
				edges={EDGES}
				onNodeSelect={(id) => {
					selected.push(id);
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Subnet" }));
		expect(selected).toEqual(["subnet"]);
	});

	it("lists edges for assistive technology", () => {
		render(
			<ResourceGraph aria-label="Network" nodes={NODES} edges={EDGES} />,
		);

		expect(screen.getByLabelText("Network edges")).toBeInTheDocument();
		expect(
			screen.getByText("vpc -> subnet (contains)"),
		).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ResourceGraph aria-label="Network" nodes={NODES} edges={EDGES} />,
		);
	});
});
