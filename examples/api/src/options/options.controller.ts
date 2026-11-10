import { IsOptional, IsString, MinLength } from "class-validator";
import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from "@nestjs/swagger";

import type { InstanceOption } from "./option-types.js";
import { OptionsService } from "./options.service.js";

class InstanceOptionDto {
	@ApiProperty({ type: String })
	@IsString()
	@MinLength(1)
	value!: string;

	@ApiProperty({ type: String })
	@IsString()
	@MinLength(1)
	label!: string;
}

class InstanceOptionListDto {
	@ApiProperty({ type: [InstanceOptionDto] })
	items!: InstanceOptionDto[];
}

class InstanceOptionQueryDto {
	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsString()
	q?: string;
}

class OptionCountDto {
	@ApiProperty({ type: Number })
	count!: number;
}

@ApiTags("options")
@Controller("v1/options/instances")
export class OptionsController {
	constructor(@Inject(OptionsService) private readonly options: OptionsService) {}

	@Get()
	@ApiQuery({ name: "q", required: false, type: String })
	@ApiOkResponse({ type: InstanceOptionListDto })
	list(@Query() query: InstanceOptionQueryDto): { items: InstanceOption[] } {
		return this.options.list(query.q);
	}

	@Post()
	@ApiBody({ type: InstanceOptionDto })
	@ApiOkResponse({ type: InstanceOptionDto })
	add(@Body() body: InstanceOptionDto): InstanceOption {
		return this.options.add(body);
	}

	@Post("reset")
	@ApiOkResponse({ type: OptionCountDto })
	reset(): OptionCountDto {
		return this.options.reset();
	}

	@Delete(":value")
	@ApiParam({ name: "value", type: String })
	@ApiOkResponse({ type: OptionCountDto })
	remove(@Param("value") value: string): OptionCountDto {
		return this.options.remove(value);
	}
}
