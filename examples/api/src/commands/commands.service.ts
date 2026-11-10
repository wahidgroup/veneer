import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import type { CommandItem } from "./command-types.js";

const SEED_COMMANDS: CommandItem[] = [
	{
		id: "stacks",
		label: "Go to stacks",
		group: "Navigate",
		keywords: ["inventory"],
	},
	{ id: "deploy", label: "Deploy stack", group: "Actions" },
	{ id: "logs", label: "Open deploy logs", group: "Navigate" },
	{
		id: "settings",
		label: "Open settings",
		group: "Navigate",
		disabled: true,
	},
	{
		id: "quota",
		label: "View quota",
		group: "Navigate",
		keywords: ["meter"],
	},
	{ id: "apply", label: "Apply plan", group: "Actions" },
];

@Injectable()
export class CommandsService {
	private items: CommandItem[] = cloneSeed();

	list(q?: string): { items: CommandItem[] } {
		let items = this.items;
		if (q !== undefined && q.trim().length > 0) {
			const normalized = q.trim().toLowerCase();
			items = this.items.filter((item) => {
				if (item.id.toLowerCase().includes(normalized)) {
					return true;
				}
				if (item.label.toLowerCase().includes(normalized)) {
					return true;
				}
				if (item.group?.toLowerCase().includes(normalized) === true) {
					return true;
				}
				if (item.keywords === undefined) {
					return false;
				}

				for (const keyword of item.keywords) {
					if (keyword.toLowerCase().includes(normalized)) {
						return true;
					}
				}

				return false;
			});
		}

		return { items: items.map(cloneItem) };
	}

	add(item: CommandItem): CommandItem {
		for (const existing of this.items) {
			if (existing.id === item.id) {
				throw new ConflictException(`command ${item.id} exists`);
			}
		}

		const created = cloneItem(item);
		this.items = [...this.items, created];
		return cloneItem(created);
	}

	remove(id: string): { count: number } {
		const next: CommandItem[] = [];
		let removed = false;
		for (const item of this.items) {
			if (item.id === id) {
				removed = true;
				continue;
			}

			next.push(item);
		}

		if (!removed) {
			throw new NotFoundException(`command ${id} not found`);
		}

		this.items = next;
		return { count: this.items.length };
	}

	reset(): { count: number } {
		this.items = cloneSeed();
		return { count: this.items.length };
	}
}

function cloneItem(item: CommandItem): CommandItem {
	let keywords: string[] | undefined;
	if (item.keywords !== undefined) {
		keywords = [...item.keywords];
	}

	return {
		id: item.id,
		label: item.label,
		group: item.group,
		keywords,
		disabled: item.disabled,
	};
}

function cloneSeed(): CommandItem[] {
	return SEED_COMMANDS.map(cloneItem);
}
