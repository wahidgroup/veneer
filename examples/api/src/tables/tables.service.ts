import { Injectable, NotFoundException } from "@nestjs/common";

export interface TableRow {
	id: string;
	name: string;
	status: string;
}

interface TableStore {
	seed: TableRow[];
	rows: TableRow[];
}

@Injectable()
export class TablesService {
	private readonly tables = new Map<string, TableStore>();

	constructor() {
		const inventorySeed: TableRow[] = [
			{ id: "row-1", name: "edge-a", status: "ready" },
			{ id: "row-2", name: "edge-b", status: "degraded" },
			{ id: "row-3", name: "core-1", status: "ready" },
		];
		this.tables.set("inventory", {
			seed: inventorySeed,
			rows: inventorySeed.map((row) => {
				return { ...row };
			}),
		});
	}

	list(
		id: string,
		page: number,
		limit: number,
		search?: string,
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
		let rows = store.rows;
		if (search !== undefined && search.trim() !== "") {
			const needle = search.trim().toLowerCase();
			rows = rows.filter((row) => {
				return (
					row.name.toLowerCase().includes(needle) ||
					row.status.toLowerCase().includes(needle)
				);
			});
		}

		const total = rows.length;
		const totalPages = Math.max(1, Math.ceil(total / limit));
		const start = (page - 1) * limit;
		const items = rows.slice(start, start + limit);

		return {
			items,
			pagination: { page, limit, total, totalPages },
		};
	}

	addRows(id: string, rows: TableRow[]): { count: number } {
		const store = this.requireStore(id);
		store.rows = [...store.rows, ...rows];
		return { count: store.rows.length };
	}

	reset(id: string): { count: number } {
		const store = this.requireStore(id);
		store.rows = store.seed.map((row) => {
			return { ...row };
		});
		return { count: store.rows.length };
	}

	private requireStore(id: string): TableStore {
		const store = this.tables.get(id);
		if (store === undefined) {
			throw new NotFoundException(`table ${id} not found`);
		}

		return store;
	}
}
