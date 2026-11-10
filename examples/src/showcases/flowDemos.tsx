import { Alert, Button, Card, Input, NumberInput } from "@wahidgroup/veneer";
import type { FlowConnection, FlowEdge, FlowNode, FlowPort, FlowStatus, FlowValueKind } from "@wahidgroup/veneer/flow";
import { FlowCanvas, sameValueKindConnection } from "@wahidgroup/veneer/flow";
import { layoutGraph } from "@wahidgroup/veneer/flow/layout";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { FlowDemoField, FlowDemoSnapshot, FlowFieldKind } from "../api/client.js";
import { getFlowDemo, patchFlowNodeConfig, resetFlowDemo, triggerFlowDemo } from "../api/client.js";
import { Canvas, DemoRow, DemoSectionHeader, RailPanel } from "./demoChrome.js";

const DROP_MIME = "application/x-veneer-flow-type";
const NODE_WIDTH = 240;
const MAX_EXTRA_PORTS = 4;
const DEFAULT_MIN_AMOUNT = 10;

/** Card layout metrics (must match FieldRows / Card sm padding). */
const CARD_PAD = 12;
const CARD_TITLE = 22;
const CARD_SECTION_GAP = 4;
const CARD_SECTION_LABEL = 14;
const CARD_LIST_GAP = 2;
const CARD_ROW = 18;
const CARD_ROW_GAP = 2;

function measureCardLayout(fields: FlowDemoField[]): {
	height: number;
	anchorById: Map<string, number>;
} {
	const inputs: FlowDemoField[] = [];
	const outputs: FlowDemoField[] = [];
	for (const field of fields) {
		if (field.direction === "in") {
			inputs.push(field);
		} else {
			outputs.push(field);
		}
	}

	const anchorById = new Map<string, number>();
	let y = CARD_PAD + CARD_TITLE;

	function placeSection(sectionFields: FlowDemoField[]) {
		if (sectionFields.length === 0) {
			return;
		}
		y += CARD_SECTION_GAP + CARD_SECTION_LABEL + CARD_LIST_GAP;
		for (let index = 0; index < sectionFields.length; index += 1) {
			const field = sectionFields[index];
			if (field === undefined) {
				continue;
			}
			const mid = y + CARD_ROW / 2;
			anchorById.set(field.id, mid);
			y += CARD_ROW;
			if (index < sectionFields.length - 1) {
				y += CARD_ROW_GAP;
			}
		}
	}

	placeSection(inputs);
	placeSection(outputs);
	y += CARD_PAD;

	let height = y;
	if (height < 120) {
		height = 120;
	}

	return { height, anchorById };
}

function nodeHeightForFields(fields: FlowDemoField[]): number {
	const layout = measureCardLayout(fields);
	return layout.height;
}

function fieldsToPorts(fields: FlowDemoField[]): FlowPort[] {
	const layout = measureCardLayout(fields);
	const ports: FlowPort[] = [];
	for (const field of fields) {
		let side: FlowPort["side"] = "EAST";
		if (field.direction === "in") {
			side = "WEST";
		}
		const midY = layout.anchorById.get(field.id);
		let anchor: number | undefined;
		if (midY !== undefined && layout.height > 0) {
			anchor = midY / layout.height;
		}
		ports.push({
			id: field.id,
			side,
			label: field.label,
			valueKind: field.kind,
			anchor,
		});
	}

	return ports;
}

const DEFAULT_SNAPSHOT: FlowDemoSnapshot = {
	nodes: [
		{
			id: "account-listener",
			label: "Account listener",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "out",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "split-half",
			label: "Split half",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "in",
				},
				{
					id: "halfA",
					label: "Half A",
					kind: "number",
					direction: "out",
				},
				{
					id: "halfB",
					label: "Half B",
					kind: "number",
					direction: "out",
				},
				{
					id: "dust",
					label: "Dust",
					kind: "number",
					direction: "out",
				},
				{
					id: "addressOut",
					label: "Address",
					kind: "string",
					direction: "out",
				},
			],
			config: { minAmount: DEFAULT_MIN_AMOUNT },
		},
		{
			id: "send-a",
			label: "Send payee A",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "send-b",
			label: "Send payee B",
			fields: [
				{
					id: "amount",
					label: "Amount",
					kind: "number",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
		{
			id: "return-dust",
			label: "Return dust",
			fields: [
				{
					id: "amount",
					label: "Dust",
					kind: "number",
					direction: "in",
				},
				{
					id: "address",
					label: "Address",
					kind: "string",
					direction: "in",
				},
				{
					id: "txid",
					label: "Tx id",
					kind: "string",
					direction: "out",
				},
			],
			config: {},
		},
	],
	edges: [
		{
			id: "e-amt",
			source: "account-listener",
			target: "split-half",
			sourcePort: "amount",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-addr",
			source: "account-listener",
			target: "split-half",
			sourcePort: "address",
			targetPort: "address",
			valueKind: "string",
		},
		{
			id: "e-a",
			source: "split-half",
			target: "send-a",
			sourcePort: "halfA",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-b",
			source: "split-half",
			target: "send-b",
			sourcePort: "halfB",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-dust-amt",
			source: "split-half",
			target: "return-dust",
			sourcePort: "dust",
			targetPort: "amount",
			valueKind: "number",
		},
		{
			id: "e-dust-addr",
			source: "split-half",
			target: "return-dust",
			sourcePort: "addressOut",
			targetPort: "address",
			valueKind: "string",
		},
	],
	run: {
		runId: null,
		nodeStates: {},
		outputsByNode: {},
		message: "No run yet",
	},
};

interface FlowCanvasDemoValue {
	nodes: FlowNode[];
	edges: FlowEdge[];
	fieldsByNode: Record<string, FlowDemoField[]>;
	valuesByNode: Record<string, Record<string, string | number>>;
	nodeStatus: Record<string, FlowStatus>;
	runMessage: string;
	apiError: string | null;
	selectedId: string | undefined;
	setSelectedId: (id: string | undefined) => void;
	depositAmount: number;
	setDepositAmount: (value: number) => void;
	depositAddress: string;
	setDepositAddress: (value: string) => void;
	minAmount: number;
	setMinAmount: (value: number) => void;
	busy: boolean;
	layoutBusy: boolean;
	fireDeposit: () => Promise<void>;
	applyMinAmount: () => Promise<void>;
	reset: () => Promise<void>;
	runAutoLayout: () => Promise<void>;
	setNodes: (nodes: FlowNode[]) => void;
	setEdges: (edges: FlowEdge[]) => void;
	addPort: (nodeId: string, direction: "in" | "out", kind: FlowFieldKind) => void;
	connect: (connection: FlowConnection) => void;
	isValidConnection: (connection: FlowConnection) => boolean;
	onDropType: (type: string, position: { x: number; y: number }) => void;
}

const FlowCanvasDemoContext = createContext<FlowCanvasDemoValue | null>(null);

function useFlowCanvasDemo(): FlowCanvasDemoValue {
	const value = useContext(FlowCanvasDemoContext);
	if (value === null) {
		throw new Error("FlowCanvasDemoProvider required");
	}

	return value;
}

function snapshotToCanvas(snapshot: FlowDemoSnapshot): {
	nodes: FlowNode[];
	edges: FlowEdge[];
	fieldsByNode: Record<string, FlowDemoField[]>;
	valuesByNode: Record<string, Record<string, string | number>>;
	nodeStatus: Record<string, FlowStatus>;
	minAmount: number;
} {
	const fieldsByNode: Record<string, FlowDemoField[]> = {};
	const nodes: FlowNode[] = [];
	let x = 40;
	for (const demoNode of snapshot.nodes) {
		fieldsByNode[demoNode.id] = [...demoNode.fields];
		nodes.push({
			id: demoNode.id,
			label: demoNode.label,
			x,
			y: 80,
			width: NODE_WIDTH,
			height: nodeHeightForFields(demoNode.fields),
			ports: fieldsToPorts(demoNode.fields),
		});

		x += NODE_WIDTH + 96;
	}

	const edges: FlowEdge[] = snapshot.edges.map((edge) => {
		return {
			id: edge.id,
			source: edge.source,
			target: edge.target,
			sourcePort: edge.sourcePort,
			targetPort: edge.targetPort,
			valueKind: edge.valueKind,
		};
	});

	const nodeStatus: Record<string, FlowStatus> = {};
	for (const [id, status] of Object.entries(snapshot.run.nodeStates)) {
		nodeStatus[id] = status;
	}

	let minAmount = DEFAULT_MIN_AMOUNT;
	const split = snapshot.nodes.find((node) => {
		return node.id === "split-half";
	});
	if (split !== undefined) {
		const raw = split.config.minAmount;
		if (typeof raw === "number") {
			minAmount = raw;
		}
	}

	return {
		nodes,
		edges,
		fieldsByNode,
		valuesByNode: snapshot.run.outputsByNode,
		nodeStatus,
		minAmount,
	};
}

const DEFAULT_CANVAS = snapshotToCanvas(DEFAULT_SNAPSHOT);

function applySnapshotState(
	snapshot: FlowDemoSnapshot,
	setNodes: (nodes: FlowNode[]) => void,
	setEdges: (edges: FlowEdge[]) => void,
	setFieldsByNode: (value: Record<string, FlowDemoField[]>) => void,
	setValuesByNode: (value: Record<string, Record<string, string | number>>) => void,
	setNodeStatus: (value: Record<string, FlowStatus>) => void,
	setRunMessage: (value: string) => void,
	setMinAmount: (value: number) => void,
	preservePositions: FlowNode[] | null,
) {
	const mapped = snapshotToCanvas(snapshot);
	if (preservePositions !== null) {
		const byId = new Map(
			preservePositions.map((node) => {
				return [node.id, node] as const;
			}),
		);
		setNodes(
			mapped.nodes.map((node) => {
				const prev = byId.get(node.id);
				if (prev === undefined) {
					return node;
				}
				return {
					...node,
					x: prev.x,
					y: prev.y,
					width: prev.width,
					height: nodeHeightForFields(mapped.fieldsByNode[node.id] ?? []),
					ports: fieldsToPorts(mapped.fieldsByNode[node.id] ?? []),
				};
			}),
		);
	} else {
		setNodes(mapped.nodes);
	}
	setEdges(mapped.edges);
	setFieldsByNode(mapped.fieldsByNode);
	setValuesByNode(mapped.valuesByNode);
	setNodeStatus(mapped.nodeStatus);
	setRunMessage(snapshot.run.message);
	setMinAmount(mapped.minAmount);
}

function FlowCanvasDemoProvider({ children }: { children: ReactNode }) {
	const [nodes, setNodes] = useState<FlowNode[]>(DEFAULT_CANVAS.nodes);
	const [edges, setEdges] = useState<FlowEdge[]>(DEFAULT_CANVAS.edges);
	const [fieldsByNode, setFieldsByNode] = useState<Record<string, FlowDemoField[]>>(DEFAULT_CANVAS.fieldsByNode);
	const [valuesByNode, setValuesByNode] = useState<Record<string, Record<string, string | number>>>(
		DEFAULT_CANVAS.valuesByNode,
	);
	const [nodeStatus, setNodeStatus] = useState<Record<string, FlowStatus>>(DEFAULT_CANVAS.nodeStatus);
	const [runMessage, setRunMessage] = useState(DEFAULT_SNAPSHOT.run.message);
	const [apiError, setApiError] = useState<string | null>(null);
	const [selectedId, setSelectedId] = useState<string | undefined>();
	const [depositAmount, setDepositAmount] = useState(101);
	const [depositAddress, setDepositAddress] = useState("bc1qholder");
	const [minAmount, setMinAmount] = useState(DEFAULT_CANVAS.minAmount);
	const [busy, setBusy] = useState(false);
	const [layoutBusy, setLayoutBusy] = useState(false);
	const [extraSeq, setExtraSeq] = useState(1);

	useEffect(() => {
		void getFlowDemo()
			.then((snapshot) => {
				applySnapshotState(
					snapshot,
					setNodes,
					setEdges,
					setFieldsByNode,
					setValuesByNode,
					setNodeStatus,
					setRunMessage,
					setMinAmount,
					null,
				);
				setApiError(null);
			})
			.catch(() => {
				setApiError("Could not load flow demo; showing seed graph.");
			});
	}, []);

	async function fireDeposit() {
		setBusy(true);
		try {
			const snapshot = await triggerFlowDemo(depositAmount, depositAddress);
			applySnapshotState(
				snapshot,
				setNodes,
				setEdges,
				setFieldsByNode,
				setValuesByNode,
				setNodeStatus,
				setRunMessage,
				setMinAmount,
				nodes,
			);
			setApiError(null);
		} catch {
			setApiError("Fire deposit failed; graph unchanged.");
		} finally {
			setBusy(false);
		}
	}

	async function applyMinAmount() {
		setBusy(true);
		try {
			const snapshot = await patchFlowNodeConfig("split-half", {
				minAmount,
			});
			applySnapshotState(
				snapshot,
				setNodes,
				setEdges,
				setFieldsByNode,
				setValuesByNode,
				setNodeStatus,
				setRunMessage,
				setMinAmount,
				nodes,
			);
			setApiError(null);
		} catch {
			setApiError("Apply minAmount failed; graph unchanged.");
		} finally {
			setBusy(false);
		}
	}

	async function reset() {
		setBusy(true);
		try {
			const snapshot = await resetFlowDemo();
			applySnapshotState(
				snapshot,
				setNodes,
				setEdges,
				setFieldsByNode,
				setValuesByNode,
				setNodeStatus,
				setRunMessage,
				setMinAmount,
				null,
			);
			setSelectedId(undefined);
			setApiError(null);
		} catch {
			setApiError("Reset failed; graph unchanged.");
		} finally {
			setBusy(false);
		}
	}

	async function runAutoLayout() {
		setLayoutBusy(true);
		try {
			const result = await layoutGraph({
				nodes: nodes.map((node) => {
					return {
						id: node.id,
						label: node.label,
						width: node.width,
						height: node.height,
						ports: node.ports,
					};
				}),
				edges: edges.map((edge) => {
					return {
						id: edge.id,
						source: edge.source,
						target: edge.target,
						sourcePort: edge.sourcePort,
						targetPort: edge.targetPort,
						valueKind: edge.valueKind,
					};
				}),
				fixedPortOrder: true,
			});

			const labels = new Map(
				nodes.map((node) => {
					return [node.id, node.label] as const;
				}),
			);
			const fieldsSnapshot = fieldsByNode;
			setNodes(
				result.nodes.map((node) => {
					const label = labels.get(node.id);
					const fields = fieldsSnapshot[node.id] ?? [];
					let nextLabel = node.label;
					if (label !== undefined) {
						nextLabel = label;
					}
					return {
						...node,
						label: nextLabel,
						width: NODE_WIDTH,
						height: nodeHeightForFields(fields),
						ports: fieldsToPorts(fields),
					};
				}),
			);
			setEdges(
				result.edges.map((edge) => {
					return {
						...edge,
						points: undefined,
					};
				}),
			);
		} finally {
			setLayoutBusy(false);
		}
	}

	function addPort(nodeId: string, direction: "in" | "out", kind: FlowFieldKind) {
		const current = fieldsByNode[nodeId] ?? [];
		const extras = current.filter((field) => {
			return field.id.startsWith("extra-");
		});
		if (extras.length >= MAX_EXTRA_PORTS) {
			return;
		}

		const seq = extraSeq;
		setExtraSeq(seq + 1);
		const id = `extra-${kind}-${direction}-${String(seq)}`;
		const nextFields = [
			...current,
			{
				id,
				label: `${kind} ${direction}`,
				kind,
				direction,
			},
		];
		setFieldsByNode({
			...fieldsByNode,
			[nodeId]: nextFields,
		});
		setNodes(
			nodes.map((node) => {
				if (node.id !== nodeId) {
					return node;
				}
				return {
					...node,
					height: nodeHeightForFields(nextFields),
					ports: fieldsToPorts(nextFields),
				};
			}),
		);
	}

	function connect(connection: FlowConnection) {
		let valueKind: FlowValueKind | undefined;
		for (const node of nodes) {
			if (node.id !== connection.source || node.ports === undefined) {
				continue;
			}

			for (const port of node.ports) {
				if (port.id === connection.sourcePort) {
					valueKind = port.valueKind;
				}
			}
		}

		const id = `e-${connection.source}-${connection.target}-${String(edges.length)}`;
		setEdges([
			...edges,
			{
				id,
				source: connection.source,
				target: connection.target,
				sourcePort: connection.sourcePort,
				targetPort: connection.targetPort,
				valueKind,
			},
		]);
	}

	function isValidConnection(connection: FlowConnection): boolean {
		if (connection.source === connection.target) {
			return false;
		}

		return sameValueKindConnection(nodes, connection);
	}

	function onDropType(type: string, position: { x: number; y: number }) {
		const id = `${type}-${String(nodes.length + 1)}`;
		const fields: FlowDemoField[] = [
			{
				id: "in",
				label: "In",
				kind: "number",
				direction: "in",
			},
			{
				id: "out",
				label: "Out",
				kind: "number",
				direction: "out",
			},
		];
		setFieldsByNode({
			...fieldsByNode,
			[id]: fields,
		});
		setNodes([
			...nodes,
			{
				id,
				label: type,
				x: position.x,
				y: position.y,
				width: NODE_WIDTH,
				height: nodeHeightForFields(fields),
				ports: fieldsToPorts(fields),
			},
		]);
	}

	return (
		<FlowCanvasDemoContext.Provider
			value={{
				nodes,
				edges,
				fieldsByNode,
				valuesByNode,
				nodeStatus,
				runMessage,
				apiError,
				selectedId,
				setSelectedId,
				depositAmount,
				setDepositAmount,
				depositAddress,
				setDepositAddress,
				minAmount,
				setMinAmount,
				busy,
				layoutBusy,
				fireDeposit,
				applyMinAmount,
				reset,
				runAutoLayout,
				setNodes,
				setEdges,
				addPort,
				connect,
				isValidConnection,
				onDropType,
			}}
		>
			{children}
		</FlowCanvasDemoContext.Provider>
	);
}

function formatFieldValue(value: string | number | undefined): string {
	if (value === undefined) {
		return "-";
	}

	return String(value);
}

function FieldRows({
	title,
	fields,
	values,
}: {
	title: string;
	fields: FlowDemoField[];
	values: Record<string, string | number> | undefined;
}) {
	if (fields.length === 0) {
		return null;
	}

	return (
		<div className="mt-1">
			<p className="h-3.5 text-[10px] font-medium uppercase leading-[14px] tracking-wide text-muted-foreground">
				{title}
			</p>
			<ul className="mt-0.5 space-y-0.5">
				{fields.map((field) => {
					let value: string | number | undefined;
					if (values !== undefined) {
						value = values[field.id];
					}

					return (
						<li
							key={`${field.direction}-${field.id}`}
							className="flex h-[18px] items-center justify-between gap-2 text-[11px] leading-none"
						>
							<span className="truncate text-muted-foreground">
								{field.label} <span className="text-[10px]">({field.kind})</span>
							</span>
							<span className="shrink-0 font-mono tabular-nums">{formatFieldValue(value)}</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function FlowCanvasCanvas() {
	const demo = useFlowCanvasDemo();

	let apiErrorNode: ReactNode = null;
	if (demo.apiError !== null) {
		apiErrorNode = (
			<Alert type="danger" className="mb-2">
				{demo.apiError}
			</Alert>
		);
	}

	return (
		<>
			<DemoSectionHeader
				title="Deposit split playground"
				description="API-backed graph: fire a deposit, gate on minAmount, split halves + dust. Edges connect like-typed ports only."
				apiDriven
			/>
			<Canvas>
				<div className="mb-3 flex flex-wrap gap-2">
					<Button
						type="button"
						size="sm"
						variant="outlined"
						disabled={demo.layoutBusy || demo.nodes.length === 0}
						onClick={() => {
							void demo.runAutoLayout();
						}}
					>
						Auto-layout (elk)
					</Button>
					<button
						type="button"
						draggable
						className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs"
						onDragStart={(event) => {
							event.dataTransfer.setData(DROP_MIME, "task");
							event.dataTransfer.effectAllowed = "move";
						}}
					>
						Drag task onto canvas
					</button>
				</div>
				{apiErrorNode}
				<p className="mb-2 text-sm text-muted-foreground" role="status">
					{demo.runMessage}
				</p>
				<FlowCanvas
					aria-label="Deposit split flow"
					nodes={demo.nodes}
					edges={demo.edges}
					selectedId={demo.selectedId}
					editable
					showHandles
					dropMimeType={DROP_MIME}
					nodeStatus={demo.nodeStatus}
					onNodeSelect={(id) => {
						if (id === null) {
							demo.setSelectedId(undefined);
							return;
						}
						demo.setSelectedId(id);
					}}
					onNodesChange={demo.setNodes}
					onEdgesChange={demo.setEdges}
					onConnect={demo.connect}
					isValidConnection={demo.isValidConnection}
					onDropType={demo.onDropType}
					renderNode={({ node, editMode }) => {
						const fields = demo.fieldsByNode[node.id] ?? [];
						const inputs = fields.filter((field) => {
							return field.direction === "in";
						});
						const outputs = fields.filter((field) => {
							return field.direction === "out";
						});
						const values = demo.valuesByNode[node.id];

						let editor: ReactNode = null;
						if (editMode) {
							editor = (
								<div className="nodrag mt-2 flex flex-wrap gap-1">
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => {
											demo.addPort(node.id, "in", "number");
										}}
									>
										+num in
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => {
											demo.addPort(node.id, "in", "string");
										}}
									>
										+str in
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => {
											demo.addPort(node.id, "out", "number");
										}}
									>
										+num out
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										onClick={() => {
											demo.addPort(node.id, "out", "string");
										}}
									>
										+str out
									</Button>
								</div>
							);
						}

						return (
							<Card size="sm" className="box-border h-full w-full overflow-hidden p-3 shadow-none">
								<p className="h-[22px] truncate text-sm font-medium leading-[22px]">{node.label}</p>
								<FieldRows title="Inputs" fields={inputs} values={values} />
								<FieldRows title="Outputs" fields={outputs} values={values} />
								{editor}
							</Card>
						);
					}}
				/>
			</Canvas>
		</>
	);
}

function FlowCanvasKnobs() {
	const demo = useFlowCanvasDemo();

	return (
		<RailPanel
			title="FlowCanvas"
			description="Each Fire deposit accumulates onto a running total until Reset. split-half runs when total > minAmount. Connect like-typed ports; Delete/Backspace removes the selected node; elk optional peer."
		>
			<DemoRow label="Deposit amount" description="Integer added to the cumulative listener total on each fire.">
				<NumberInput
					id="flow-deposit-amount"
					aria-label="Deposit amount"
					value={demo.depositAmount}
					onValueChange={(value) => {
						if (value === undefined) {
							return;
						}
						demo.setDepositAmount(value);
					}}
				/>
			</DemoRow>
			<DemoRow label="Deposit address" description="Holder address echoed through the graph.">
				<Input
					id="flow-deposit-address"
					aria-label="Deposit address"
					value={demo.depositAddress}
					onChange={(event) => {
						demo.setDepositAddress(event.target.value);
					}}
				/>
			</DemoRow>
			<DemoRow label="Fire deposit">
				<Button
					type="button"
					size="sm"
					variant="filled"
					disabled={demo.busy}
					onClick={() => {
						void demo.fireDeposit();
					}}
				>
					Fire deposit
				</Button>
			</DemoRow>
			<DemoRow label="split-half minAmount" description="Gate: amount must be greater than this value.">
				<NumberInput
					id="flow-min-amount"
					aria-label="Minimum amount"
					value={demo.minAmount}
					onValueChange={(value) => {
						if (value === undefined) {
							return;
						}
						demo.setMinAmount(value);
					}}
				/>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					disabled={demo.busy}
					onClick={() => {
						void demo.applyMinAmount();
					}}
				>
					Apply
				</Button>
			</DemoRow>
			<DemoRow label="Reset graph">
				<Button
					type="button"
					size="sm"
					variant="outlined"
					disabled={demo.busy}
					onClick={() => {
						void demo.reset();
					}}
				>
					Reset
				</Button>
			</DemoRow>
		</RailPanel>
	);
}

export { FlowCanvasCanvas, FlowCanvasDemoProvider, FlowCanvasKnobs };
