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
import {
	getLogStreamStatus,
	resetLogStream,
	startLogStream,
	stopLogStream,
} from "../api/client.js";
import {
	connectLogs,
	type LogLine,
	type LogsConnectionState,
} from "../api/logs-ws.js";

interface EdgeNode {
	id: string;
	name: string;
}

type WorkflowDemoVariant = "linear" | "nodes";

interface WorkflowDemoValue {
	variant: WorkflowDemoVariant;
	setVariant: (value: WorkflowDemoVariant) => void;
	orientation: WorkflowOrientation;
	setOrientation: (value: WorkflowOrientation) => void;
	nodeCount: number;
	addNode: () => void;
	removeNode: () => void;
}

const WorkflowDemoContext = createContext<WorkflowDemoValue | null>(null);

function useWorkflowDemo(): WorkflowDemoValue {
	const value = useContext(WorkflowDemoContext);
	if (value === null) {
		throw new Error("WorkflowDemoProvider required");
	}

	return value;
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

function WorkflowDemoProvider({ children }: { children: ReactNode }) {
	const [variant, setVariantState] = useState<WorkflowDemoVariant>("linear");
	const [orientation, setOrientation] =
		useState<WorkflowOrientation>("horizontal");
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
	const [step, setStep] = useState("region");
	const [region, setRegion] = useState("us-east-1");
	const [plan, setPlan] = useState("pro");

	function setVariant(value: WorkflowDemoVariant): void {
		setVariantState(value);
		if (value === "linear") {
			setStep("region");
			return;
		}

		setStep("cluster");
	}

	function addNode(): void {
		const id = `edge-${String(nodes.length + 1)}`;
		setNodes((prev) => {
			return [...prev, { id, name: id }];
		});
		setNames((prev) => {
			return { ...prev, [id]: id };
		});
	}

	function removeNode(): void {
		if (nodes.length <= 1) {
			return;
		}

		const removed = nodes[nodes.length - 1];
		if (removed === undefined) {
			return;
		}

		const removedId = removed.id;

		setNodes((prev) => {
			return prev.slice(0, -1);
		});
		setNames((prev) => {
			const next = { ...prev };
			delete next[removedId];
			return next;
		});
		setStep((current) => {
			if (current === `node:${removedId}`) {
				return "cluster";
			}

			return current;
		});
	}

	return (
		<WorkflowDemoContext.Provider
			value={{
				variant,
				setVariant,
				orientation,
				setOrientation,
				nodeCount: nodes.length,
				addNode,
				removeNode,
			}}
		>
			<WorkflowDemoStateContext.Provider
				value={{
					variant,
					orientation,
					nodes,
					names,
					setNames,
					step,
					setStep,
					region,
					setRegion,
					plan,
					setPlan,
				}}
			>
				{children}
			</WorkflowDemoStateContext.Provider>
		</WorkflowDemoContext.Provider>
	);
}

interface WorkflowDemoState {
	variant: WorkflowDemoVariant;
	orientation: WorkflowOrientation;
	nodes: EdgeNode[];
	names: Record<string, string>;
	setNames: (
		update:
			| Record<string, string>
			| ((prev: Record<string, string>) => Record<string, string>),
	) => void;
	step: string;
	setStep: (value: string) => void;
	region: string;
	setRegion: (value: string) => void;
	plan: string;
	setPlan: (value: string) => void;
}

const WorkflowDemoStateContext = createContext<WorkflowDemoState | null>(null);

function useWorkflowDemoState(): WorkflowDemoState {
	const value = useContext(WorkflowDemoStateContext);
	if (value === null) {
		throw new Error("WorkflowDemoProvider required");
	}

	return value;
}

function LinearDeployFlow() {
	const demo = useWorkflowDemoState();
	const order = ["region", "plan", "confirm"];

	let regionValid = demo.region.length > 0;
	let planValid = demo.plan.length > 0;

	let canNext = true;
	let nextHint = "";
	if (demo.step === "region") {
		canNext = regionValid;
		if (!regionValid) {
			nextHint = "Choose a region to continue.";
		}
	} else if (demo.step === "plan") {
		canNext = planValid;
		if (!planValid) {
			nextHint = "Choose a plan to continue.";
		}
	}

	let regionError: ReactNode = null;
	if (demo.step === "region" && nextHint.length > 0) {
		regionError = <FieldError>{nextHint}</FieldError>;
	}

	let planError: ReactNode = null;
	if (demo.step === "plan" && nextHint.length > 0) {
		planError = <FieldError>{nextHint}</FieldError>;
	}

	return (
		<Workflow
			value={demo.step}
			onValueChange={demo.setStep}
			orientation={demo.orientation}
		>
			<WorkflowTrack aria-label="Deploy progress">
				<WorkflowStep
					value="region"
					status={statusForStep("region", demo.step, order)}
				>
					Region
				</WorkflowStep>
				<WorkflowStep
					value="plan"
					status={statusForStep("plan", demo.step, order)}
				>
					Plan
				</WorkflowStep>
				<WorkflowStep
					value="confirm"
					status={statusForStep("confirm", demo.step, order)}
				>
					Confirm
				</WorkflowStep>
			</WorkflowTrack>
			<WorkflowPanel value="region" title="Region">
				<div className="flex max-w-sm flex-col gap-2">
					<Label htmlFor="deploy-region">Region</Label>
					<Select
						id="deploy-region"
						value={demo.region}
						options={[
							{ value: "", label: "Select region" },
							{ value: "us-east-1", label: "US East" },
							{ value: "eu-west-1", label: "EU West" },
							{
								value: "ap-southeast-1",
								label: "AP Southeast",
							},
						]}
						onChange={(value) => {
							demo.setRegion(value);
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
						value={demo.plan}
						options={[
							{ value: "", label: "Select plan" },
							{ value: "starter", label: "Starter" },
							{ value: "pro", label: "Pro" },
							{ value: "scale", label: "Scale" },
						]}
						onChange={(value) => {
							demo.setPlan(value);
						}}
					/>
					{planError}
				</div>
			</WorkflowPanel>
			<WorkflowPanel value="confirm" title="Confirm">
				<p className="text-sm text-muted-foreground">
					Deploy {demo.plan} in {demo.region}.
				</p>
			</WorkflowPanel>
			<WorkflowActions
				canNext={canNext}
				finishLabel="Deploy"
				onFinish={() => {
					demo.setStep("region");
				}}
			/>
		</Workflow>
	);
}

function MultiNodeFlow() {
	const demo = useWorkflowDemoState();

	const stepIds = useMemo(() => {
		const ids = ["cluster"];
		for (const node of demo.nodes) {
			ids.push(`node:${node.id}`);
		}

		ids.push("review");

		return ids;
	}, [demo.nodes]);

	let canNext = true;
	let nextHint = "";
	if (demo.step.startsWith("node:")) {
		const nodeId = demo.step.slice("node:".length);
		const name = demo.names[nodeId];
		if (name === undefined || name.trim().length === 0) {
			canNext = false;
			nextHint = "Hostname is required.";
		}
	}

	return (
		<Workflow
			value={demo.step}
			onValueChange={demo.setStep}
			orientation={demo.orientation}
		>
			<WorkflowTrack aria-label="Cluster setup">
				<WorkflowStep
					value="cluster"
					status={statusForStep("cluster", demo.step, stepIds)}
				>
					Cluster
				</WorkflowStep>
				{demo.nodes.map((node) => {
					return (
						<WorkflowStep
							key={node.id}
							value={`node:${node.id}`}
							status={statusForStep(
								`node:${node.id}`,
								demo.step,
								stepIds,
							)}
						>
							Node - {node.name}
						</WorkflowStep>
					);
				})}
				<WorkflowStep
					value="review"
					status={statusForStep("review", demo.step, stepIds)}
				>
					Review
				</WorkflowStep>
			</WorkflowTrack>
			<WorkflowPanel value="cluster" title="Cluster">
				<p className="text-sm text-muted-foreground">
					Choose a region and capacity profile for the cluster.
				</p>
			</WorkflowPanel>
			{demo.nodes.map((node) => {
				const stepId = `node:${node.id}`;
				let nameValue = "";
				if (demo.names[node.id] !== undefined) {
					nameValue = demo.names[node.id];
				}

				let hostnameError: ReactNode = null;
				if (demo.step === stepId && nextHint.length > 0) {
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
									demo.setNames((prev) => {
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
					{demo.nodes.map((node) => {
						let label = node.id;
						if (demo.names[node.id] !== undefined) {
							label = demo.names[node.id];
						}
						return <li key={node.id}>{label}</li>;
					})}
				</ul>
			</WorkflowPanel>
			<WorkflowActions
				canNext={canNext}
				finishLabel="Provision"
				onFinish={() => {
					demo.setStep("cluster");
				}}
			/>
		</Workflow>
	);
}

function WorkflowCanvas() {
	const demo = useWorkflowDemoState();

	let flow: ReactNode = <LinearDeployFlow />;
	if (demo.variant === "nodes") {
		flow = <MultiNodeFlow />;
	}

	return <Canvas>{flow}</Canvas>;
}

function WorkflowKnobs() {
	const demo = useWorkflowDemo();

	let addNodeRow: ReactNode = null;
	if (demo.variant === "nodes") {
		let removeDisabled = false;
		if (demo.nodeCount <= 1) {
			removeDisabled = true;
		}

		addNodeRow = (
			<DemoRow
				label="Nodes"
				description="Add or remove opaque node:* step ids. At least one node remains."
			>
				<Button type="button" size="sm" onClick={demo.addNode}>
					Add node
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					disabled={removeDisabled}
					onClick={demo.removeNode}
				>
					Remove node
				</Button>
			</DemoRow>
		);
	}

	return (
		<RailPanel
			title="Workflow"
			description="One deploy demo. Switch linear vs multi-node, track orientation, and add/remove node instances from the rail."
		>
			<DemoRow
				label="Variant"
				description="Linear = region/plan/confirm. Nodes = cluster + N hostnames + review."
			>
				<Select
					id="workflow-variant"
					aria-label="Workflow variant"
					value={demo.variant}
					options={[
						{ value: "linear", label: "Linear deploy" },
						{ value: "nodes", label: "Multi-node" },
					]}
					onChange={(value) => {
						const next = value;
						if (next === "linear" || next === "nodes") {
							demo.setVariant(next);
						}
					}}
				/>
			</DemoRow>
			<DemoRow label="Orientation" description="WorkflowTrack layout.">
				<Select
					id="workflow-orientation"
					aria-label="Workflow orientation"
					value={demo.orientation}
					options={[
						{ value: "horizontal", label: "Horizontal" },
						{ value: "vertical", label: "Vertical" },
					]}
					onChange={(value) => {
						const next = value;
						if (next === "horizontal" || next === "vertical") {
							demo.setOrientation(next);
						}
					}}
				/>
			</DemoRow>
			{addNodeRow}
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

interface LogViewerDemoValue {
	streaming: boolean;
	setStreaming: (value: boolean) => void;
	maxLines: number;
	setMaxLines: (value: number) => void;
	lines: LogViewerLine[];
	connection: LogsConnectionState;
	queries: string[];
	setQueries: (value: string[]) => void;
	levels: LogViewerLevel[];
	setLevels: (value: LogViewerLevel[]) => void;
	from: string;
	setFrom: (value: string) => void;
	to: string;
	setTo: (value: string) => void;
	reset: () => Promise<void>;
}

const LogViewerDemoContext = createContext<LogViewerDemoValue | null>(null);

function useLogViewerDemo() {
	const value = useContext(LogViewerDemoContext);
	if (value === null) {
		throw new Error("LogViewerDemoProvider required");
	}

	return value;
}

function toViewerLines(lines: LogLine[]): LogViewerLine[] {
	return lines.map((line) => {
		return {
			id: line.id,
			text: line.text,
			level: line.level,
			at: line.at,
			data: line.data,
		};
	});
}

function LogViewerDemoProvider({ children }: { children: ReactNode }) {
	const [streaming, setStreamingState] = useState(false);
	const [maxLines, setMaxLines] = useState(50);
	const [lines, setLines] = useState<LogViewerLine[]>([]);
	const [connection, setConnection] =
		useState<LogsConnectionState>("connecting");
	const [queries, setQueries] = useState<string[]>([]);
	const [levels, setLevels] = useState<LogViewerLevel[]>([
		"debug",
		"info",
		"warn",
		"error",
	]);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const sendSubscribeRef = useRef<
		| ((message: {
				levels?: LogViewerLevel[];
				queries?: string[];
				from?: string;
				to?: string;
		  }) => void)
		| null
	>(null);

	useEffect(() => {
		const session = connectLogs({
			onState: setConnection,
			onMessage: (message) => {
				if (message.type === "snapshot") {
					setLines(toViewerLines(message.lines));
					return;
				}

				if (message.type === "line") {
					setLines((prev) => {
						return [...prev, ...toViewerLines([message.line])];
					});
				}
			},
		});
		sendSubscribeRef.current = session.sendSubscribe;
		session.sendSubscribe({
			levels,
			queries,
			from,
			to,
		});

		void getLogStreamStatus()
			.then((state) => {
				setStreamingState(state.streaming);
			})
			.catch(() => {
				setStreamingState(false);
			});

		return () => {
			session.close();
			sendSubscribeRef.current = null;
		};
		// Connect once; filters push via separate effect.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only WS
	}, []);

	useEffect(() => {
		sendSubscribeRef.current?.({
			levels,
			queries,
			from,
			to,
		});
	}, [levels, queries, from, to]);

	async function setStreaming(value: boolean) {
		if (value) {
			const state = await startLogStream();
			setStreamingState(state.streaming);
			return;
		}

		const state = await stopLogStream();
		setStreamingState(state.streaming);
	}

	async function reset() {
		const state = await resetLogStream();
		setStreamingState(state.streaming);
		sendSubscribeRef.current?.({
			levels,
			queries,
			from,
			to,
		});
	}

	return (
		<LogViewerDemoContext.Provider
			value={{
				streaming,
				setStreaming: (value) => {
					void setStreaming(value);
				},
				maxLines,
				setMaxLines,
				lines,
				connection,
				queries,
				setQueries,
				levels,
				setLevels,
				from,
				setFrom,
				to,
				setTo,
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
				Parent owns the WS buffer and filter subscribe. Knobs start the
				Nest stream over HTTP. Expand rows for JSON. Connection:{" "}
				{demo.connection}.
			</p>
			<div className="w-full max-w-3xl">
				<LogViewer
					aria-label="Apply logs"
					lines={demo.lines}
					maxLines={demo.maxLines}
					queries={demo.queries}
					onQueriesChange={demo.setQueries}
					levels={demo.levels}
					onLevelsChange={demo.setLevels}
					from={demo.from}
					onFromChange={demo.setFrom}
					to={demo.to}
					onToChange={demo.setTo}
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
			description="HTTP knobs control Nest stream. Filters resubscribe on WS."
		>
			<DemoRow
				label="Stream"
				description="POST /v1/logs/stream/start|stop"
			>
				<Toggle
					label="Streaming"
					checked={demo.streaming}
					onCheckedChange={demo.setStreaming}
				/>
			</DemoRow>
			<DemoRow label="Reset" description="POST /v1/logs/stream/reset">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={() => {
						void demo.reset();
					}}
				>
					Reset
				</Button>
			</DemoRow>
			<DemoRow
				label="Max lines"
				description="Display truncate of parent buffer."
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
					onChange={(value) => {
						demo.setMaxLines(Number(value));
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

export {
	DiffViewCanvas,
	DiffViewKnobs,
	LogViewerCanvas,
	LogViewerDemoProvider,
	LogViewerKnobs,
	PlanSummaryCanvas,
	PlanSummaryKnobs,
	WorkflowCanvas,
	WorkflowDemoProvider,
	WorkflowKnobs,
};
