import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import { Stepper, StepperActions } from "./Stepper.js";

const STEPS = [
	{ id: "account", label: "Account", description: "Sign in" },
	{ id: "verify", label: "Verify", description: "Confirm identity" },
	{ id: "done", label: "Done", description: "Complete" },
];

function noop(): void {
	/* intentional no-op */
}

describe("Stepper", () => {
	it("marks current, complete, and upcoming steps", () => {
		render(<Stepper steps={STEPS} value="verify" />);

		expect(screen.getByText("Account").closest("li")).toHaveAttribute("data-state", "complete");
		expect(screen.getByText("Verify").closest("li")).toHaveAttribute("data-state", "current");
		expect(screen.getByText("Done").closest("li")).toHaveAttribute("data-state", "upcoming");
		expect(screen.getByText("Verify").closest("li")).toHaveAttribute("aria-current", "step");
	});

	it("fires onNext and onBack from StepperActions", async () => {
		const user = userEvent.setup();
		const events: string[] = [];

		render(
			<Stepper steps={STEPS} defaultValue="verify">
				<StepperActions
					onBack={() => {
						events.push("back");
					}}
					onNext={() => {
						events.push("next");
					}}
				/>
			</Stepper>,
		);

		expect(screen.getByRole("button", { name: "Back" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Back" }));
		expect(events).toEqual(["back"]);

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(events).toEqual(["back", "next"]);
	});

	it.each([
		{
			step: "account",
			backDisabled: true,
			forwardLabel: "Next",
		},
		{
			step: "done",
			backDisabled: false,
			forwardLabel: "Finish",
		},
	])("at $step: Back disabled=$backDisabled, forward=$forwardLabel", ({ step, backDisabled, forwardLabel }) => {
		render(
			<Stepper steps={STEPS} value={step}>
				<StepperActions onBack={noop} onNext={noop} />
			</Stepper>,
		);

		const back = screen.getByRole("button", { name: "Back" });
		expect(back).toHaveProperty("disabled", backDisabled);
		expect(screen.getByRole("button", { name: forwardLabel })).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		await expectNoA11yViolations(
			<Stepper steps={STEPS} value="verify">
				<StepperActions onBack={noop} onNext={noop} />
			</Stepper>,
		);
	});
});
