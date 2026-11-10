import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from "@nestjs/swagger";

import type { CommandItem } from "./command-types.js";
import { CommandsService } from "./commands.service.js";

class CommandItemDto {
	@ApiProperty({ type: String })
	@IsString()
	@MinLength(1)
	id!: string;

	@ApiProperty({ type: String })
	@IsString()
	@MinLength(1)
	label!: string;

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsString()
	group?: string;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	keywords?: string[];

	@ApiPropertyOptional({ type: Boolean })
	@IsOptional()
	@IsBoolean()
	disabled?: boolean;
}

class CommandItemListDto {
	@ApiProperty({ type: [CommandItemDto] })
	items!: CommandItemDto[];
}

class CommandQueryDto {
	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsString()
	q?: string;
}

class CommandCountDto {
	@ApiProperty({ type: Number })
	count!: number;
}

@ApiTags("commands")
@Controller("v1/commands")
export class CommandsController {
	constructor(@Inject(CommandsService) private readonly commands: CommandsService) {}

	@Get()
	@ApiQuery({ name: "q", required: false, type: String })
	@ApiOkResponse({ type: CommandItemListDto })
	list(@Query() query: CommandQueryDto): { items: CommandItem[] } {
		return this.commands.list(query.q);
	}

	@Post()
	@ApiBody({ type: CommandItemDto })
	@ApiOkResponse({ type: CommandItemDto })
	add(@Body() body: CommandItemDto): CommandItem {
		return this.commands.add(body);
	}

	@Post("reset")
	@ApiOkResponse({ type: CommandCountDto })
	reset(): CommandCountDto {
		return this.commands.reset();
	}

	@Delete(":id")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: CommandCountDto })
	remove(@Param("id") id: string): CommandCountDto {
		return this.commands.remove(id);
	}
}
