import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { DiffLine, DiffResource } from "./diffTypes.js";
import { expectNoA11yViolations } from "../../test/component-harness.js";
import { DiffView } from "./DiffView.js";

const SAMPLE_LINES: DiffLine[] = [
	{ kind: "hunk", text: "@@ -1,2 +1,2 @@" },
	{
		kind: "context",
		text: "keep",
		oldLineNumber: 1,
		newLineNumber: 1,
	},
	{ kind: "removed", text: "old", oldLineNumber: 2 },
	{ kind: "added", text: "new", newLineNumber: 2 },
];

const SAMPLE_RESOURCES: DiffResource[] = [
	{
		id: "bucket",
		kind: "create",
		path: "aws_s3_bucket.logs",
		summary: "New logging bucket",
	},
	{
		id: "sg",
		kind: "update",
		path: "aws_security_group.app",
		attributes: [
			{
				path: "ingress.0.cidr_blocks",
				before: '["10.0.0.0/8"]',
				after: '["10.0.0.0/16"]',
			},
		],
	},
	{
		id: "role",
		kind: "destroy",
		path: "aws_iam_role.legacy",
	},
];

describe("DiffView", () => {
	it("renders unified line markers and announces kinds", () => {
		render(
			<DiffView
				mode="lines"
				lines={SAMPLE_LINES}
				path="main.tf"
				aria-label="Template diff"
			/>,
		);
		expect(screen.getByText("main.tf")).toBeInTheDocument();
		expect(screen.getByText("+1")).toBeInTheDocument();
		expect(screen.getByText("−1")).toBeInTheDocument();
		expect(
			screen.getByRole("row", { name: /removed line 2: old/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("row", { name: /added line 2: new/ }),
		).toBeInTheDocument();
	});

	it("builds lines from oldText and newText", () => {
		render(
			<DiffView
				mode="lines"
				oldText={"a\nb\n"}
				newText={"a\nc\n"}
				aria-label="Built diff"
			/>,
		);
		expect(
			screen.getByRole("row", { name: /removed line 2: b/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("row", { name: /added line 2: c/ }),
		).toBeInTheDocument();
	});

	it("truncates when maxLines is exceeded", () => {
		const many: DiffLine[] = [];
		for (let i = 0; i < 5; i += 1) {
			many.push({
				kind: "added",
				text: `line-${String(i)}`,
				newLineNumber: i + 1,
			});
		}

		render(
			<DiffView
				mode="lines"
				lines={many}
				maxLines={2}
				aria-label="Truncated"
			/>,
		);
		expect(screen.getByText("Showing 2 of 5 lines")).toBeInTheDocument();
	});

	it.each([
		{ kind: "create" as const, label: "Create" },
		{ kind: "update" as const, label: "Update" },
		{ kind: "destroy" as const, label: "Destroy" },
	])("renders tree resource $kind", ({ kind, label }) => {
		render(
			<DiffView
				mode="tree"
				resources={[
					{
						id: kind,
						kind,
						path: `res.${kind}`,
					},
				]}
			/>,
		);
		expect(screen.getByText(label)).toBeInTheDocument();
		expect(screen.getByText(`res.${kind}`)).toBeInTheDocument();
	});

	it("expands attribute diffs", async () => {
		const user = userEvent.setup();
		render(
			<DiffView
				mode="tree"
				resources={SAMPLE_RESOURCES}
				aria-label="Plan diff"
			/>,
		);
		expect(
			screen.queryByText("ingress.0.cidr_blocks"),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Expand" }));
		expect(screen.getByText("ingress.0.cidr_blocks")).toBeInTheDocument();
		expect(screen.getByText('["10.0.0.0/8"]')).toBeInTheDocument();
		expect(screen.getByText('["10.0.0.0/16"]')).toBeInTheDocument();
	});

	it("shows empty state when tree has no resources", () => {
		render(<DiffView mode="tree" resources={[]} />);
		expect(screen.getByText("No changes")).toBeInTheDocument();
	});

	it("has no accessibility violations in lines mode", async () => {
		await expectNoA11yViolations(
			<DiffView mode="lines" lines={SAMPLE_LINES} path="a.ts" />,
		);
	});

	it("has no accessibility violations in tree mode", async () => {
		await expectNoA11yViolations(
			<DiffView mode="tree" resources={SAMPLE_RESOURCES} />,
		);
	});

	it("renders split layout without losing rows", () => {
		render(
			<DiffView
				mode="lines"
				lines={SAMPLE_LINES}
				layout="split"
				aria-label="Split diff"
			/>,
		);

		const table = screen.getByRole("table", { name: "Split diff" });
		expect(within(table).getAllByRole("row").length).toBeGreaterThan(0);
	});
});
