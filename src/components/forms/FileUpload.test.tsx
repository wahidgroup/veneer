import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { FileUpload } from "./FileUpload.js";

describe("FileUpload", () => {
	it("selects a file via the hidden input", async () => {
		const user = userEvent.setup();
		const batches: File[][] = [];
		const file = new File(["hello"], "template.yaml", {
			type: "text/yaml",
		});

		render(
			<FileUpload
				onChange={(next) => {
					batches.push(next);
				}}
			/>,
		);

		const input = screen.getByLabelText("Drop files here or browse");
		await user.upload(input, file);

		expect(batches.at(-1)?.[0]?.name).toBe("template.yaml");
		expect(
			screen.getByRole("button", { name: "Remove template.yaml" }),
		).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(<FileUpload />);
	});
});
