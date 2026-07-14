import {
	BadRequestException,
	Injectable,
	OnModuleDestroy,
} from "@nestjs/common";

import type { ProgressJobState, QuotaState } from "./metric-types.js";

const PROGRESS_MAX = 100;
const QUOTA_MAX = 100;
const TICK_MS = 400;
const TICK_STEP = 5;

@Injectable()
export class MetricsService implements OnModuleDestroy {
	private progressValue = 0;
	private progressStreaming = false;
	private progressTimer: ReturnType<typeof setInterval> | undefined;
	private quotaUsed = 42;

	onModuleDestroy(): void {
		this.clearProgressTimer();
	}

	getProgress(): ProgressJobState {
		return {
			value: this.progressValue,
			max: PROGRESS_MAX,
			streaming: this.progressStreaming,
			label: "Deploy job",
		};
	}

	startProgress(): ProgressJobState {
		if (this.progressStreaming) {
			return this.getProgress();
		}

		this.progressStreaming = true;
		if (this.progressValue >= PROGRESS_MAX) {
			this.progressValue = 0;
		}

		this.progressTimer = setInterval(() => {
			this.progressValue += TICK_STEP;
			if (this.progressValue >= PROGRESS_MAX) {
				this.progressValue = PROGRESS_MAX;
				this.progressStreaming = false;
				this.clearProgressTimer();
			}
		}, TICK_MS);

		return this.getProgress();
	}

	stopProgress(): ProgressJobState {
		this.progressStreaming = false;
		this.clearProgressTimer();
		return this.getProgress();
	}

	resetProgress(): ProgressJobState {
		this.stopProgress();
		this.progressValue = 0;
		return this.getProgress();
	}

	getQuota(): QuotaState {
		return {
			used: this.quotaUsed,
			max: QUOTA_MAX,
			label: "Stacks",
		};
	}

	consumeQuota(amount: number): QuotaState {
		if (!Number.isFinite(amount) || amount <= 0) {
			throw new BadRequestException("amount must be a positive number");
		}

		this.quotaUsed += amount;
		if (this.quotaUsed > QUOTA_MAX) {
			this.quotaUsed = QUOTA_MAX;
		}

		return this.getQuota();
	}

	releaseQuota(amount: number): QuotaState {
		if (!Number.isFinite(amount) || amount <= 0) {
			throw new BadRequestException("amount must be a positive number");
		}

		this.quotaUsed -= amount;
		if (this.quotaUsed < 0) {
			this.quotaUsed = 0;
		}

		return this.getQuota();
	}

	resetQuota(): QuotaState {
		this.quotaUsed = 42;
		return this.getQuota();
	}

	private clearProgressTimer(): void {
		if (this.progressTimer !== undefined) {
			clearInterval(this.progressTimer);
			this.progressTimer = undefined;
		}
	}
}
