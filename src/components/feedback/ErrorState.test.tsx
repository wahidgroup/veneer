import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Button } from "../forms/Button.js";
import { ErrorState } from "./ErrorState.js";

describe("ErrorState", () => {
	it("renders alert role with error defaults", () => {
		const { container } = render(<ErrorState />);

		const alert = screen.getByRole("alert");
		expect(alert).toHaveAttribute("data-slot", "error-state");
		expect(alert).toHaveAttribute("data-kind", "error");
		expect(alert).toHaveAttribute("data-size", "md");
		expect(screen.getByText("Unable to load")).toBeInTheDocument();
		expect(
			container.querySelector("[data-slot='error-state-icon']"),
		).not.toBeNull();
	});

	it("uses forbidden soft title and kind", () => {
		render(<ErrorState kind="forbidden" />);
		expect(screen.getByRole("alert")).toHaveAttribute(
			"data-kind",
			"forbidden",
		);
		expect(screen.getByText("Access denied")).toBeInTheDocument();
	});

	it("overrides the soft title when title is provided", () => {
		render(<ErrorState title="Deploy failed" />);
		expect(screen.getByText("Deploy failed")).toBeInTheDocument();
		expect(screen.queryByText("Unable to load")).not.toBeInTheDocument();
	});

	it("uses soft title when title is null", () => {
		render(<ErrorState title={null} />);
		expect(screen.getByText("Unable to load")).toBeInTheDocument();
	});

	it("renders supporting description and action", () => {
		render(
			<ErrorState
				title="Request timed out"
				action={<Button type="button">Retry</Button>}
			>
				Check the network and try again.
			</ErrorState>,
		);
		expect(
			screen.getByText("Check the network and try again."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Retry" }),
		).toBeInTheDocument();
	});

	it("hides the icon when icon is null", () => {
		const { container } = render(<ErrorState icon={null} />);
		expect(
			container.querySelector("[data-slot='error-state-icon']"),
		).toBeNull();
	});

	it("uses a custom icon when provided", () => {
		render(
			<ErrorState
				title="Custom"
				icon={<span data-testid="custom-error-icon">!</span>}
			/>,
		);
		expect(screen.getByTestId("custom-error-icon")).toBeInTheDocument();
		expect(
			screen
				.getByRole("alert")
				.querySelector("[data-slot='error-state-icon']"),
		).toBeNull();
	});

	it.each([{ size: "sm" as const }, { size: "md" as const }])(
		"applies size $size",
		({ size }) => {
			render(<ErrorState title="Sized" size={size} />);
			expect(screen.getByRole("alert")).toHaveAttribute(
				"data-size",
				size,
			);
		},
	);

	it("has no accessibility violations on the default render", async () => {
		await expectNoA11yViolations(<ErrorState />);
	});

	it("has no accessibility violations for forbidden with action", async () => {
		await expectNoA11yViolations(
			<ErrorState
				kind="forbidden"
				size="sm"
				action={<Button type="button">Request access</Button>}
			>
				You need permission to view this stack.
			</ErrorState>,
		);
	});
});
