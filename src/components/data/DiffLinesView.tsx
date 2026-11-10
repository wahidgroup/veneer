import type { ComponentProps, ReactNode } from "react";

import type { DiffLayout, DiffLine } from "./diffTypes.js";
import { Badge } from "../indicators/Badge.js";
import { cn } from "../../utils/cn.js";
import { buildDiffLines } from "../../utils/buildDiffLines.js";

const DEFAULT_MAX_LINES = 2000;

interface DiffLinesViewProps extends Omit<ComponentProps<"div">, "children"> {
	lines?: DiffLine[];
	oldText?: string;
	newText?: string;
	layout?: DiffLayout;
	path?: string;
	maxLines?: number;
	"aria-label": string;
}

function markerForKind(kind: DiffLine["kind"]): string {
	if (kind === "added") {
		return "+";
	}
	if (kind === "removed") {
		return "−";
	}
	if (kind === "hunk") {
		return "@";
	}

	return " ";
}

function announceForLine(line: DiffLine): string {
	if (line.kind === "added") {
		let n = "";
		if (line.newLineNumber !== undefined) {
			n = ` line ${String(line.newLineNumber)}`;
		}

		return `added${n}: ${line.text}`;
	}
	if (line.kind === "removed") {
		let n = "";
		if (line.oldLineNumber !== undefined) {
			n = ` line ${String(line.oldLineNumber)}`;
		}

		return `removed${n}: ${line.text}`;
	}
	if (line.kind === "hunk") {
		return `hunk ${line.text}`;
	}

	let n = "";
	if (line.newLineNumber !== undefined) {
		n = ` line ${String(line.newLineNumber)}`;
	}

	return `context${n}: ${line.text}`;
}

function lineRowClass(kind: DiffLine["kind"]): string {
	if (kind === "added") {
		return "bg-success/15 text-foreground";
	}
	if (kind === "removed") {
		return "bg-destructive/15 text-foreground";
	}
	if (kind === "hunk") {
		return "bg-muted text-muted-foreground";
	}

	return "bg-transparent text-foreground";
}

function countLineStats(lines: DiffLine[]): { added: number; removed: number } {
	let added = 0;
	let removed = 0;
	for (const line of lines) {
		if (line.kind === "added") {
			added += 1;
		} else if (line.kind === "removed") {
			removed += 1;
		}
	}

	return { added, removed };
}

function resolveLines(props: { lines?: DiffLine[]; oldText?: string; newText?: string }): DiffLine[] {
	if (props.lines !== undefined) {
		return props.lines;
	}

	let oldText = props.oldText;
	oldText ??= "";

	let newText = props.newText;
	newText ??= "";

	return buildDiffLines(oldText, newText);
}

function UnifiedDiffRow({ line }: { line: DiffLine }) {
	const marker = markerForKind(line.kind);
	let oldNum = "";
	if (line.oldLineNumber !== undefined) {
		oldNum = String(line.oldLineNumber);
	}

	let newNum = "";
	if (line.newLineNumber !== undefined) {
		newNum = String(line.newLineNumber);
	}

	return (
		<div
			role="row"
			data-kind={line.kind}
			aria-label={announceForLine(line)}
			className={cn("flex min-w-0", lineRowClass(line.kind))}
		>
			<span role="cell" className="w-10 shrink-0 select-none px-1 text-right text-muted-foreground">
				{oldNum}
			</span>
			<span role="cell" className="w-10 shrink-0 select-none px-1 text-right text-muted-foreground">
				{newNum}
			</span>
			<span aria-hidden="true" className="w-4 shrink-0 select-none text-center">
				{marker}
			</span>
			<span role="cell" className="min-w-0 flex-1 whitespace-pre-wrap px-2 py-0.5">
				{line.text}
			</span>
		</div>
	);
}

function SplitDiffRow({ line }: { line: DiffLine }) {
	const marker = markerForKind(line.kind);

	if (line.kind === "hunk") {
		return (
			<div
				role="row"
				data-kind="hunk"
				aria-label={announceForLine(line)}
				className={cn("px-2 py-0.5", lineRowClass("hunk"))}
			>
				<span role="cell">{line.text}</span>
			</div>
		);
	}

	let leftText = "";
	let rightText = "";
	let leftNum = "";
	let rightNum = "";
	let leftKind: DiffLine["kind"] = "context";
	let rightKind: DiffLine["kind"] = "context";

	if (line.kind === "removed") {
		leftText = line.text;
		leftKind = "removed";
		if (line.oldLineNumber !== undefined) {
			leftNum = String(line.oldLineNumber);
		}
	} else if (line.kind === "added") {
		rightText = line.text;
		rightKind = "added";
		if (line.newLineNumber !== undefined) {
			rightNum = String(line.newLineNumber);
		}
	} else {
		leftText = line.text;
		rightText = line.text;
		leftKind = "context";
		rightKind = "context";
		if (line.oldLineNumber !== undefined) {
			leftNum = String(line.oldLineNumber);
		}
		if (line.newLineNumber !== undefined) {
			rightNum = String(line.newLineNumber);
		}
	}

	let leftMarker = " ";
	if (leftKind === "removed") {
		leftMarker = marker;
	}

	let rightMarker = " ";
	if (rightKind === "added") {
		rightMarker = marker;
	}

	return (
		<div role="row" data-kind={line.kind} aria-label={announceForLine(line)} className="grid grid-cols-2">
			<div className={cn("flex min-w-0 border-r border-border", lineRowClass(leftKind))}>
				<span role="cell" className="w-10 shrink-0 select-none px-1 text-right text-muted-foreground">
					{leftNum}
				</span>
				<span aria-hidden="true" className="w-4 shrink-0 select-none text-center">
					{leftMarker}
				</span>
				<span role="cell" className="min-w-0 flex-1 whitespace-pre-wrap px-2 py-0.5">
					{leftText}
				</span>
			</div>
			<div className={cn("flex min-w-0", lineRowClass(rightKind))}>
				<span role="cell" className="w-10 shrink-0 select-none px-1 text-right text-muted-foreground">
					{rightNum}
				</span>
				<span aria-hidden="true" className="w-4 shrink-0 select-none text-center">
					{rightMarker}
				</span>
				<span role="cell" className="min-w-0 flex-1 whitespace-pre-wrap px-2 py-0.5">
					{rightText}
				</span>
			</div>
		</div>
	);
}

/**
 * Line-mode DiffView body: unified or split rows with optional path header.
 */
function DiffLinesView({
	lines: linesProp,
	oldText,
	newText,
	layout,
	path,
	maxLines,
	"aria-label": ariaLabel,
	className,
	...rest
}: DiffLinesViewProps) {
	let resolvedLayout: DiffLayout = "unified";
	if (layout === "split") {
		resolvedLayout = "split";
	}

	let resolvedMax = maxLines;
	resolvedMax ??= DEFAULT_MAX_LINES;
	if (resolvedMax < 1) {
		resolvedMax = 1;
	}

	const allLines = resolveLines({
		lines: linesProp,
		oldText,
		newText,
	});

	const truncated = allLines.length > resolvedMax;
	let visibleLines = allLines;
	if (truncated) {
		visibleLines = allLines.slice(0, resolvedMax);
	}

	const stats = countLineStats(allLines);
	let header: ReactNode = null;
	if (path !== undefined && path.length > 0) {
		header = (
			<div
				data-slot="diff-view-header"
				className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2"
			>
				<span className="font-mono text-sm text-foreground">{path}</span>
				<Badge variant="success" size="sm">
					+{String(stats.added)}
				</Badge>
				<Badge variant="danger" size="sm">
					−{String(stats.removed)}
				</Badge>
			</div>
		);
	}

	let truncateNote: ReactNode = null;
	if (truncated) {
		truncateNote = (
			<p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
				Showing {String(visibleLines.length)} of {String(allLines.length)} lines
			</p>
		);
	}

	let body: ReactNode;
	if (resolvedLayout === "split") {
		body = (
			<div role="table" aria-label={ariaLabel} className="font-mono text-xs">
				{visibleLines.map((line, index) => {
					return <SplitDiffRow key={`${line.kind}-${String(index)}`} line={line} />;
				})}
			</div>
		);
	} else {
		body = (
			<div role="table" aria-label={ariaLabel} className="font-mono text-xs">
				{visibleLines.map((line, index) => {
					return <UnifiedDiffRow key={`${line.kind}-${String(index)}`} line={line} />;
				})}
			</div>
		);
	}

	return (
		<div
			data-slot="diff-view"
			data-mode="lines"
			data-layout={resolvedLayout}
			className={cn("overflow-hidden rounded-md border border-border bg-card", className)}
			{...rest}
		>
			{header}
			{body}
			{truncateNote}
		</div>
	);
}

export type { DiffLinesViewProps };
export { DiffLinesView };
