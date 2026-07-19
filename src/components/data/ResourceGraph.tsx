import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useId, useState } from "react";

import { cn } from "../../utils/cn.js";
import { DescriptionList } from "./DescriptionList.js";

interface ResourceGraphNode {
	id: string;
	label: string;
}

interface ResourceGraphEdge {
	from: string;
	to: string;
	label?: string;
}

interface ResourceGraphProps extends Omit<ComponentProps<"div">, "children"> {
	nodes: ResourceGraphNode[];
	edges: ResourceGraphEdge[];
	selectedId?: string;
	onNodeSelect?: (nodeId: string) => void;
	"aria-label": string;
}

interface LaidOutNode extends ResourceGraphNode {
	x: number;
	y: number;
}

function layoutNodes(nodes: ResourceGraphNode[]): LaidOutNode[] {
	const columns = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
	const laidOut: LaidOutNode[] = [];
	for (let index = 0; index < nodes.length; index += 1) {
		const node = nodes[index];
		if (node === undefined) {
			continue;
		}

		const column = index % columns;
		const row = Math.floor(index / columns);

		laidOut.push({
			...node,
			x: 80 + column * 140,
			y: 60 + row * 100,
		});
	}

	return laidOut;
}

/**
 * Dependency map v1: SVG nodes/edges plus an accessible edge list.
 * No canvas/pan-zoom. Selection is optional via `onNodeSelect`.
 */
function ResourceGraph({
	nodes,
	edges,
	selectedId,
	onNodeSelect,
	"aria-label": ariaLabel,
	className,
	...rest
}: ResourceGraphProps) {
	const baseId = useId();
	const [focusIndex, setFocusIndex] = useState(0);
	const laidOut = layoutNodes(nodes);

	let width = 320;
	let height = 200;
	if (laidOut.length > 0) {
		let maxX = 0;
		let maxY = 0;
		for (const node of laidOut) {
			if (node.x > maxX) {
				maxX = node.x;
			}
			if (node.y > maxY) {
				maxY = node.y;
			}
		}

		width = maxX + 80;
		height = maxY + 60;
	}

	function selectNode(nodeId: string) {
		if (onNodeSelect !== undefined) {
			onNodeSelect(nodeId);
		}
	}

	function onGraphKeyDown(event: KeyboardEvent<SVGSVGElement>) {
		if (laidOut.length === 0) {
			return;
		}

		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			event.preventDefault();

			setFocusIndex((current) => {
				return (current + 1) % laidOut.length;
			});

			return;
		}
		if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			event.preventDefault();

			setFocusIndex((current) => {
				return (current - 1 + laidOut.length) % laidOut.length;
			});

			return;
		}
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const focused = laidOut[focusIndex];
			if (focused !== undefined) {
				selectNode(focused.id);
			}
		}
	}

	const positionById = new Map<string, LaidOutNode>();
	for (const node of laidOut) {
		positionById.set(node.id, node);
	}

	const edgeLines: ReactNode[] = [];
	for (const edge of edges) {
		const from = positionById.get(edge.from);
		const to = positionById.get(edge.to);
		if (from === undefined || to === undefined) {
			continue;
		}

		edgeLines.push(
			<line
				key={`${edge.from}->${edge.to}`}
				x1={from.x}
				y1={from.y}
				x2={to.x}
				y2={to.y}
				className="stroke-border"
				strokeWidth={2}
			/>,
		);
	}

	const nodeShapes: ReactNode[] = laidOut.map((node, index) => {
		let isSelected = false;
		if (selectedId === node.id) {
			isSelected = true;
		}

		let isFocused = false;
		if (index === focusIndex) {
			isFocused = true;
		}

		let tabIndex = -1;
		if (isFocused) {
			tabIndex = 0;
		}

		let fillClass = "fill-card stroke-border";
		if (isSelected) {
			fillClass = "fill-primary/15 stroke-primary";
		}

		let interactiveClass = "outline-none";
		if (onNodeSelect !== undefined) {
			interactiveClass = cn(interactiveClass, "cursor-pointer");
		}

		let ring: ReactNode = null;
		if (isFocused) {
			ring = (
				<circle
					cx={node.x}
					cy={node.y}
					r={28}
					fill="none"
					className="stroke-ring"
					strokeWidth={2}
				/>
			);
		}

		return (
			<g key={node.id}>
				{ring}
				<circle
					id={`${baseId}-node-${node.id}`}
					cx={node.x}
					cy={node.y}
					r={22}
					tabIndex={tabIndex}
					role="button"
					aria-label={node.label}
					aria-pressed={isSelected}
					className={cn(fillClass, interactiveClass)}
					strokeWidth={2}
					onClick={() => {
						setFocusIndex(index);
						selectNode(node.id);
					}}
					onFocus={() => {
						setFocusIndex(index);
					}}
				/>
				<text
					x={node.x}
					y={node.y + 40}
					textAnchor="middle"
					className="fill-foreground text-[11px]"
					aria-hidden="true"
				>
					{node.label}
				</text>
			</g>
		);
	});

	const listItems = edges.map((edge) => {
		let description = `${edge.from} -> ${edge.to}`;
		if (edge.label !== undefined && edge.label.length > 0) {
			description = `${description} (${edge.label})`;
		}

		return {
			term: edge.from,
			description,
		};
	});

	return (
		<div
			data-slot="resource-graph"
			className={cn("flex flex-col gap-4", className)}
			{...rest}
		>
			<svg
				role="group"
				aria-label={ariaLabel}
				width="100%"
				viewBox={`0 0 ${String(width)} ${String(height)}`}
				className="max-w-full rounded-md border border-border bg-muted/30"
				onKeyDown={onGraphKeyDown}
			>
				{edgeLines}
				{nodeShapes}
			</svg>
			<DescriptionList
				aria-label={`${ariaLabel} edges`}
				items={listItems}
				columns={1}
			/>
		</div>
	);
}

export type { ResourceGraphEdge, ResourceGraphNode, ResourceGraphProps };
export { ResourceGraph };
