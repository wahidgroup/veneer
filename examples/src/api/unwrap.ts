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

function toPositiveInt(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return undefined;
}

function readPaginationMeta(value: unknown): PaginationMeta | undefined {
	if (!isRecord(value)) {
		return undefined;
	}

	const page = toPositiveInt(value.page);
	const limit = toPositiveInt(value.limit);
	const total = toPositiveInt(value.total);
	const totalPages = toPositiveInt(value.totalPages);
	if (
		page === undefined ||
		limit === undefined ||
		total === undefined ||
		totalPages === undefined
	) {
		return undefined;
	}

	return { page, limit, total, totalPages };
}

function isPaginationMeta(value: unknown): value is PaginationMeta {
	return readPaginationMeta(value) !== undefined;
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

	const pagination = readPaginationMeta(body.meta?.pagination);
	if (pagination === undefined) {
		throw new Error("expected pagination meta");
	}

	const result = {
		items: data,
		pagination,
	};
	return result;
}

export {
	isEnvelope,
	isPaginationMeta,
	readPaginationMeta,
	unwrap,
	unwrapPaginated,
};
