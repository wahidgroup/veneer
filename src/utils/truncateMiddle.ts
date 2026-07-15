interface TruncateMiddleOptions {
	start?: number;
	end?: number;
}

/**
 * Middle-ellipsis truncation so leading and trailing characters stay visible.
 */
function truncateMiddle(
	value: string,
	options?: TruncateMiddleOptions,
): string {
	let start = 6;
	if (options?.start !== undefined) {
		start = options.start;
	}

	let end = 6;
	if (options?.end !== undefined) {
		end = options.end;
	}

	if (start < 0 || end < 0) {
		throw new Error("truncateMiddle start and end must be non-negative");
	}

	if (value.length <= start + end) {
		return value;
	}

	return `${value.slice(0, start)}…${value.slice(value.length - end)}`;
}

export type { TruncateMiddleOptions };
export { truncateMiddle };
