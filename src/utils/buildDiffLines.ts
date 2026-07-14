import { structuredPatch } from "diff";

import type { DiffLine } from "../components/data/diffTypes.js";

interface BuildDiffLinesOptions {
	context?: number;
}

/**
 * Turn old/new text into DiffLine rows via jsdiff structuredPatch.
 */
function buildDiffLines(
	oldText: string,
	newText: string,
	options?: BuildDiffLinesOptions,
): DiffLine[] {
	let context = options?.context;
	context ??= 3;

	const patch = structuredPatch(
		"old",
		"new",
		oldText,
		newText,
		undefined,
		undefined,
		{ context },
	);

	const lines: DiffLine[] = [];
	for (const hunk of patch.hunks) {
		lines.push({
			kind: "hunk",
			text: `@@ -${String(hunk.oldStart)},${String(hunk.oldLines)} +${String(hunk.newStart)},${String(hunk.newLines)} @@`,
		});

		let oldLine = hunk.oldStart;
		let newLine = hunk.newStart;
		for (const raw of hunk.lines) {
			if (raw.startsWith("\\")) {
				continue;
			}

			const marker = raw.charAt(0);
			const text = raw.slice(1);

			if (marker === " ") {
				lines.push({
					kind: "context",
					text,
					oldLineNumber: oldLine,
					newLineNumber: newLine,
				});

				oldLine += 1;
				newLine += 1;
				continue;
			}

			if (marker === "-") {
				lines.push({
					kind: "removed",
					text,
					oldLineNumber: oldLine,
				});

				oldLine += 1;
				continue;
			}

			if (marker === "+") {
				lines.push({
					kind: "added",
					text,
					newLineNumber: newLine,
				});

				newLine += 1;
			}
		}
	}

	return lines;
}

export type { BuildDiffLinesOptions };
export { buildDiffLines };
