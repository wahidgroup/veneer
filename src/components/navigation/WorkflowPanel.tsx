import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "../../utils/cn.js";
import { useWorkflowContext } from "./workflowShared.js";

interface WorkflowPanelProps extends Omit<ComponentProps<"div">, "title"> {
	value: string;
	title: string;
	children: ReactNode;
}

/**
 * Step body. Inactive panels stay mounted and hidden (WCAG 3.3.7).
 * Title receives focus after navigation, not on initial mount.
 */
function WorkflowPanel({
	value,
	title,
	children,
	className,
	...rest
}: WorkflowPanelProps) {
	const { value: active, baseId, focusEpoch } = useWorkflowContext();
	const titleRef = useRef<HTMLHeadingElement>(null);
	const selected = active === value;
	const panelId = `${baseId}-panel-${value}`;
	const titleId = `${baseId}-title-${value}`;

	useEffect(() => {
		if (!selected) {
			return;
		}
		if (focusEpoch === 0) {
			return;
		}

		titleRef.current?.focus();
	}, [selected, focusEpoch]);

	return (
		<div
			data-slot="workflow-panel"
			id={panelId}
			hidden={!selected}
			aria-labelledby={titleId}
			className={cn("flex flex-col gap-3 outline-none", className)}
			{...rest}
		>
			<h2
				ref={titleRef}
				id={titleId}
				tabIndex={-1}
				className="text-lg font-semibold text-foreground outline-none"
			>
				{title}
			</h2>
			{children}
		</div>
	);
}

export type { WorkflowPanelProps };
export { WorkflowPanel };
