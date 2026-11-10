import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

import { MetricsService } from "./metrics.service.js";

class ProgressJobDto {
	@ApiProperty({ type: Number })
	value!: number;

	@ApiProperty({ type: Number })
	max!: number;

	@ApiProperty({ type: Boolean })
	streaming!: boolean;

	@ApiProperty({ type: String })
	label!: string;
}

class QuotaDto {
	@ApiProperty({ type: Number })
	used!: number;

	@ApiProperty({ type: Number })
	max!: number;

	@ApiProperty({ type: String })
	label!: string;
}

class QuotaAmountDto {
	@ApiProperty({ type: Number })
	@IsNumber()
	@Min(1)
	amount!: number;
}

@ApiTags("metrics")
@Controller("v1/metrics")
export class MetricsController {
	constructor(@Inject(MetricsService) private readonly metrics: MetricsService) {}

	@Get("progress")
	@ApiOkResponse({ type: ProgressJobDto })
	getProgress(): ProgressJobDto {
		return this.metrics.getProgress();
	}

	@Post("progress/start")
	@ApiOkResponse({ type: ProgressJobDto })
	startProgress(): ProgressJobDto {
		return this.metrics.startProgress();
	}

	@Post("progress/stop")
	@ApiOkResponse({ type: ProgressJobDto })
	stopProgress(): ProgressJobDto {
		return this.metrics.stopProgress();
	}

	@Post("progress/reset")
	@ApiOkResponse({ type: ProgressJobDto })
	resetProgress(): ProgressJobDto {
		return this.metrics.resetProgress();
	}

	@Get("quota")
	@ApiOkResponse({ type: QuotaDto })
	getQuota(): QuotaDto {
		return this.metrics.getQuota();
	}

	@Post("quota/consume")
	@ApiBody({ type: QuotaAmountDto })
	@ApiOkResponse({ type: QuotaDto })
	consumeQuota(@Body() body: QuotaAmountDto): QuotaDto {
		return this.metrics.consumeQuota(body.amount);
	}

	@Post("quota/release")
	@ApiBody({ type: QuotaAmountDto })
	@ApiOkResponse({ type: QuotaDto })
	releaseQuota(@Body() body: QuotaAmountDto): QuotaDto {
		return this.metrics.releaseQuota(body.amount);
	}

	@Post("quota/reset")
	@ApiOkResponse({ type: QuotaDto })
	resetQuota(): QuotaDto {
		return this.metrics.resetQuota();
	}
}
