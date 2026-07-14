import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

import type {
	LogViewerLevel,
	LogViewerLine,
	WorkflowOrientation,
	WorkflowStepStatus,
} from "@wahidgroup/veneer";
import type { DiffResource } from "@wahidgroup/veneer/diff";
import {
	Button,
	FieldError,
	Input,
	Label,
	LogViewer,
	Select,
	Toggle,
	Workflow,
	WorkflowActions,
	WorkflowPanel,
	WorkflowStep,
	WorkflowTrack,
} from "@wahidgroup/veneer";
import { DiffView, PlanSummary } from "@wahidgroup/veneer/diff";

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
								Node - {node.name}
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
							title={`Node - ${node.name}`}
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
					Opaque ids - never step type
				</span>
			</DemoRow>
		</RailPanel>
	);
}

const DEMO_OLD = `resource "aws_s3_bucket" "logs" {
  bucket = "app-logs-dev"
}
`;

const DEMO_NEW = `resource "aws_s3_bucket" "logs" {
  bucket = "app-logs-prod"
  acl    = "private"
}
`;

const DEMO_RESOURCES: DiffResource[] = [
	{
		id: "bucket",
		kind: "create",
		path: "aws_s3_bucket.logs",
		summary: "New data bucket",
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
			{
				path: "tags.Name",
				before: "app-sg",
				after: "app-sg-v2",
			},
		],
	},
	{
		id: "role",
		kind: "destroy",
		path: "aws_iam_role.legacy",
	},
	{
		id: "lb",
		kind: "replace",
		path: "aws_lb.public",
		summary: "Name change forces replacement",
		attributes: [
			{
				path: "name",
				before: "public-alb",
				after: "edge-alb",
				forcesReplace: true,
			},
		],
	},
];

function DiffViewCanvas() {
	return (
		<Canvas>
			<DemoRow label="Lines (unified)">
				<div className="w-full max-w-2xl">
					<DiffView
						mode="lines"
						path="main.tf"
						oldText={DEMO_OLD}
						newText={DEMO_NEW}
						aria-label="Template diff"
					/>
				</div>
			</DemoRow>
			<DemoRow label="Lines (split)">
				<div className="w-full max-w-3xl">
					<DiffView
						mode="lines"
						layout="split"
						path="README.md"
						oldText={"# Docs\nOld paragraph.\n"}
						newText={"# Docs\nNew paragraph.\n"}
						aria-label="Doc diff"
					/>
				</div>
			</DemoRow>
			<DemoRow label="Tree (IaC)">
				<div className="w-full max-w-2xl">
					<DiffView
						mode="tree"
						resources={DEMO_RESOURCES}
						defaultExpanded
						aria-label="Resource changes"
					/>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function DiffViewKnobs() {
	return (
		<RailPanel
			title="DiffView"
			description="Lines mode for code/docs; tree mode for IaC resources. App maps domain JSON onto DiffLine / DiffResource."
		/>
	);
}

function PlanSummaryCanvas() {
	return (
		<Canvas>
			<DemoRow label="Apply gate">
				<div className="w-full max-w-2xl">
					<PlanSummary
						resources={DEMO_RESOURCES}
						title="Stack plan"
					/>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function PlanSummaryKnobs() {
	return (
		<RailPanel
			title="PlanSummary"
			description="Derived counts + kind filters over DiffView tree. One resources array."
		/>
	);
}

const LOG_SEED: LogViewerLine[] = [
	{
		id: "seed-1",
		text: "planner: loading stack state",
		level: "info",
		at: "2026-07-13T18:00:00.000Z",
		data: {
			component: "planner",
			action: "load_state",
			stack: "prod-edge",
		},
	},
	{
		id: "seed-2",
		text: "planner: 12 resources in plan",
		level: "debug",
		at: "2026-07-13T18:00:01.000Z",
		data: {
			component: "planner",
			resourceCount: 12,
			requestId: "plan-a1",
		},
	},
	{
		id: "seed-3",
		text: "apply: aws_vpc.main create complete",
		level: "info",
		at: "2026-07-13T18:00:02.000Z",
		data: {
			component: "apply",
			resource: "aws_vpc.main",
			status: "created",
		},
	},
];

const STREAM_LINES: Array<{
	text: string;
	level: LogViewerLevel;
	data: Record<string, unknown>;
}> = [
	{
		text: "apply: aws_subnet.public create",
		level: "info",
		data: { resource: "aws_subnet.public", status: "creating" },
	},
	{
		text: "apply: waiting on dependency",
		level: "debug",
		data: { waitFor: "aws_vpc.main", elapsedMs: 1200 },
	},
	{
		text: "apply: aws_instance.web create",
		level: "info",
		data: { resource: "aws_instance.web", instanceType: "t3.small" },
	},
	{
		text: "health: probe timeout",
		level: "warn",
		data: { probe: "http", target: "web", timeoutMs: 5000 },
	},
	{
		text: "apply: retrying instance create",
		level: "warn",
		data: { resource: "aws_instance.web", attempt: 2 },
	},
	{
		text: "apply: aws_lb.app create complete",
		level: "info",
		data: { resource: "aws_lb.app", status: "created" },
	},
	{
		text: "apply: error attaching target group",
		level: "error",
		data: {
			resource: "aws_lb_target_group.app",
			errorCode: "InvalidTarget",
		},
	},
	{
		text: "apply: stack complete with errors",
		level: "error",
		data: { status: "failed", errorCount: 1 },
	},
];

const LOG_SEED_END_MS = Date.parse("2026-07-13T18:00:02.000Z");

function cloneLogSeed(): LogViewerLine[] {
	return LOG_SEED.map((line) => {
		return {
			id: line.id,
			text: line.text,
			level: line.level,
			at: line.at,
			data: line.data,
		};
	});
}

interface LogViewerDemoValue {
	streaming: boolean;
	setStreaming: (value: boolean) => void;
	maxLines: number;
	setMaxLines: (value: number) => void;
	lines: LogViewerLine[];
	reset: () => void;
}

const LogViewerDemoContext = createContext<LogViewerDemoValue | null>(null);

function useLogViewerDemo() {
	const value = useContext(LogViewerDemoContext);
	if (value === null) {
		throw new Error("LogViewerDemoProvider required");
	}

	return value;
}

function LogViewerDemoProvider({ children }: { children: ReactNode }) {
	const [streaming, setStreaming] = useState(false);
	const [maxLines, setMaxLines] = useState(50);
	const [lines, setLines] = useState<LogViewerLine[]>(cloneLogSeed);
	const streamIndexRef = useRef(0);
	const clockMsRef = useRef(LOG_SEED_END_MS);

	function reset() {
		setStreaming(false);
		streamIndexRef.current = 0;
		clockMsRef.current = LOG_SEED_END_MS;
		setLines(cloneLogSeed());
	}

	useEffect(() => {
		if (!streaming) {
			return;
		}

		const timer = window.setInterval(() => {
			const template =
				STREAM_LINES[streamIndexRef.current % STREAM_LINES.length];
			const nextIndex = streamIndexRef.current;

			streamIndexRef.current = nextIndex + 1;
			clockMsRef.current += 1000;

			const at = new Date(clockMsRef.current).toISOString();

			setLines((prev) => {
				return [
					...prev,
					{
						id: `stream-${String(nextIndex)}`,
						text: template.text,
						level: template.level,
						at,
						data: template.data,
					},
				];
			});
		}, 900);

		return () => {
			window.clearInterval(timer);
		};
	}, [streaming]);

	return (
		<LogViewerDemoContext.Provider
			value={{
				streaming,
				setStreaming,
				maxLines,
				setMaxLines,
				lines,
				reset,
			}}
		>
			{children}
		</LogViewerDemoContext.Provider>
	);
}

function LogViewerCanvas() {
	const demo = useLogViewerDemo();

	return (
		<Canvas>
			<p className="text-sm text-muted-foreground">
				Deploy apply stream. Expand a row for JSON. Enter adds text
				filter chips (OR). New lines append at the bottom while
				Following; scroll up to pause. Stream and reset live in knobs.
			</p>
			<div className="w-full max-w-3xl">
				<LogViewer
					aria-label="Apply logs"
					lines={demo.lines}
					maxLines={demo.maxLines}
					className="shadow-sm"
				/>
			</div>
		</Canvas>
	);
}

function LogViewerKnobs() {
	const demo = useLogViewerDemo();

	return (
		<RailPanel
			title="LogViewer"
			description="Live-tail chrome. Parent owns the buffer; panel owns filters and follow."
		>
			<DemoRow
				label="Stream"
				description="Append lines on a 1s demo clock."
			>
				<Toggle
					label="Streaming"
					checked={demo.streaming}
					onCheckedChange={demo.setStreaming}
				/>
			</DemoRow>
			<DemoRow label="Reset" description="Clear buffer back to seed.">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={() => {
						demo.reset();
					}}
				>
					Reset
				</Button>
			</DemoRow>
			<DemoRow
				label="Max lines"
				description="Client truncate after filters."
			>
				<Select
					id="log-max-lines"
					aria-label="Max lines"
					options={[
						{ value: "20", label: "20" },
						{ value: "50", label: "50" },
						{ value: "100", label: "100" },
					]}
					value={String(demo.maxLines)}
					onChange={(event) => {
						demo.setMaxLines(Number(event.target.value));
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

export {
	DiffViewCanvas,
	DiffViewKnobs,
	LinearDeployCanvas,
	LinearDeployKnobs,
	LogViewerCanvas,
	LogViewerDemoProvider,
	LogViewerKnobs,
	MultiNodeCanvas,
	MultiNodeKnobs,
	PlanSummaryCanvas,
	PlanSummaryKnobs,
};
