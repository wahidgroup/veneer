import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import type { InstanceOption } from "./option-types.js";

const SEED_OPTIONS: InstanceOption[] = [
	{ value: "t3.micro", label: "t3.micro - 2 vCPU, 1 GiB" },
	{ value: "t3.small", label: "t3.small - 2 vCPU, 2 GiB" },
	{ value: "t3.medium", label: "t3.medium - 2 vCPU, 4 GiB" },
	{ value: "m5.large", label: "m5.large - 2 vCPU, 8 GiB" },
	{ value: "m5.metal", label: "m5.metal - 96 vCPU, 384 GiB" },
	{ value: "c6i.large", label: "c6i.large - 2 vCPU, 4 GiB" },
	{ value: "c6i.metal", label: "c6i.metal - 64 vCPU, 128 GiB" },
	{ value: "r6i.large", label: "r6i.large - 2 vCPU, 16 GiB" },
];

@Injectable()
export class OptionsService {
	private options: InstanceOption[] = cloneSeed();

	list(q?: string): { items: InstanceOption[] } {
		let items = this.options;
		if (q !== undefined && q.trim().length > 0) {
			const normalized = q.trim().toLowerCase();
			items = this.options.filter((option) => {
				return (
					option.value.toLowerCase().includes(normalized) || option.label.toLowerCase().includes(normalized)
				);
			});
		}

		return { items: items.map(cloneOption) };
	}

	add(option: InstanceOption): InstanceOption {
		for (const existing of this.options) {
			if (existing.value === option.value) {
				throw new ConflictException(`option ${option.value} exists`);
			}
		}

		const created = cloneOption(option);
		this.options = [...this.options, created];
		return cloneOption(created);
	}

	remove(value: string): { count: number } {
		const next: InstanceOption[] = [];
		let removed = false;
		for (const option of this.options) {
			if (option.value === value) {
				removed = true;
				continue;
			}

			next.push(option);
		}

		if (!removed) {
			throw new NotFoundException(`option ${value} not found`);
		}

		this.options = next;
		return { count: this.options.length };
	}

	reset(): { count: number } {
		this.options = cloneSeed();
		return { count: this.options.length };
	}
}

function cloneOption(option: InstanceOption): InstanceOption {
	return { value: option.value, label: option.label };
}

function cloneSeed(): InstanceOption[] {
	return SEED_OPTIONS.map(cloneOption);
}
