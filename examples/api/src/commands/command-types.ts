interface CommandItem {
	id: string;
	label: string;
	group?: string;
	keywords?: string[];
	disabled?: boolean;
}

export type { CommandItem };
