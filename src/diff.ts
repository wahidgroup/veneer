/**
 * @packageDocumentation
 * `@wahidgroup/veneer/diff`: DiffView, PlanSummary, and buildDiffLines.
 *
 * Peer: `diff` (optional for the root package; required here).
 */

export { DiffView } from "./components/data/DiffView.js";
export type {
	DiffAttribute,
	DiffChangeKind,
	DiffLayout,
	DiffLine,
	DiffLineKind,
	DiffResource,
	DiffViewMode,
	DiffViewProps,
} from "./components/data/DiffView.js";
export { PlanSummary } from "./components/data/PlanSummary.js";
export type { PlanSummaryProps } from "./components/data/PlanSummary.js";
export { buildDiffLines } from "./utils/buildDiffLines.js";
export type { BuildDiffLinesOptions } from "./utils/buildDiffLines.js";
