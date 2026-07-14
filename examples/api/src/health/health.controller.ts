import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiProperty, ApiTags } from "@nestjs/swagger";

class HealthStatusDto {
	@ApiProperty({ enum: ["ok"] })
	status!: string;
}

@ApiTags("health")
@Controller("health")
export class HealthController {
	@Get()
	@ApiOkResponse({ type: HealthStatusDto })
	getHealth(): HealthStatusDto {
		return { status: "ok" };
	}
}
