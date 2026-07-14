import type { ReactNode } from "react";

type DiffLineKind = "context" | "added" | "removed" | "hunk";

interface DiffLine {
	kind: DiffLineKind;
	text: string;
	oldLineNumber?: number;
	newLineNumber?: number;
}

type DiffChangeKind = "create" | "update" | "destroy" | "replace";

interface DiffAttribute {
	path: string;
	before?: ReactNode;
	after?: ReactNode;
	sensitive?: boolean;
	forcesReplace?: boolean;
}

interface DiffResource {
	id: string;
	kind: DiffChangeKind;
	path: string;
	summary?: ReactNode;
	attributes?: DiffAttribute[];
}

type DiffViewMode = "lines" | "tree";
type DiffLayout = "unified" | "split";

export type {
	DiffAttribute,
	DiffChangeKind,
	DiffLayout,
	DiffLine,
	DiffLineKind,
	DiffResource,
	DiffViewMode,
};
