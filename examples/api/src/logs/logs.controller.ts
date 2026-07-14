import { Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";

import { LogsService } from "./logs.service.js";

class StreamStateDto {
	@ApiProperty({ type: Boolean })
	streaming!: boolean;
}

class ResetStateDto {
	@ApiProperty({ type: Boolean })
	streaming!: boolean;

	@ApiProperty({ type: Number })
	count!: number;
}

@ApiTags("logs")
@Controller("v1/logs/stream")
export class LogsController {
	constructor(@Inject(LogsService) private readonly logs: LogsService) {}

	@Get()
	@ApiOkResponse({ type: StreamStateDto })
	status(): StreamStateDto {
		const result = { streaming: this.logs.isStreaming() };
		return result;
	}

	@Post("start")
	@ApiOkResponse({ type: StreamStateDto })
	start(): StreamStateDto {
		return this.logs.startStream();
	}

	@Post("stop")
	@ApiOkResponse({ type: StreamStateDto })
	stop(): StreamStateDto {
		return this.logs.stopStream();
	}

	@Post("reset")
	@ApiOkResponse({ type: ResetStateDto })
	reset(): ResetStateDto {
		return this.logs.reset();
	}
}
