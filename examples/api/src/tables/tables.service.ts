import { Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";

import type { TableEvent, TableEventListener, TableListQuery, TableRow, TableRowTransaction } from "./table-types.js";
import { applyRowTransaction, buildInventorySeed, matchQueries } from "./table-types.js";

const SEED_COUNT = 87;
const STREAM_INTERVAL_MS = 1500;

interface TableStore {
	seed: TableRow[];
	rows: TableRow[];
	streaming: boolean;
	timer: ReturnType<typeof setInterval> | null;
	patchIndex: number;
}

@Injectable()
export class TablesService implements OnModuleDestroy {
	private readonly tables = new Map<string, TableStore>();
	private readonly listeners = new Set<TableEventListener>();

	constructor() {
		const inventorySeed = buildInventorySeed(SEED_COUNT);
		this.tables.set("inventory", {
			seed: inventorySeed,
			rows: inventorySeed.map((row) => {
				return { ...row };
			}),
			streaming: false,
			timer: null,
			patchIndex: 0,
		});
	}

	onModuleDestroy(): void {
		for (const id of this.tables.keys()) {
			this.stopStream(id);
		}
	}

	subscribe(listener: TableEventListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	getSnapshot(id: string): TableRow[] {
		const store = this.requireStore(id);
		return store.rows.map((row) => {
			return { ...row };
		});
	}

	isStreaming(id: string): boolean {
		return this.requireStore(id).streaming;
	}

	list(
		id: string,
		query: TableListQuery,
	): {
		items: TableRow[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	} {
		const store = this.requireStore(id);
		let rows = [...store.rows];

		const queries: string[] = [];
		if (query.queries !== undefined) {
			for (const item of query.queries) {
				queries.push(item);
			}
		}
		if (query.search !== undefined && query.search.trim() !== "") {
			queries.push(query.search);
		}

		if (queries.length > 0) {
			rows = rows.filter((row) => {
				return matchQueries(row, queries);
			});
		}

		if (query.filterName !== undefined && query.filterName.length > 0) {
			const needle = query.filterName.toLowerCase();
			rows = rows.filter((row) => {
				return row.name.toLowerCase().includes(needle);
			});
		}
		if (query.filterRegion !== undefined && query.filterRegion.length > 0) {
			const needle = query.filterRegion.toLowerCase();
			rows = rows.filter((row) => {
				return row.region.toLowerCase() === needle;
			});
		}
		if (query.filterStatus !== undefined && query.filterStatus.length > 0) {
			const needle = query.filterStatus.toLowerCase();
			rows = rows.filter((row) => {
				return row.status.toLowerCase() === needle;
			});
		}
		if (query.sortBy !== undefined && query.sortBy.length > 0) {
			const sortBy = query.sortBy;
			let sortDesc = false;
			if (query.sortDesc === true) {
				sortDesc = true;
			}

			rows.sort((left, right) => {
				let cmp = 0;
				if (sortBy === "name") {
					cmp = left.name.localeCompare(right.name);
				} else if (sortBy === "region") {
					cmp = left.region.localeCompare(right.region);
				} else if (sortBy === "status") {
					cmp = left.status.localeCompare(right.status);
				} else if (sortBy === "cpu") {
					cmp = left.cpu - right.cpu;
				}

				if (sortDesc) {
					cmp = -cmp;
				}

				return cmp;
			});
		}

		const total = rows.length;
		const totalPages = Math.max(1, Math.ceil(total / query.limit));
		const start = (query.page - 1) * query.limit;
		const items = rows.slice(start, start + query.limit);

		return {
			items,
			pagination: {
				page: query.page,
				limit: query.limit,
				total,
				totalPages,
			},
		};
	}

	applyTransaction(id: string, transaction: TableRowTransaction): { count: number } {
		const store = this.requireStore(id);
		store.rows = applyRowTransaction(store.rows, transaction);
		this.emit({
			type: "patch",
			tableId: id,
			transaction,
		});

		return { count: store.rows.length };
	}

	addRows(id: string, rows: TableRow[]): { count: number } {
		return this.applyTransaction(id, { add: rows });
	}

	removeRows(id: string, ids: string[]): { count: number } {
		return this.applyTransaction(id, { remove: ids });
	}

	startStream(id: string): { streaming: boolean } {
		const store = this.requireStore(id);
		if (store.streaming) {
			return { streaming: true };
		}

		store.streaming = true;
		store.timer = setInterval(() => {
			this.patchNext(id);
		}, STREAM_INTERVAL_MS);

		return { streaming: true };
	}

	stopStream(id: string): { streaming: boolean } {
		const store = this.tables.get(id);
		if (store === undefined) {
			return { streaming: false };
		}

		store.streaming = false;

		if (store.timer !== null) {
			clearInterval(store.timer);
			store.timer = null;
		}

		return { streaming: false };
	}

	reset(id: string): { streaming: boolean; count: number } {
		this.stopStream(id);

		const store = this.requireStore(id);
		store.patchIndex = 0;
		store.rows = store.seed.map((row) => {
			return { ...row };
		});

		this.emit({
			type: "snapshot",
			tableId: id,
			rows: this.getSnapshot(id),
		});

		return { streaming: false, count: store.rows.length };
	}

	private patchNext(id: string): void {
		const store = this.tables.get(id);
		if (store === undefined || store.rows.length === 0) {
			return;
		}

		const index = store.patchIndex % store.rows.length;
		store.patchIndex += 1;

		const target = store.rows[index];
		if (target === undefined) {
			return;
		}

		this.applyTransaction(id, {
			update: [
				{
					...target,
					cpu: (target.cpu + 11) % 100,
				},
			],
		});
	}

	private emit(event: TableEvent): void {
		for (const listener of this.listeners) {
			listener(event);
		}
	}

	private requireStore(id: string): TableStore {
		const store = this.tables.get(id);
		if (store === undefined) {
			throw new NotFoundException(`table ${id} not found`);
		}

		return store;
	}
}

export { SEED_COUNT, STREAM_INTERVAL_MS };
