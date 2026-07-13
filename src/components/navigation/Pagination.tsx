import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface PaginationProps extends Omit<ComponentProps<"div">, "children"> {
	pageIndex: number;
	pageCount: number;
	onPageChange: (pageIndex: number) => void;
	itemCount?: number;
	pageSize?: number;
	disabled?: boolean;
}

/**
 * Build the "a–b of c" / "0 rows" status string for the current page.
 */
function formatPaginationRange(
	pageIndex: number,
	pageSize: number,
	itemCount: number,
): string {
	if (itemCount <= 0) {
		return "0 rows";
	}

	const fromRow = pageIndex * pageSize + 1;
	let toRow = (pageIndex + 1) * pageSize;
	if (toRow > itemCount) {
		toRow = itemCount;
	}

	return `${String(fromRow)}–${String(toRow)} of ${String(itemCount)}`;
}

/**
 * Controlled Prev/Next paging chrome with optional item-range status.
 * Parent owns `pageIndex` (0-based). Pass unique `aria-label` when multiple
 * pagers share a page.
 */
function Pagination({
	pageIndex,
	pageCount,
	onPageChange,
	itemCount,
	pageSize,
	disabled,
	className,
	"aria-label": ariaLabel,
	...rest
}: PaginationProps) {
	let navLabel = ariaLabel;
	navLabel ??= "Pagination";

	let forceDisabled = disabled;
	forceDisabled ??= false;

	let previousDisabled = pageIndex <= 0;
	if (forceDisabled) {
		previousDisabled = true;
	}

	let nextDisabled = pageIndex >= pageCount - 1;
	if (forceDisabled) {
		nextDisabled = true;
	}

	let rangeLabel: string | null = null;
	if (itemCount !== undefined && pageSize !== undefined) {
		rangeLabel = formatPaginationRange(pageIndex, pageSize, itemCount);
	}

	const rootClasses = ["flex flex-wrap items-center gap-3"];
	if (rangeLabel !== null) {
		rootClasses.push("justify-between");
	}

	let rangeNode = null;
	if (rangeLabel !== null) {
		rangeNode = (
			<p
				data-slot="pagination-range"
				className="text-sm text-muted-foreground"
			>
				{rangeLabel}
			</p>
		);
	}

	return (
		<div
			data-slot="pagination"
			className={cn(...rootClasses, className)}
			{...rest}
		>
			{rangeNode}
			<nav aria-label={navLabel} className="flex items-center gap-2">
				<Button
					type="button"
					variant="outlined"
					size="sm"
					disabled={previousDisabled}
					aria-label="Previous page"
					onClick={() => {
						onPageChange(pageIndex - 1);
					}}
				>
					Previous
				</Button>
				<span className="text-sm text-muted-foreground">
					Page {String(pageIndex + 1)} of {String(pageCount)}
				</span>
				<Button
					type="button"
					variant="outlined"
					size="sm"
					disabled={nextDisabled}
					aria-label="Next page"
					onClick={() => {
						onPageChange(pageIndex + 1);
					}}
				>
					Next
				</Button>
			</nav>
		</div>
	);
}

export type { PaginationProps };
export { Pagination };
