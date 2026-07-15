import type {
	DragEvent,
	KeyboardEvent,
	PointerEvent as ReactPointerEvent,
	RefObject,
} from "react";
import { useRef, useState } from "react";

import type {
	FlowConnection,
	FlowEdge,
	FlowNode,
	FlowPort,
} from "./flowTypes.js";
import type { GraphViewportHandle } from "./GraphViewport.js";

type FlowFocusMode = "navigate" | "edit-node";

interface ConnectingState {
	source: string;
	sourcePort?: string;
}

interface UseFlowCanvasInteractionArgs {
	nodes: FlowNode[];
	edges: FlowEdge[];
	editable: boolean;
	selectedId?: string;
	viewportRef: RefObject<GraphViewportHandle | null>;
	onNodeSelect?: (nodeId: string | null) => void;
	onNodesChange?: (nodes: FlowNode[]) => void;
	onEdgesChange?: (edges: FlowEdge[]) => void;
	onConnect?: (connection: FlowConnection) => void;
	isValidConnection?: (connection: FlowConnection) => boolean;
	dropMimeType?: string;
	onDropType?: (type: string, position: { x: number; y: number }) => void;
}

interface UseFlowCanvasInteractionResult {
	focusIndex: number;
	setFocusIndex: (index: number) => void;
	focusMode: FlowFocusMode;
	setFocusMode: (mode: FlowFocusMode) => void;
	connecting: ConnectingState | null;
	connectionHint: string | null;
	clearConnecting: () => void;
	selectNode: (nodeId: string | null) => void;
	onShellKeyDown: (
		index: number,
		event: KeyboardEvent<HTMLDivElement>,
	) => void;
	onPortClick: (
		nodeId: string,
		port: FlowPort,
		kind: "source" | "target",
	) => void;
	onNodePointerDown: (
		node: FlowNode,
		event: ReactPointerEvent<HTMLDivElement>,
	) => void;
	onNodePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onNodePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onDragOver: (event: DragEvent<HTMLDivElement>) => void;
	onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

/**
 * Drag, connect-from-handles, delete, focus modes, and palette drop for FlowCanvas.
 */
function useFlowCanvasInteraction(
	args: UseFlowCanvasInteractionArgs,
): UseFlowCanvasInteractionResult {
	const {
		nodes,
		edges,
		editable,
		selectedId,
		viewportRef,
		onNodeSelect,
		onNodesChange,
		onEdgesChange,
		onConnect,
		isValidConnection,
		dropMimeType,
		onDropType,
	} = args;

	const [focusIndex, setFocusIndex] = useState(0);
	const [focusMode, setFocusMode] = useState<FlowFocusMode>("navigate");
	const [connecting, setConnecting] = useState<ConnectingState | null>(null);
	const [connectionHint, setConnectionHint] = useState<string | null>(null);
	const dragRef = useRef<{
		nodeId: string;
		offsetX: number;
		offsetY: number;
	} | null>(null);

	function selectNode(nodeId: string | null) {
		if (onNodeSelect !== undefined) {
			onNodeSelect(nodeId);
		}
	}

	function clearConnecting() {
		setConnecting(null);
	}

	function moveNode(nodeId: string, x: number, y: number) {
		if (onNodesChange === undefined) {
			return;
		}

		const next: FlowNode[] = [];
		for (const node of nodes) {
			if (node.id === nodeId) {
				next.push({ ...node, x, y });
			} else {
				next.push(node);
			}
		}

		onNodesChange(next);
	}

	function deleteSelectedNode() {
		if (!editable || selectedId === undefined) {
			return;
		}
		if (onNodesChange === undefined) {
			return;
		}

		const nextNodes: FlowNode[] = [];
		for (const node of nodes) {
			if (node.id !== selectedId) {
				nextNodes.push(node);
			}
		}

		onNodesChange(nextNodes);

		if (onEdgesChange !== undefined) {
			const nextEdges: FlowEdge[] = [];
			for (const edge of edges) {
				if (edge.source !== selectedId && edge.target !== selectedId) {
					nextEdges.push(edge);
				}
			}

			onEdgesChange(nextEdges);
		}

		selectNode(null);
		setFocusIndex(0);
		setFocusMode("navigate");
		clearConnecting();
		setConnectionHint(null);
	}

	function onShellKeyDown(
		index: number,
		event: KeyboardEvent<HTMLDivElement>,
	) {
		if (focusMode === "edit-node") {
			if (event.key === "Escape") {
				event.preventDefault();
				setFocusMode("navigate");
			}

			return;
		}

		if (event.key === "Delete" || event.key === "Backspace") {
			if (editable && selectedId !== undefined) {
				event.preventDefault();
				deleteSelectedNode();
			}

			return;
		}

		if (nodes.length === 0) {
			return;
		}

		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			event.preventDefault();

			setFocusIndex((current) => {
				return (current + 1) % nodes.length;
			});

			return;
		}
		if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			event.preventDefault();

			setFocusIndex((current) => {
				return (current - 1 + nodes.length) % nodes.length;
			});

			return;
		}
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();

			const focused = nodes[index];
			if (focused === undefined) {
				return;
			}

			selectNode(focused.id);

			if (editable) {
				setFocusMode("edit-node");
			}

			return;
		}
		if (event.key === "Escape") {
			event.preventDefault();
			selectNode(null);
			clearConnecting();
			setConnectionHint(null);
		}
	}

	function beginConnect(source: string, sourcePort?: string) {
		if (!editable || onConnect === undefined) {
			return;
		}
		setConnectionHint(null);
		setConnecting({ source, sourcePort });
	}

	function completeConnect(target: string, targetPort?: string) {
		if (connecting === null || onConnect === undefined) {
			return;
		}

		const connection: FlowConnection = {
			source: connecting.source,
			target,
			sourcePort: connecting.sourcePort,
			targetPort,
		};

		if (isValidConnection !== undefined && !isValidConnection(connection)) {
			clearConnecting();
			setConnectionHint(
				"Connection rejected: ports must share the same value type.",
			);

			return;
		}

		onConnect(connection);
		clearConnecting();
		setConnectionHint(null);
	}

	function onPortClick(
		nodeId: string,
		port: FlowPort,
		kind: "source" | "target",
	) {
		if (!editable || onConnect === undefined) {
			return;
		}

		if (kind === "source") {
			beginConnect(nodeId, port.id);
			return;
		}

		completeConnect(nodeId, port.id);
	}

	function onNodePointerDown(
		node: FlowNode,
		event: ReactPointerEvent<HTMLDivElement>,
	) {
		if (!editable || onNodesChange === undefined) {
			return;
		}
		if (event.button !== 0 || event.altKey) {
			return;
		}

		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}
		if (target.closest('[data-slot="graph-handle"]') !== null) {
			return;
		}
		if (target.closest(".nodrag") !== null) {
			return;
		}

		const handle = viewportRef.current;
		if (handle === null) {
			return;
		}

		event.stopPropagation();
		event.currentTarget.setPointerCapture(event.pointerId);

		const flow = handle.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});

		dragRef.current = {
			nodeId: node.id,
			offsetX: flow.x - node.x,
			offsetY: flow.y - node.y,
		};
	}

	function onNodePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		const drag = dragRef.current;
		if (drag === null) {
			return;
		}

		const handle = viewportRef.current;
		if (handle === null) {
			return;
		}

		const flow = handle.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});

		moveNode(drag.nodeId, flow.x - drag.offsetX, flow.y - drag.offsetY);
	}

	function onNodePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
		if (dragRef.current === null) {
			return;
		}

		dragRef.current = null;

		event.currentTarget.releasePointerCapture(event.pointerId);
	}

	function onDragOver(event: DragEvent<HTMLDivElement>) {
		if (dropMimeType === undefined || onDropType === undefined) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}

	function onDrop(event: DragEvent<HTMLDivElement>) {
		if (dropMimeType === undefined || onDropType === undefined) {
			return;
		}

		event.preventDefault();

		const type = event.dataTransfer.getData(dropMimeType);
		if (type.length === 0) {
			return;
		}

		const handle = viewportRef.current;
		if (handle === null) {
			return;
		}

		const position = handle.screenToFlowPosition({
			x: event.clientX,
			y: event.clientY,
		});

		onDropType(type, position);
	}

	return {
		focusIndex,
		setFocusIndex,
		focusMode,
		setFocusMode,
		connecting,
		connectionHint,
		clearConnecting,
		selectNode,
		onShellKeyDown,
		onPortClick,
		onNodePointerDown,
		onNodePointerMove,
		onNodePointerUp,
		onDragOver,
		onDrop,
	};
}

export type {
	FlowFocusMode,
	UseFlowCanvasInteractionArgs,
	UseFlowCanvasInteractionResult,
};
export { useFlowCanvasInteraction };
