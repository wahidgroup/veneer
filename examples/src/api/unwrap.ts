export interface ApiEnvelope<T> {
	data: T;
	meta?: {
		timestamp?: string;
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	};
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object";
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
	if (!isRecord(value)) {
		return false;
	}

	return "data" in value;
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.page === "number" &&
		typeof value.limit === "number" &&
		typeof value.total === "number" &&
		typeof value.totalPages === "number"
	);
}

function unwrap(body: unknown): unknown {
	if (!isEnvelope(body)) {
		throw new Error("expected API envelope");
	}

	const data = body.data;
	return data;
}

function unwrapPaginated(body: unknown): {
	items: unknown[];
	pagination: PaginationMeta;
} {
	if (!isEnvelope(body)) {
		throw new Error("expected API envelope");
	}

	const data = body.data;
	if (!Array.isArray(data)) {
		throw new Error("expected paginated data array");
	}

	const pagination = body.meta?.pagination;
	if (!isPaginationMeta(pagination)) {
		throw new Error("expected pagination meta");
	}

	const result = {
		items: data,
		pagination,
	};
	return result;
}

export { isEnvelope, isPaginationMeta, unwrap, unwrapPaginated };
