import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import type { BadgeProps } from "../indicators/Badge.js";
import type { ChipGroupItem } from "../navigation/ChipGroup.js";
import { cn } from "../../utils/cn.js";
import { EmptyState } from "../feedback/EmptyState.js";
import { Button } from "../forms/Button.js";
import { CopyButton } from "../forms/CopyButton.js";
import { DateTimePicker } from "../forms/DateTimePicker.js";
import { Label } from "../forms/Label.js";
import { SearchInput } from "../forms/SearchInput.js";
import { Badge } from "../indicators/Badge.js";
import { ChipGroup } from "../navigation/ChipGroup.js";
import { CodeBlock } from "./CodeBlock.js";

type LogViewerLevel = "debug" | "info" | "warn" | "error";

interface LogViewerLine {
	id: string;
	text: string;
	level?: LogViewerLevel;
	at?: string;
	timestamp?: ReactNode;
	data?: unknown;
}

interface LogViewerProps extends Omit<ComponentProps<"div">, "children"> {
	lines: LogViewerLine[];
	"aria-label": string;
	follow?: boolean;
	defaultFollow?: boolean;
	onFollowChange?: (follow: boolean) => void;
	levels?: LogViewerLevel[];
	defaultLevels?: LogViewerLevel[];
	onLevelsChange?: (levels: LogViewerLevel[]) => void;
	queries?: string[];
	defaultQueries?: string[];
	onQueriesChange?: (queries: string[]) => void;
	from?: string;
	defaultFrom?: string;
	onFromChange?: (from: string) => void;
	to?: string;
	defaultTo?: string;
	onToChange?: (to: string) => void;
	maxLines?: number;
}

const ALL_LEVELS: LogViewerLevel[] = ["debug", "info", "warn", "error"];

const LEVEL_LABEL: Record<LogViewerLevel, string> = {
	debug: "debug",
	info: "info",
	warn: "warn",
	error: "error",
};

function badgeVariantForLevel(
	level: LogViewerLevel,
): NonNullable<BadgeProps["variant"]> {
	if (level === "debug") {
		return "default";
	}
	if (level === "info") {
		return "info";
	}
	if (level === "warn") {
		return "warning";
	}
	return "danger";
}

function parseInstant(value: string): number | null {
	if (value === "") {
		return null;
	}

	const ms = Date.parse(value);
	if (Number.isNaN(ms)) {
		return null;
	}

	return ms;
}

function formatAt(at: string): string {
	const ms = parseInstant(at);
	if (ms === null) {
		return at;
	}

	return new Date(ms)
		.toISOString()
		.replace("T", " ")
		.replace(/\.\d{3}Z$/, "Z");
}

function formatLineData(data: unknown): string {
	try {
		return JSON.stringify(data, null, 2);
	} catch {
		return String(data);
	}
}

function lineSearchHaystack(line: LogViewerLine): string {
	let haystack = line.text;
	if (line.data !== undefined) {
		haystack = `${haystack}\n${formatLineData(line.data)}`;
	}

	return haystack.toLowerCase();
}

function filterLines(
	lines: LogViewerLine[],
	levels: LogViewerLevel[],
	from: string,
	to: string,
	queries: string[],
): LogViewerLine[] {
	const levelSet = new Set(levels);
	const fromMs = parseInstant(from);
	const toMs = parseInstant(to);
	const timeActive = fromMs !== null || toMs !== null;
	const needles = queries
		.map((query) => {
			return query.trim().toLowerCase();
		})
		.filter((query) => {
			return query.length > 0;
		});

	return lines.filter((line) => {
		if (line.level !== undefined && !levelSet.has(line.level)) {
			return false;
		}

		if (timeActive) {
			if (line.at === undefined) {
				return false;
			}

			const atMs = parseInstant(line.at);
			if (atMs === null) {
				return false;
			}
			if (fromMs !== null && atMs < fromMs) {
				return false;
			}
			if (toMs !== null && atMs > toMs) {
				return false;
			}
		}

		if (needles.length > 0) {
			const haystack = lineSearchHaystack(line);
			let matched = false;
			for (const needle of needles) {
				if (haystack.includes(needle)) {
					matched = true;
					break;
				}
			}

			if (!matched) {
				return false;
			}
		}

		return true;
	});
}

/**
 * Keep the newest `maxLines` (buffer tail). Oldest → newest top → bottom
 * (live-tail / `tail -f` convention).
 */
function visibleLines(
	lines: LogViewerLine[],
	maxLines: number | undefined,
): LogViewerLine[] {
	if (maxLines === undefined) {
		return lines;
	}

	if (maxLines < 1) {
		return [];
	}

	if (lines.length <= maxLines) {
		return lines;
	}

	return lines.slice(lines.length - maxLines);
}

function isLogViewerLevel(value: string): value is LogViewerLevel {
	return ALL_LEVELS.some((level) => {
		return level === value;
	});
}

/**
 * Live-tail log panel. Oldest → newest (new lines at bottom). Browseable
 * `role="log"` with `aria-live="off"`; mode / filter summaries go to a polite
 * `role="status"`. Lines may carry optional `data` for expandable JSON.
 * Text filters are multi-query chips (OR). Composes ChipGroup, SearchInput,
 * DateTimePicker, Badge, CopyButton, and CodeBlock.
 *
 * @see {@link https://www.w3.org/TR/wai-aria-1.2/#log WAI-ARIA 1.2 log}
 */
function LogViewer({
	lines,
	"aria-label": ariaLabel,
	follow,
	defaultFollow,
	onFollowChange,
	levels,
	defaultLevels,
	onLevelsChange,
	queries,
	defaultQueries,
	onQueriesChange,
	from,
	defaultFrom,
	onFromChange,
	to,
	defaultTo,
	onToChange,
	maxLines,
	className,
	...rest
}: LogViewerProps) {
	const followControlled = follow !== undefined;
	const [uncontrolledFollow, setUncontrolledFollow] = useState(() => {
		if (defaultFollow === false) {
			return false;
		}

		return true;
	});

	let isFollowing = uncontrolledFollow;
	if (followControlled) {
		isFollowing = follow;
	}

	const levelsControlled = levels !== undefined;
	const [uncontrolledLevels, setUncontrolledLevels] = useState<
		LogViewerLevel[]
	>(() => {
		if (defaultLevels !== undefined) {
			return defaultLevels;
		}

		return [...ALL_LEVELS];
	});

	let currentLevels = uncontrolledLevels;
	if (levelsControlled) {
		currentLevels = levels;
	}

	const queriesControlled = queries !== undefined;
	const [uncontrolledQueries, setUncontrolledQueries] = useState<string[]>(
		() => {
			if (defaultQueries !== undefined) {
				return defaultQueries;
			}

			return [];
		},
	);

	let currentQueries = uncontrolledQueries;
	if (queriesControlled) {
		currentQueries = queries;
	}

	const [draftQuery, setDraftQuery] = useState("");

	const fromControlled = from !== undefined;
	const [uncontrolledFrom, setUncontrolledFrom] = useState(() => {
		if (defaultFrom !== undefined) {
			return defaultFrom;
		}

		return "";
	});

	let currentFrom = uncontrolledFrom;
	if (fromControlled) {
		currentFrom = from;
	}

	const toControlled = to !== undefined;
	const [uncontrolledTo, setUncontrolledTo] = useState(() => {
		if (defaultTo !== undefined) {
			return defaultTo;
		}

		return "";
	});

	let currentTo = uncontrolledTo;
	if (toControlled) {
		currentTo = to;
	}

	const [expandedIds, setExpandedIds] = useState(() => {
		return new Set<string>();
	});

	const [pauseAtCount, setPauseAtCount] = useState<number | null>(() => {
		let startFollow = true;
		if (follow !== undefined) {
			startFollow = follow;
		} else if (defaultFollow === false) {
			startFollow = false;
		}

		if (startFollow) {
			return null;
		}

		return lines.length;
	});
	const [prevFollow, setPrevFollow] = useState(isFollowing);
	const logRef = useRef<HTMLDivElement | null>(null);
	const pinningRef = useRef(false);
	const fromId = useId();
	const toId = useId();
	const detailIdPrefix = useId();

	if (prevFollow !== isFollowing) {
		setPrevFollow(isFollowing);
		if (isFollowing) {
			setPauseAtCount(null);
		} else {
			setPauseAtCount(lines.length);
		}
	}

	let pendingCount = 0;
	if (!isFollowing && pauseAtCount !== null) {
		pendingCount = lines.length - pauseAtCount;
		if (pendingCount < 0) {
			pendingCount = 0;
		}
	}

	const filtered = filterLines(
		lines,
		currentLevels,
		currentFrom,
		currentTo,
		currentQueries,
	);
	const visible = visibleLines(filtered, maxLines);

	useEffect(() => {
		if (!isFollowing) {
			return;
		}

		const el = logRef.current;
		if (el === null) {
			return;
		}

		pinningRef.current = true;
		el.scrollTop = el.scrollHeight;
		const frame = window.requestAnimationFrame(() => {
			pinningRef.current = false;
		});

		return () => {
			window.cancelAnimationFrame(frame);
			pinningRef.current = false;
		};
	}, [visible, isFollowing, expandedIds]);

	function commitFollow(next: boolean) {
		if (!followControlled) {
			setUncontrolledFollow(next);
		}

		if (onFollowChange !== undefined) {
			onFollowChange(next);
		}
	}

	function commitLevels(next: LogViewerLevel[]) {
		if (!levelsControlled) {
			setUncontrolledLevels(next);
		}

		if (onLevelsChange !== undefined) {
			onLevelsChange(next);
		}
	}

	function commitQueries(next: string[]) {
		if (!queriesControlled) {
			setUncontrolledQueries(next);
		}

		if (onQueriesChange !== undefined) {
			onQueriesChange(next);
		}
	}

	function commitFrom(next: string) {
		if (!fromControlled) {
			setUncontrolledFrom(next);
		}

		if (onFromChange !== undefined) {
			onFromChange(next);
		}
	}

	function commitTo(next: string) {
		if (!toControlled) {
			setUncontrolledTo(next);
		}

		if (onToChange !== undefined) {
			onToChange(next);
		}
	}

	function addQueryChip(raw: string) {
		const trimmed = raw.trim();
		if (trimmed === "") {
			return;
		}

		const lower = trimmed.toLowerCase();
		const exists = currentQueries.some((query) => {
			return query.toLowerCase() === lower;
		});
		if (exists) {
			setDraftQuery("");
			return;
		}

		commitQueries([...currentQueries, trimmed]);
		setDraftQuery("");
	}

	function handleQuerySubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const input = form.querySelector("input");
		if (input === null) {
			return;
		}

		addQueryChip(input.value);
	}

	function handleLevelPressed(id: string, pressed: boolean) {
		if (!isLogViewerLevel(id)) {
			return;
		}

		if (pressed) {
			if (currentLevels.includes(id)) {
				return;
			}

			commitLevels([...currentLevels, id]);
			return;
		}

		const next = currentLevels.filter((level) => {
			return level !== id;
		});
		if (next.length === 0) {
			return;
		}

		commitLevels(next);
	}

	function handleLogScroll() {
		if (pinningRef.current) {
			return;
		}

		const el = logRef.current;
		if (el === null) {
			return;
		}

		const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
		if (distance > 8 && isFollowing) {
			commitFollow(false);
		}
	}

	function toggleExpanded(id: string) {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}

			return next;
		});
	}

	const levelChipItems: ChipGroupItem[] = ALL_LEVELS.map((level) => {
		return {
			id: level,
			label: LEVEL_LABEL[level],
			pressed: currentLevels.includes(level),
		};
	});

	const queryChipItems: ChipGroupItem[] = currentQueries.map((query) => {
		return {
			id: query.toLowerCase(),
			label: query,
			pressed: true,
			dismissible: true,
		};
	});

	let statusParts: string[] = [];
	if (isFollowing) {
		statusParts = ["Following"];
	} else if (pendingCount > 0) {
		statusParts = [`Paused - ${String(pendingCount)} new lines`];
	} else {
		statusParts = ["Paused"];
	}

	statusParts = [...statusParts, `Levels ${currentLevels.join(", ")}`];

	if (currentQueries.length > 0) {
		statusParts = [
			...statusParts,
			`Filters ${currentQueries
				.map((query) => {
					return `"${query}"`;
				})
				.join(", ")}`,
		];
	}

	if (currentFrom !== "" || currentTo !== "") {
		let fromLabel = "open";
		if (currentFrom !== "") {
			fromLabel = currentFrom;
		}

		let toLabel = "open";
		if (currentTo !== "") {
			toLabel = currentTo;
		}

		statusParts = [...statusParts, `Range ${fromLabel} to ${toLabel}`];
	}

	if (maxLines !== undefined && filtered.length > maxLines) {
		statusParts = [
			...statusParts,
			`Showing last ${String(maxLines)} of ${String(filtered.length)}`,
		];
	}

	const statusText = statusParts.join(". ");
	const copyAllValue = visible
		.map((line) => {
			return line.text;
		})
		.join("\n");

	let pendingNode: ReactNode = null;
	if (!isFollowing && pendingCount > 0) {
		pendingNode = (
			<>
				<Badge size="sm" variant="info" data-slot="log-viewer-pending">
					{`${String(pendingCount)} new`}
				</Badge>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={() => {
						commitFollow(true);
					}}
				>
					Show new
				</Button>
			</>
		);
	}

	let queryChipsNode: ReactNode = null;
	if (currentQueries.length > 0) {
		queryChipsNode = (
			<ChipGroup
				aria-label="Text filters"
				items={queryChipItems}
				onPressedChange={() => {
					/* Query chips stay pressed; remove via dismiss. */
				}}
				onDismiss={(id) => {
					commitQueries(
						currentQueries.filter((query) => {
							return query.toLowerCase() !== id;
						}),
					);
				}}
				onClearAll={() => {
					commitQueries([]);
				}}
			/>
		);
	}

	let bodyNode: ReactNode;
	if (visible.length === 0) {
		bodyNode = <EmptyState size="sm" title="No log lines" />;
	} else {
		bodyNode = visible.map((line) => {
			let timestampNode: ReactNode = (
				<span
					data-slot="log-viewer-timestamp"
					className="truncate text-muted-foreground"
				/>
			);
			if (line.timestamp !== undefined) {
				timestampNode = (
					<span
						data-slot="log-viewer-timestamp"
						className="truncate text-muted-foreground"
					>
						{line.timestamp}
					</span>
				);
			} else if (line.at !== undefined) {
				timestampNode = (
					<span
						data-slot="log-viewer-timestamp"
						className="truncate text-muted-foreground"
					>
						{formatAt(line.at)}
					</span>
				);
			}

			let levelNode: ReactNode = (
				<span data-slot="log-viewer-level" className="block w-full" />
			);
			if (line.level !== undefined) {
				levelNode = (
					<Badge
						size="sm"
						variant={badgeVariantForLevel(line.level)}
						data-slot="log-viewer-level"
						className="w-full justify-center"
					>
						{LEVEL_LABEL[line.level]}
					</Badge>
				);
			}

			const hasData = line.data !== undefined;
			const isExpanded = expandedIds.has(line.id);
			const detailId = `${detailIdPrefix}-detail-${line.id}`;

			let toggleNode: ReactNode = (
				<span data-slot="log-viewer-expand" className="block size-7" />
			);
			if (hasData) {
				let chevronClass =
					"size-3.5 shrink-0 transition-transform duration-150";
				if (isExpanded) {
					chevronClass = cn(chevronClass, "rotate-90");
				}

				toggleNode = (
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-7 shrink-0"
						aria-expanded={isExpanded}
						aria-controls={detailId}
						aria-label={`Toggle details for line ${line.id}`}
						data-slot="log-viewer-expand"
						onClick={() => {
							toggleExpanded(line.id);
						}}
					>
						<ChevronRight
							className={chevronClass}
							aria-hidden="true"
						/>
					</Button>
				);
			}

			let detailNode: ReactNode = null;
			if (hasData && isExpanded) {
				detailNode = (
					<div
						id={detailId}
						data-slot="log-viewer-detail"
						className="border-t border-border/40 bg-muted/20 px-2 py-2"
					>
						<CodeBlock
							code={formatLineData(line.data)}
							language="json"
							aria-label={`JSON for line ${line.id}`}
							className="text-xs"
						/>
					</div>
				);
			}

			return (
				<div
					key={line.id}
					data-slot="log-viewer-line"
					className="border-b border-border/60 last:border-b-0"
				>
					<div className="group grid grid-cols-[1.75rem_minmax(0,11rem)_3.5rem_minmax(0,1fr)_1.75rem] items-center gap-x-2 px-2 py-1 sm:grid-cols-[1.75rem_minmax(0,13rem)_3.5rem_minmax(0,1fr)_1.75rem]">
						{toggleNode}
						{timestampNode}
						{levelNode}
						<span
							data-slot="log-viewer-text"
							className="min-w-0 whitespace-pre-wrap break-all"
						>
							{line.text}
						</span>
						<CopyButton
							value={line.text}
							size="icon"
							variant="ghost"
							className="size-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
							aria-label={`Copy line ${line.id}`}
							data-slot="log-viewer-line-copy"
						/>
					</div>
					{detailNode}
				</div>
			);
		});
	}

	let followLabel = "Follow";
	if (isFollowing) {
		followLabel = "Following";
	}

	/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
	const logPanel = (
		<div
			ref={logRef}
			data-slot="log-viewer-log"
			role="log"
			aria-live="off"
			aria-label={ariaLabel}
			tabIndex={0}
			className="h-80 min-h-40 overflow-y-auto overscroll-contain font-mono text-xs"
			onScroll={handleLogScroll}
		>
			{bodyNode}
		</div>
	);
	/* eslint-enable jsx-a11y/no-noninteractive-tabindex */

	return (
		<div
			data-slot="log-viewer"
			className={cn(
				"flex min-h-0 w-full flex-col overflow-hidden rounded-md border border-border bg-background",
				className,
			)}
			{...rest}
		>
			<div
				data-slot="log-viewer-toolbar"
				className="flex shrink-0 flex-col gap-2 border-b border-border p-2"
			>
				<form onSubmit={handleQuerySubmit}>
					<SearchInput
						placeholder="Filter log text"
						value={draftQuery}
						onValueChange={setDraftQuery}
						debounceMs={0}
						className="w-full"
					/>
				</form>
				{queryChipsNode}
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div className="flex min-w-0 flex-col gap-1">
						<Label htmlFor={fromId}>From</Label>
						<DateTimePicker
							id={fromId}
							granularity="datetime"
							value={currentFrom}
							onValueChange={commitFrom}
							className="w-full"
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-1">
						<Label htmlFor={toId}>To</Label>
						<DateTimePicker
							id={toId}
							granularity="datetime"
							value={currentTo}
							onValueChange={commitTo}
							className="w-full"
						/>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<ChipGroup
						aria-label="Log levels"
						items={levelChipItems}
						onPressedChange={handleLevelPressed}
						className="min-w-0"
					/>
					<div className="ml-auto flex flex-wrap items-center gap-2">
						<Button
							type="button"
							size="sm"
							variant="secondary"
							aria-pressed={isFollowing}
							onClick={() => {
								commitFollow(!isFollowing);
							}}
						>
							{followLabel}
						</Button>
						{pendingNode}
						<CopyButton
							value={copyAllValue}
							size="sm"
							variant="ghost"
							aria-label="Copy visible lines"
							disabled={visible.length === 0}
						/>
					</div>
				</div>
			</div>
			<div
				data-slot="log-viewer-status"
				role="status"
				aria-live="polite"
				className="sr-only"
			>
				{statusText}
			</div>
			{logPanel}
		</div>
	);
}

export type { LogViewerLevel, LogViewerLine, LogViewerProps };
export { LogViewer };
