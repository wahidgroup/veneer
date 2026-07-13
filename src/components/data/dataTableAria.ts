/**
 * APG ARIA row count: data rows plus header rows; empty tables keep one body slot.
 */
function computeAriaRowCount(
	resolvedRowCount: number,
	headerRowCount: number,
): number {
	let ariaRowCount = resolvedRowCount + headerRowCount;
	if (resolvedRowCount === 0) {
		ariaRowCount = headerRowCount + 1;
	}

	return ariaRowCount;
}

/**
 * Absolute ARIA row index for a body row on the current page.
 */
function computeBodyAriaRowIndex(
	headerRowCount: number,
	pageIndex: number,
	pageSize: number,
	index: number,
): number {
	const ariaRowIndex = headerRowCount + pageIndex * pageSize + index + 1;
	return ariaRowIndex;
}

/**
 * Whether to announce ARIA column indices (only when some leaf columns are hidden).
 */
function shouldAnnounceColIndices(
	visibleLeafCount: number,
	allLeafCount: number,
): boolean {
	const announce = visibleLeafCount < allLeafCount;
	return announce;
}

/**
 * 1-based ARIA column index for a leaf column id, or undefined when not announcing.
 */
function leafAriaColIndex(
	allLeafColumns: { id: string }[],
	columnId: string,
	announceColIndices: boolean,
): number | undefined {
	if (!announceColIndices) {
		return undefined;
	}

	for (let index = 0; index < allLeafColumns.length; index += 1) {
		const column = allLeafColumns[index];
		if (column?.id === columnId) {
			const colIndex = index + 1;
			return colIndex;
		}
	}

	return undefined;
}

export {
	computeAriaRowCount,
	computeBodyAriaRowIndex,
	leafAriaColIndex,
	shouldAnnounceColIndices,
};
