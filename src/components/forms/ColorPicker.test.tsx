import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { ColorPicker } from "./ColorPicker.js";

describe("ColorPicker", () => {
	it("renders group with default hex and copy control", () => {
		render(<ColorPicker label="Accent" defaultValue="#ff0000" />);

		expect(screen.getByRole("group", { name: "Accent" })).toHaveAttribute(
			"data-slot",
			"color-picker",
		);
		expect(screen.getByRole("textbox", { name: "Accent hex" })).toHaveValue(
			"#ff0000",
		);
		expect(
			screen.getByRole("button", { name: "Copy #ff0000" }),
		).toBeInTheDocument();
	});

	it("copies hex from the copy control", async () => {
		const user = userEvent.setup();

		render(<ColorPicker label="Accent" defaultValue="#aabbcc" />);

		await user.click(screen.getByRole("button", { name: "Copy #aabbcc" }));
		expect(await navigator.clipboard.readText()).toBe("#aabbcc");
	});

	it("copies rgb() when RGB mode is active", async () => {
		const user = userEvent.setup();

		render(<ColorPicker label="Accent" defaultValue="#ff0000" />);

		await user.click(screen.getByRole("radio", { name: "RGB" }));
		await user.click(
			screen.getByRole("button", { name: "Copy rgb(255, 0, 0)" }),
		);
		expect(await navigator.clipboard.readText()).toBe("rgb(255, 0, 0)");
	});

	it("reports hex changes from the hex field", async () => {
		const user = userEvent.setup();
		let last = "";

		render(
			<ColorPicker
				label="Accent"
				defaultValue="#000000"
				onValueChange={(hex) => {
					last = hex;
				}}
			/>,
		);

		const hexField = screen.getByRole("textbox", { name: "Accent hex" });
		await user.clear(hexField);
		await user.type(hexField, "#00ff00");
		await user.tab();
		expect(last).toBe("#00ff00");
	});

	it("rejects invalid hex and restores previous", async () => {
		const user = userEvent.setup();
		let last = "#112233";

		render(
			<ColorPicker
				label="Accent"
				defaultValue="#112233"
				onValueChange={(hex) => {
					last = hex;
				}}
			/>,
		);

		const hexField = screen.getByRole("textbox", { name: "Accent hex" });
		await user.clear(hexField);
		await user.type(hexField, "#zzzzzz");
		await user.tab();
		expect(last).toBe("#112233");
		expect(hexField).toHaveValue("#112233");
	});

	it("selects a swatch", async () => {
		const user = userEvent.setup();
		let last = "";

		render(
			<ColorPicker
				label="Accent"
				defaultValue="#000000"
				swatches={["#ff0000", "#00ff00"]}
				onValueChange={(hex) => {
					last = hex;
				}}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "#ff0000" }));
		expect(last).toBe("#ff0000");
		expect(screen.getByRole("radio", { name: "#ff0000" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
	});

	it("switches to RGB fields", async () => {
		const user = userEvent.setup();

		render(<ColorPicker label="Accent" defaultValue="#ff0000" />);

		await user.click(screen.getByRole("radio", { name: "RGB" }));
		expect(
			screen.getByRole("spinbutton", { name: "Accent red" }),
		).toHaveValue(255);
		expect(
			screen.getByRole("spinbutton", { name: "Accent green" }),
		).toHaveValue(0);
		expect(
			screen.getByRole("spinbutton", { name: "Accent blue" }),
		).toHaveValue(0);
	});

	it("nudges saturation with arrow keys on the SV slider", async () => {
		const user = userEvent.setup();
		let last = "";

		render(
			<ColorPicker
				label="Accent"
				defaultValue="#808080"
				onValueChange={(hex) => {
					last = hex;
				}}
			/>,
		);

		const sv = screen.getByRole("slider", {
			name: "Accent saturation and value",
		});
		sv.focus();
		await user.keyboard("{ArrowRight}");
		expect(last.length).toBeGreaterThan(0);
		expect(last).not.toBe("#808080");
	});

	it("merges className onto the root", () => {
		render(
			<ColorPicker
				label="Accent"
				defaultValue="#000000"
				className="mt-2"
			/>,
		);
		expect(screen.getByRole("group", { name: "Accent" })).toHaveClass(
			"mt-2",
		);
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<ColorPicker
				label="Accent"
				defaultValue="#3b82f6"
				swatches={["#000000", "#ffffff"]}
			/>,
		);
	});
});
