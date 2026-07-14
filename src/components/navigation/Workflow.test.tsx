import type { ReactNode } from "react";
import { StrictMode, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "../../test/component-harness.js";
import {
	Workflow,
	WorkflowActions,
	WorkflowPanel,
	WorkflowStep,
	WorkflowTrack,
} from "./Workflow.js";

describe("Workflow", () => {
	it("emits onValueChange for Next and Back", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		function Harness() {
			const [step, setStep] = useState("region");
			return (
				<Workflow
					value={step}
					onValueChange={(next) => {
						values.push(next);
						setStep(next);
					}}
				>
					<WorkflowTrack aria-label="Deploy">
						<WorkflowStep value="region" status="current">
							Region
						</WorkflowStep>
						<WorkflowStep value="plan" status="pending">
							Plan
						</WorkflowStep>
						<WorkflowStep value="confirm" status="pending">
							Confirm
						</WorkflowStep>
					</WorkflowTrack>
					<WorkflowPanel value="region" title="Region">
						Region body
					</WorkflowPanel>
					<WorkflowPanel value="plan" title="Plan">
						Plan body
					</WorkflowPanel>
					<WorkflowPanel value="confirm" title="Confirm">
						Confirm body
					</WorkflowPanel>
					<WorkflowActions />
				</Workflow>
			);
		}

		render(<Harness />);

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values.at(-1)).toBe("plan");
		expect(screen.getByText("Plan body")).toBeVisible();

		await user.click(screen.getByRole("button", { name: "Back" }));
		expect(values.at(-1)).toBe("region");
	});

	it("shows Finish on the last step", async () => {
		const user = userEvent.setup();
		let finished = false;

		render(
			<Workflow defaultValue="confirm">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="complete">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="complete">
						Plan
					</WorkflowStep>
					<WorkflowStep value="confirm" status="current">
						Confirm
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowPanel value="confirm" title="Confirm">
					Confirm body
				</WorkflowPanel>
				<WorkflowActions
					onFinish={() => {
						finished = true;
					}}
				/>
			</Workflow>,
		);
		expect(
			screen.queryByRole("button", { name: "Next" }),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Finish" }));
		expect(finished).toBe(true);
	});

	it("blocks Next when canNext is false", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<Workflow
				defaultValue="region"
				onValueChange={(next) => {
					values.push(next);
				}}
			>
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region">Region</WorkflowStep>
					<WorkflowStep value="plan">Plan</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions canNext={false} />
			</Workflow>,
		);
		expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values).toEqual([]);
	});

	it("jumps to complete steps and not pending", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<Workflow
				defaultValue="plan"
				onValueChange={(next) => {
					values.push(next);
				}}
			>
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="complete">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="current">
						Plan
					</WorkflowStep>
					<WorkflowStep value="confirm" status="pending">
						Confirm
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowPanel value="confirm" title="Confirm">
					Confirm body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		await user.click(screen.getByRole("button", { name: /Region/ }));
		expect(values.at(-1)).toBe("region");
		expect(screen.getByText("Region body")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: /Confirm/ }),
		).not.toBeInTheDocument();
	});

	it("jumps to error steps", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		render(
			<Workflow
				defaultValue="plan"
				onValueChange={(next) => {
					values.push(next);
				}}
			>
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="error">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="current">
						Plan
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		await user.click(screen.getByRole("button", { name: /Region/ }));
		expect(values.at(-1)).toBe("region");
		expect(screen.getByText("Region body")).toBeVisible();
	});

	it("keeps inactive panels mounted and hidden", () => {
		const { container } = render(
			<Workflow defaultValue="region">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region">Region</WorkflowStep>
					<WorkflowStep value="plan">Plan</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		const panels = container.querySelectorAll(
			'[data-slot="workflow-panel"]',
		);
		expect(panels).toHaveLength(2);
		expect(panels[0]).not.toHaveAttribute("hidden");
		expect(panels[1]).toHaveAttribute("hidden");
	});

	it("sets aria-current from active value only", () => {
		render(
			<Workflow defaultValue="plan">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="current">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="pending">
						Plan
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		const current = screen.getAllByRole("listitem", { current: "step" });
		expect(current).toHaveLength(1);
		expect(current[0]).toHaveTextContent("Plan");
	});

	it("advances multi unique node ids in order", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		function Harness() {
			const [step, setStep] = useState("cluster");
			return (
				<Workflow
					value={step}
					onValueChange={(next) => {
						values.push(next);
						setStep(next);
					}}
				>
					<WorkflowTrack aria-label="Cluster setup">
						<WorkflowStep value="cluster">Cluster</WorkflowStep>
						<WorkflowStep value="node:a">Node A</WorkflowStep>
						<WorkflowStep value="node:b">Node B</WorkflowStep>
					</WorkflowTrack>
					<WorkflowPanel value="cluster" title="Cluster">
						Cluster body
					</WorkflowPanel>
					<WorkflowPanel value="node:a" title="Node A">
						Node A body
					</WorkflowPanel>
					<WorkflowPanel value="node:b" title="Node B">
						Node B body
					</WorkflowPanel>
					<WorkflowActions />
				</Workflow>
			);
		}

		render(<Harness />);

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values.at(-1)).toBe("node:a");

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values.at(-1)).toBe("node:b");
	});

	it("uses resolveNext for soft cycle", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		function Harness() {
			const [step, setStep] = useState("review");
			return (
				<Workflow
					value={step}
					onValueChange={(next) => {
						values.push(next);
						setStep(next);
					}}
					resolveNext={(current) => {
						if (current === "review") {
							return "node:a";
						}
						return undefined;
					}}
					isFinish={() => {
						return false;
					}}
				>
					<WorkflowTrack aria-label="Cluster setup">
						<WorkflowStep value="node:a">Node A</WorkflowStep>
						<WorkflowStep value="review">Review</WorkflowStep>
					</WorkflowTrack>
					<WorkflowPanel value="node:a" title="Node A">
						Node A body
					</WorkflowPanel>
					<WorkflowPanel value="review" title="Review">
						Review body
					</WorkflowPanel>
					<WorkflowActions />
				</Workflow>
			);
		}

		render(<Harness />);

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values.at(-1)).toBe("node:a");
	});

	it("registers a dynamically added step", async () => {
		const user = userEvent.setup();

		function Harness() {
			const [extra, setExtra] = useState(false);
			const [step, setStep] = useState("cluster");

			let extraStep: ReactNode = null;
			let extraPanel: ReactNode = null;
			if (extra) {
				extraStep = <WorkflowStep value="node:x">Node X</WorkflowStep>;
				extraPanel = (
					<WorkflowPanel value="node:x" title="Node X">
						Node X body
					</WorkflowPanel>
				);
			}

			return (
				<div>
					<button
						type="button"
						onClick={() => {
							setExtra(true);
						}}
					>
						Add node
					</button>
					<Workflow value={step} onValueChange={setStep}>
						<WorkflowTrack aria-label="Cluster setup">
							<WorkflowStep value="cluster">Cluster</WorkflowStep>
							{extraStep}
							<WorkflowStep value="review">Review</WorkflowStep>
						</WorkflowTrack>
						<WorkflowPanel value="cluster" title="Cluster">
							Cluster body
						</WorkflowPanel>
						{extraPanel}
						<WorkflowPanel value="review" title="Review">
							Review body
						</WorkflowPanel>
						<WorkflowActions />
					</Workflow>
				</div>
			);
		}

		render(<Harness />);

		await user.click(screen.getByRole("button", { name: "Add node" }));
		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(screen.getByText("Node X body")).toBeVisible();
	});

	it("marks the current step with aria-current step", () => {
		render(
			<Workflow defaultValue="plan">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="complete">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="current">
						Plan
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		const current = screen.getByRole("listitem", { current: "step" });
		expect(current).toHaveTextContent("Plan");
	});

	it("focuses the panel title when the step changes", async () => {
		const user = userEvent.setup();

		render(
			<Workflow defaultValue="region">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region">Region</WorkflowStep>
					<WorkflowStep value="plan">Plan</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		await user.click(screen.getByRole("button", { name: "Next" }));
		await waitFor(() => {
			expect(document.activeElement).toHaveTextContent("Plan");
		});
	});

	it("does not focus the panel title on initial mount", () => {
		render(
			<Workflow defaultValue="region">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region">Region</WorkflowStep>
					<WorkflowStep value="plan">Plan</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		const title = screen.getByRole("heading", { name: "Region" });
		expect(document.activeElement).not.toBe(title);
	});

	it("merges className onto root", () => {
		const { container } = render(
			<Workflow defaultValue="region" className="custom-workflow">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region">Region</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);

		expect(
			container.querySelector('[data-slot="workflow"]')?.className,
		).toContain("custom-workflow");
	});

	it("has no axe violations on default render", async () => {
		await expectNoA11yViolations(
			<Workflow defaultValue="region">
				<WorkflowTrack aria-label="Deploy progress">
					<WorkflowStep value="region" status="current">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="pending">
						Plan
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Pick a region
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Pick a plan
				</WorkflowPanel>
				<WorkflowActions />
			</Workflow>,
		);
	});

	it("advances Next under StrictMode", async () => {
		const user = userEvent.setup();
		const values: string[] = [];

		function Harness() {
			const [step, setStep] = useState("region");
			return (
				<Workflow
					value={step}
					onValueChange={(next) => {
						values.push(next);
						setStep(next);
					}}
				>
					<WorkflowTrack aria-label="Deploy">
						<WorkflowStep value="region">Region</WorkflowStep>
						<WorkflowStep value="plan">Plan</WorkflowStep>
						<WorkflowStep value="confirm">Confirm</WorkflowStep>
					</WorkflowTrack>
					<WorkflowPanel value="region" title="Region">
						Region body
					</WorkflowPanel>
					<WorkflowPanel value="plan" title="Plan">
						Plan body
					</WorkflowPanel>
					<WorkflowPanel value="confirm" title="Confirm">
						Confirm body
					</WorkflowPanel>
					<WorkflowActions />
				</Workflow>
			);
		}

		render(
			<StrictMode>
				<Harness />
			</StrictMode>,
		);

		await user.click(screen.getByRole("button", { name: "Next" }));
		expect(values).toEqual(["plan"]);
		expect(screen.getByText("Plan body")).toBeVisible();
	});

	it("renders connectors between steps and stacks labels under markers", async () => {
		const { container } = render(
			<Workflow defaultValue="region">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="complete">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="current">
						Plan
					</WorkflowStep>
					<WorkflowStep value="confirm" status="pending">
						Confirm
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
				<WorkflowPanel value="confirm" title="Confirm">
					Confirm body
				</WorkflowPanel>
			</Workflow>,
		);

		await waitFor(() => {
			expect(
				container.querySelectorAll("[data-slot='workflow-connector']")
					.length,
			).toBeGreaterThan(0);
		});

		const regionStep = container.querySelector(
			"[data-slot='workflow-step'][data-value='region']",
		);
		expect(regionStep?.className).toContain("flex-col");
	});

	it("uses a vertical rail with connectors when orientation is vertical", async () => {
		const { container } = render(
			<Workflow defaultValue="region" orientation="vertical">
				<WorkflowTrack aria-label="Deploy">
					<WorkflowStep value="region" status="current">
						Region
					</WorkflowStep>
					<WorkflowStep value="plan" status="pending">
						Plan
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					Region body
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					Plan body
				</WorkflowPanel>
			</Workflow>,
		);

		await waitFor(() => {
			expect(
				container.querySelectorAll("[data-slot='workflow-connector']")
					.length,
			).toBe(1);
		});

		const trackList = container.querySelector(
			"[data-slot='workflow-track'] ol",
		);
		expect(trackList?.className).toContain("flex-col");
	});
});
