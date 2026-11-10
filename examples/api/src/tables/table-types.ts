export type TableRowStatus = "healthy" | "degraded" | "down";

export interface TableRow {
	id: string;
	name: string;
	region: string;
	status: TableRowStatus;
	cpu: number;
}

export interface TableRowTransaction {
	add?: TableRow[];
	update?: TableRow[];
	remove?: string[];
}

export interface TableListQuery {
	page: number;
	limit: number;
	queries?: string[];
	search?: string;
	sortBy?: string;
	sortDesc?: boolean;
	filterName?: string;
	filterRegion?: string;
	filterStatus?: string;
}

export interface TablePatchEvent {
	type: "patch";
	tableId: string;
	transaction: TableRowTransaction;
}

export interface TableSnapshotEvent {
	type: "snapshot";
	tableId: string;
	rows: TableRow[];
}

export type TableEvent = TablePatchEvent | TableSnapshotEvent;

export type TableEventListener = (event: TableEvent) => void;

export interface TableServerSnapshotMessage {
	type: "snapshot";
	rows: TableRow[];
}

export interface TableServerPatchMessage {
	type: "patch";
	transaction: TableRowTransaction;
}

export type TableServerMessage = TableServerSnapshotMessage | TableServerPatchMessage;

export interface TableSubscribeMessage {
	type: "subscribe";
	tableId?: string;
}

function buildInventorySeed(count: number): TableRow[] {
	const regions = ["us-east-1", "eu-west-1", "ap-southeast-1"] as const;
	const statuses: TableRowStatus[] = ["healthy", "degraded", "down"];
	const rows: TableRow[] = [];
	for (let index = 0; index < count; index += 1) {
		const id = String(index + 1);
		const region = regions[index % regions.length] ?? "us-east-1";
		const status = statuses[index % statuses.length] ?? "healthy";
		rows.push({
			id,
			name: `node-${id.padStart(3, "0")}`,
			region,
			status,
			cpu: (index * 7) % 100,
		});
	}

	return rows;
}

function rowHaystack(row: TableRow): string {
	return `${row.name}\n${row.region}\n${row.status}\n${String(row.cpu)}`.toLowerCase();
}

function matchQueries(row: TableRow, queries: string[]): boolean {
	const needles = queries
		.map((query) => {
			return query.trim().toLowerCase();
		})
		.filter((query) => {
			return query.length > 0;
		});

	if (needles.length === 0) {
		return true;
	}

	const haystack = rowHaystack(row);
	for (const needle of needles) {
		if (haystack.includes(needle)) {
			return true;
		}
	}

	return false;
}

function applyRowTransaction(rows: TableRow[], transaction: TableRowTransaction): TableRow[] {
	const removeIds = new Set<string>();
	if (transaction.remove !== undefined) {
		for (const id of transaction.remove) {
			removeIds.add(id);
		}
	}

	const updates = new Map<string, TableRow>();
	if (transaction.update !== undefined) {
		for (const row of transaction.update) {
			updates.set(row.id, row);
		}
	}

	const next: TableRow[] = [];
	for (const row of rows) {
		if (removeIds.has(row.id)) {
			continue;
		}

		const updated = updates.get(row.id);
		if (updated !== undefined) {
			next.push({ ...updated });
			continue;
		}

		next.push(row);
	}

	if (transaction.add !== undefined) {
		const existing = new Set(
			next.map((row) => {
				return row.id;
			}),
		);
		for (const row of transaction.add) {
			if (existing.has(row.id)) {
				continue;
			}

			next.push({ ...row });
			existing.add(row.id);
		}
	}

	return next;
}

export { applyRowTransaction, buildInventorySeed, matchQueries, rowHaystack };
