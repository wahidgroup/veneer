import type { ComponentProps } from "react";
import { useId } from "react";

import type { DiffLayout, DiffLine, DiffResource, DiffViewMode } from "./diffTypes.js";
import { DiffLinesView } from "./DiffLinesView.js";
import { DiffTreeView } from "./DiffTreeView.js";

interface DiffViewProps extends Omit<ComponentProps<"div">, "children"> {
	mode: DiffViewMode;
	lines?: DiffLine[];
	oldText?: string;
	newText?: string;
	layout?: DiffLayout;
	path?: string;
	maxLines?: number;
	resources?: DiffResource[];
	defaultExpanded?: boolean;
	"aria-label"?: string;
}

function DiffView({
	mode,
	lines,
	oldText,
	newText,
	layout,
	path,
	maxLines,
	resources,
	defaultExpanded,
	"aria-label": ariaLabel,
	className,
	...rest
}: DiffViewProps) {
	let resolvedAria = ariaLabel;
	if (resolvedAria === undefined || resolvedAria.length === 0) {
		if (mode === "tree") {
			resolvedAria = "Plan diff";
		} else {
			resolvedAria = "Code diff";
		}
	}

	const baseId = useId();
	if (mode === "tree") {
		return (
			<DiffTreeView
				resources={resources}
				defaultExpanded={defaultExpanded}
				aria-label={resolvedAria}
				baseId={baseId}
				className={className}
				{...rest}
			/>
		);
	}

	return (
		<DiffLinesView
			lines={lines}
			oldText={oldText}
			newText={newText}
			layout={layout}
			path={path}
			maxLines={maxLines}
			aria-label={resolvedAria}
			className={className}
			{...rest}
		/>
	);
}

export type { DiffViewProps };
export type {
	DiffAttribute,
	DiffChangeKind,
	DiffLayout,
	DiffLine,
	DiffLineKind,
	DiffResource,
	DiffViewMode,
} from "./diffTypes.js";
export { DiffView };
