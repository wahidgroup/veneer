import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type {
	WorkflowOrientation,
	WorkflowStepStatus,
} from "@wahidgroup/veneer";
import {
	Button,
	FieldError,
	Input,
	Label,
	Select,
	Workflow,
	WorkflowActions,
	WorkflowPanel,
	WorkflowStep,
	WorkflowTrack,
} from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

interface EdgeNode {
	id: string;
	name: string;
}

function statusForStep(
	id: string,
	current: string,
	order: string[],
): WorkflowStepStatus {
	if (id === current) {
		return "current";
	}

	const currentIndex = order.indexOf(current);
	const idIndex = order.indexOf(id);
	if (idIndex >= 0 && idIndex < currentIndex) {
		return "complete";
	}

	return "pending";
}

function LinearDeployCanvas() {
	const [step, setStep] = useState("region");
	const [region, setRegion] = useState("us-east-1");
	const [plan, setPlan] = useState("pro");
	const [orientation, setOrientation] =
		useState<WorkflowOrientation>("horizontal");

	const order = ["region", "plan", "confirm"];

	let regionValid = region.length > 0;
	let planValid = plan.length > 0;

	let canNext = true;
	let nextHint = "";
	if (step === "region") {
		canNext = regionValid;
		if (!regionValid) {
			nextHint = "Choose a region to continue.";
		}
	} else if (step === "plan") {
		canNext = planValid;
		if (!planValid) {
			nextHint = "Choose a plan to continue.";
		}
	}

	let regionError: ReactNode = null;
	if (step === "region" && nextHint.length > 0) {
		regionError = <FieldError>{nextHint}</FieldError>;
	}

	let planError: ReactNode = null;
	if (step === "plan" && nextHint.length > 0) {
		planError = <FieldError>{nextHint}</FieldError>;
	}

	return (
		<Canvas>
			<div className="mb-4 flex flex-wrap gap-2">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					aria-pressed={orientation === "horizontal"}
					onClick={() => {
						setOrientation("horizontal");
					}}
				>
					Horizontal
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					aria-pressed={orientation === "vertical"}
					onClick={() => {
						setOrientation("vertical");
					}}
				>
					Vertical
				</Button>
			</div>
			<Workflow
				value={step}
				onValueChange={setStep}
				orientation={orientation}
			>
				<WorkflowTrack aria-label="Deploy progress">
					<WorkflowStep
						value="region"
						status={statusForStep("region", step, order)}
					>
						Region
					</WorkflowStep>
					<WorkflowStep
						value="plan"
						status={statusForStep("plan", step, order)}
					>
						Plan
					</WorkflowStep>
					<WorkflowStep
						value="confirm"
						status={statusForStep("confirm", step, order)}
					>
						Confirm
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="region" title="Region">
					<div className="flex max-w-sm flex-col gap-2">
						<Label htmlFor="deploy-region">Region</Label>
						<Select
							id="deploy-region"
							value={region}
							options={[
								{ value: "", label: "Select region" },
								{ value: "us-east-1", label: "US East" },
								{ value: "eu-west-1", label: "EU West" },
								{
									value: "ap-southeast-1",
									label: "AP Southeast",
								},
							]}
							onChange={(event) => {
								setRegion(event.target.value);
							}}
						/>
						{regionError}
					</div>
				</WorkflowPanel>
				<WorkflowPanel value="plan" title="Plan">
					<div className="flex max-w-sm flex-col gap-2">
						<Label htmlFor="deploy-plan">Plan</Label>
						<Select
							id="deploy-plan"
							value={plan}
							options={[
								{ value: "", label: "Select plan" },
								{ value: "starter", label: "Starter" },
								{ value: "pro", label: "Pro" },
								{ value: "scale", label: "Scale" },
							]}
							onChange={(event) => {
								setPlan(event.target.value);
							}}
						/>
						{planError}
					</div>
				</WorkflowPanel>
				<WorkflowPanel value="confirm" title="Confirm">
					<p className="text-sm text-muted-foreground">
						Deploy {plan} in {region}.
					</p>
				</WorkflowPanel>
				<WorkflowActions
					canNext={canNext}
					finishLabel="Deploy"
					onFinish={() => {
						setStep("region");
					}}
				/>
			</Workflow>
		</Canvas>
	);
}

function LinearDeployKnobs() {
	return (
		<RailPanel
			title="Linear deploy"
			description="Region → plan → confirm. Parent owns canNext + FieldError. Toggle track orientation on the canvas."
		>
			<DemoRow label="Model">
				<span className="text-sm text-muted-foreground">
					Controlled value + status per step
				</span>
			</DemoRow>
		</RailPanel>
	);
}

function MultiNodeCanvas() {
	const [nodes, setNodes] = useState<EdgeNode[]>(() => {
		return [
			{ id: "edge-1", name: "edge-1" },
			{ id: "edge-2", name: "edge-2" },
		];
	});
	const [names, setNames] = useState<Record<string, string>>({
		"edge-1": "edge-1",
		"edge-2": "edge-2",
	});
	const [step, setStep] = useState("cluster");

	const stepIds = useMemo(() => {
		const ids = ["cluster"];
		for (const node of nodes) {
			ids.push(`node:${node.id}`);
		}

		ids.push("review");

		return ids;
	}, [nodes]);

	let canNext = true;
	let nextHint = "";
	if (step.startsWith("node:")) {
		const nodeId = step.slice("node:".length);
		const name = names[nodeId];
		if (name === undefined || name.trim().length === 0) {
			canNext = false;
			nextHint = "Hostname is required.";
		}
	}

	return (
		<Canvas>
			<div className="mb-4">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						const id = `edge-${String(nodes.length + 1)}`;
						setNodes((prev) => {
							return [...prev, { id, name: id }];
						});
						setNames((prev) => {
							return { ...prev, [id]: id };
						});
					}}
				>
					Add node
				</Button>
			</div>
			<Workflow value={step} onValueChange={setStep}>
				<WorkflowTrack aria-label="Cluster setup">
					<WorkflowStep
						value="cluster"
						status={statusForStep("cluster", step, stepIds)}
					>
						Cluster
					</WorkflowStep>
					{nodes.map((node) => {
						return (
							<WorkflowStep
								key={node.id}
								value={`node:${node.id}`}
								status={statusForStep(
									`node:${node.id}`,
									step,
									stepIds,
								)}
							>
								Node — {node.name}
							</WorkflowStep>
						);
					})}
					<WorkflowStep
						value="review"
						status={statusForStep("review", step, stepIds)}
					>
						Review
					</WorkflowStep>
				</WorkflowTrack>
				<WorkflowPanel value="cluster" title="Cluster">
					<p className="text-sm text-muted-foreground">
						Choose a region and capacity profile for the cluster.
					</p>
				</WorkflowPanel>
				{nodes.map((node) => {
					const stepId = `node:${node.id}`;
					let nameValue = "";
					if (names[node.id] !== undefined) {
						nameValue = names[node.id];
					}

					let hostnameError: ReactNode = null;
					if (step === stepId && nextHint.length > 0) {
						hostnameError = <FieldError>{nextHint}</FieldError>;
					}

					return (
						<WorkflowPanel
							key={node.id}
							value={stepId}
							title={`Node — ${node.name}`}
						>
							<div className="flex max-w-sm flex-col gap-2">
								<Label htmlFor={`node-name-${node.id}`}>
									Hostname
								</Label>
								<Input
									id={`node-name-${node.id}`}
									value={nameValue}
									onChange={(event) => {
										const next = event.target.value;
										setNames((prev) => {
											return { ...prev, [node.id]: next };
										});
									}}
								/>
								{hostnameError}
							</div>
						</WorkflowPanel>
					);
				})}
				<WorkflowPanel value="review" title="Review">
					<ul className="list-inside list-disc text-sm text-muted-foreground">
						{nodes.map((node) => {
							let label = node.id;
							if (names[node.id] !== undefined) {
								label = names[node.id];
							}
							return <li key={node.id}>{label}</li>;
						})}
					</ul>
				</WorkflowPanel>
				<WorkflowActions
					canNext={canNext}
					finishLabel="Provision"
					onFinish={() => {
						setStep("cluster");
					}}
				/>
			</Workflow>
		</Canvas>
	);
}

function MultiNodeKnobs() {
	return (
		<RailPanel
			title="Multi-node setup"
			description="Cluster + N unique node:* step ids + review. Add node inserts another instance; FieldError when hostname empty."
		>
			<DemoRow label="Identity">
				<span className="text-sm text-muted-foreground">
					Opaque ids — never step type
				</span>
			</DemoRow>
		</RailPanel>
	);
}

export {
	LinearDeployCanvas,
	LinearDeployKnobs,
	MultiNodeCanvas,
	MultiNodeKnobs,
};
