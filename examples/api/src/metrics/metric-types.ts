interface ProgressJobState {
	value: number;
	max: number;
	streaming: boolean;
	label: string;
}

interface QuotaState {
	used: number;
	max: number;
	label: string;
}

export type { ProgressJobState, QuotaState };
