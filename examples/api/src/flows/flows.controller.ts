import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOkResponse,
	ApiParam,
	ApiProperty,
	ApiTags,
} from "@nestjs/swagger";
import { IsInt, IsObject, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

import { FlowsService } from "./flows.service.js";

class FlowFieldDefDto {
	@ApiProperty({ type: String })
	id!: string;

	@ApiProperty({ type: String })
	label!: string;

	@ApiProperty({ enum: ["number", "string"] })
	kind!: "number" | "string";

	@ApiProperty({ enum: ["in", "out"] })
	direction!: "in" | "out";
}

class FlowDemoNodeDto {
	@ApiProperty({ type: String })
	id!: string;

	@ApiProperty({ type: String })
	label!: string;

	@ApiProperty({ type: () => [FlowFieldDefDto] })
	fields!: FlowFieldDefDto[];

	@ApiProperty({ type: "object", additionalProperties: true })
	config!: Record<string, number | string>;
}

class FlowDemoEdgeDto {
	@ApiProperty({ type: String })
	id!: string;

	@ApiProperty({ type: String })
	source!: string;

	@ApiProperty({ type: String })
	target!: string;

	@ApiProperty({ type: String })
	sourcePort!: string;

	@ApiProperty({ type: String })
	targetPort!: string;

	@ApiProperty({ enum: ["number", "string"] })
	valueKind!: "number" | "string";
}

class FlowDemoRunDto {
	@ApiProperty({ nullable: true, type: String })
	runId!: string | null;

	@ApiProperty({ type: "object", additionalProperties: { type: String } })
	nodeStates!: Record<string, string>;

	@ApiProperty({ type: "object", additionalProperties: true })
	outputsByNode!: Record<string, Record<string, string | number>>;

	@ApiProperty({ type: String })
	message!: string;
}

class FlowDemoSnapshotDto {
	@ApiProperty({ type: () => [FlowDemoNodeDto] })
	nodes!: FlowDemoNodeDto[];

	@ApiProperty({ type: () => [FlowDemoEdgeDto] })
	edges!: FlowDemoEdgeDto[];

	@ApiProperty({ type: () => FlowDemoRunDto })
	run!: FlowDemoRunDto;
}

class FlowTriggerDto {
	@ApiProperty({ type: Number, maximum: 1_000_000 })
	@IsInt()
	@Min(0)
	@Max(1_000_000)
	amount!: number;

	@ApiProperty({ type: String, maxLength: 256 })
	@IsString()
	@MinLength(1)
	@MaxLength(256)
	address!: string;
}

class FlowNodeConfigDto {
	@ApiProperty({ type: "object", additionalProperties: true })
	@IsObject()
	config!: Record<string, number | string>;
}

@ApiTags("flows")
@Controller("v1/flows")
export class FlowsController {
	constructor(@Inject(FlowsService) private readonly flows: FlowsService) {}

	@Get("demo")
	@ApiOkResponse({ type: FlowDemoSnapshotDto })
	getDemo(): FlowDemoSnapshotDto {
		return this.flows.getDemo();
	}

	@Post("demo/reset")
	@ApiOkResponse({ type: FlowDemoSnapshotDto })
	reset(): FlowDemoSnapshotDto {
		return this.flows.reset();
	}

	@Post("demo/trigger")
	@ApiBody({ type: FlowTriggerDto })
	@ApiOkResponse({ type: FlowDemoSnapshotDto })
	trigger(@Body() body: FlowTriggerDto): FlowDemoSnapshotDto {
		return this.flows.trigger(body.amount, body.address);
	}

	@Get("demo/run")
	@ApiOkResponse({ type: FlowDemoRunDto })
	getRun(): FlowDemoRunDto {
		return this.flows.getRun();
	}

	@Patch("demo/nodes/:id/config")
	@ApiParam({ name: "id", type: String })
	@ApiBody({ type: FlowNodeConfigDto })
	@ApiOkResponse({ type: FlowDemoSnapshotDto })
	patchConfig(
		@Param("id") id: string,
		@Body() body: FlowNodeConfigDto,
	): FlowDemoSnapshotDto {
		return this.flows.patchNodeConfig(id, body.config);
	}
}
