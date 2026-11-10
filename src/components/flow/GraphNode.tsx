import type { ComponentProps, KeyboardEvent, ReactNode } from "react";

import { cn } from "../../utils/cn.js";
import { Card } from "../layout/Card.js";
import type { FlowNode, FlowPort, FlowStatus } from "./flowTypes.js";
import { statusRingClass } from "./flowStatus.js";
import { GraphHandle } from "./GraphHandle.js";

interface GraphNodeProps extends Omit<ComponentProps<"div">, "children" | "id"> {
	node: FlowNode;
	selected?: boolean;
	focused?: boolean;
	status?: FlowStatus;
	editMode?: boolean;
	showHandles?: boolean;
	tabIndex?: number;
	onShellKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
	onPortClick?: (port: FlowPort, kind: "source" | "target") => void;
	children?: ReactNode;
}

/**
 * Positioned HTML node shell. Focus target in Navigate mode; hosts handles + card body.
 * WEST/NORTH ports are connection targets; EAST/SOUTH are sources.
 */
function GraphNode({
	node,
	selected = false,
	focused = false,
	status = "idle",
	editMode = false,
	showHandles = false,
	tabIndex = -1,
	onShellKeyDown,
	onPortClick,
	className,
	children,
	style,
	...rest
}: GraphNodeProps) {
	const ring = statusRingClass(status);
	let selectedClass = "";
	if (selected) {
		selectedClass = "border-primary";
	}

	let focusClass = "";
	if (focused) {
		focusClass = "outline outline-2 outline-ring outline-offset-2";
	}

	let handleTabIndex = -1;
	if (editMode) {
		handleTabIndex = 0;
	}

	const handles: ReactNode[] = [];
	if (showHandles && node.ports !== undefined) {
		const sideCounts: Partial<Record<FlowPort["side"], number>> = {};
		const sideIndexes: Partial<Record<FlowPort["side"], number>> = {};
		for (const port of node.ports) {
			const prev = sideCounts[port.side];
			if (prev === undefined) {
				sideCounts[port.side] = 1;
			} else {
				sideCounts[port.side] = prev + 1;
			}
		}

		for (const port of node.ports) {
			let kind: "source" | "target" = "source";
			if (port.side === "WEST" || port.side === "NORTH") {
				kind = "target";
			}

			const used = sideIndexes[port.side];
			let slotIndex = 0;
			if (used !== undefined) {
				slotIndex = used;
			}

			sideIndexes[port.side] = slotIndex + 1;

			let slotCount = 1;
			const counted = sideCounts[port.side];
			if (counted !== undefined) {
				slotCount = counted;
			}

			handles.push(
				<GraphHandle
					key={`${port.side}:${port.id}`}
					portId={port.id}
					side={port.side}
					nodeWidth={node.width}
					nodeHeight={node.height}
					slotIndex={slotIndex}
					slotCount={slotCount}
					anchor={port.anchor}
					kind={kind}
					valueKind={port.valueKind}
					tabIndex={handleTabIndex}
					aria-label={`${node.label} ${kind} port ${port.id}`}
					onClick={(event) => {
						event.stopPropagation();
						if (onPortClick !== undefined) {
							onPortClick(port, kind);
						}
					}}
				/>,
			);
		}
	}

	let body: ReactNode = children;
	if (body === undefined) {
		body = (
			<Card size="sm" className="h-full w-full shadow-none">
				<p className="text-sm font-medium">{node.label}</p>
			</Card>
		);
	}

	let bodyPointerClass = "pointer-events-none";
	if (editMode) {
		bodyPointerClass = "";
	}

	let selectedAttr = "false";
	if (selected) {
		selectedAttr = "true";
	}

	return (
		/* Composite flow node: focusable shell with nested port Buttons. */
		/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- roving tabindex group hosts keyboard nav */
		<div
			data-slot="graph-node"
			data-node-id={node.id}
			data-status={status}
			role="group"
			aria-label={node.label}
			aria-roledescription="flow node"
			tabIndex={tabIndex}
			data-selected={selectedAttr}
			className={cn("absolute box-border", ring, selectedClass, focusClass, className)}
			style={{
				...style,
				left: node.x,
				top: node.y,
				width: node.width,
				height: node.height,
			}}
			onKeyDown={onShellKeyDown}
			{...rest}
		>
			{handles}
			<div data-slot="graph-node-body" className={cn("h-full w-full", bodyPointerClass)}>
				{body}
			</div>
		</div>
	);
}

export type { GraphNodeProps };
export { GraphNode };
