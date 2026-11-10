import type { ComponentProps } from "react";

import type { FlowPortSide, FlowValueKind } from "./flowTypes.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { portAnchor } from "./flowStatus.js";
import { handleTintForValueKind } from "./valueKind.js";

interface GraphHandleProps extends Omit<ComponentProps<typeof Button>, "type" | "size" | "variant" | "children"> {
	portId: string;
	side: FlowPortSide;
	nodeWidth: number;
	nodeHeight: number;
	/** 0-based index among ports on this side. */
	slotIndex?: number;
	/** Total ports on this side. */
	slotCount?: number;
	/** Optional 0–1 side position; overrides even slot spread. */
	anchor?: number;
	kind?: "source" | "target";
	valueKind?: FlowValueKind;
}

/**
 * Absolute port anchor on a flow node. Reuses Button icon/ghost chrome.
 */
function GraphHandle({
	portId,
	side,
	nodeWidth,
	nodeHeight,
	slotIndex = 0,
	slotCount = 1,
	anchor,
	kind = "source",
	valueKind,
	className,
	style,
	...rest
}: GraphHandleProps) {
	const point = portAnchor(side, nodeWidth, nodeHeight, slotIndex, slotCount, anchor);
	const left = point.x - 5;
	const top = point.y - 5;
	const tint = handleTintForValueKind(valueKind);

	return (
		<Button
			type="button"
			size="icon"
			variant="ghost"
			data-slot="graph-handle"
			data-port-id={portId}
			data-side={side}
			data-kind={kind}
			data-value-kind={valueKind}
			data-slot-index={slotIndex}
			aria-label={`Port ${portId}`}
			className={cn(
				"absolute z-10 size-2.5 min-h-0 min-w-0 rounded-full border border-border bg-card p-0",
				"hover:border-primary",
				tint,
				className,
			)}
			style={{
				...style,
				left,
				top,
			}}
			{...rest}
		/>
	);
}

export type { GraphHandleProps };
export { GraphHandle };
