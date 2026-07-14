import { Type } from "class-transformer";
import {
	Body,
	Controller,
	Get,
	Inject,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOkResponse,
	ApiParam,
	ApiProperty,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import {
	ArrayMinSize,
	IsArray,
	IsString,
	ValidateNested,
} from "class-validator";

import type { ApiEnvelope } from "../common/envelope.interceptor.js";
import type { TableRow } from "./tables.service.js";
import { ListQueryDto } from "../common/list-query.dto.js";
import { TablesService } from "./tables.service.js";

class TableRowDto {
	@ApiProperty({ type: String })
	@IsString()
	id!: string;

	@ApiProperty({ type: String })
	@IsString()
	name!: string;

	@ApiProperty({ type: String })
	@IsString()
	status!: string;
}

class AddRowsDto {
	@ApiProperty({ type: [TableRowDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => TableRowDto)
	rows!: TableRowDto[];
}

class TableCountDto {
	@ApiProperty({ type: Number })
	count!: number;
}

@ApiTags("tables")
@Controller("v1/tables")
export class TablesController {
	constructor(
		@Inject(TablesService) private readonly tables: TablesService,
	) {}

	@Get(":id")
	@ApiParam({ name: "id", type: String })
	@ApiQuery({ name: "page", required: false, type: Number })
	@ApiQuery({ name: "limit", required: false, type: Number })
	@ApiQuery({ name: "search", required: false, type: String })
	@ApiOkResponse({ type: TableRowDto, isArray: true })
	list(
		@Param("id") id: string,
		@Query() query: ListQueryDto,
	): ApiEnvelope<TableRow[]> {
		const result = this.tables.list(
			id,
			query.page,
			query.limit,
			query.search,
		);

		return {
			data: result.items,
			meta: {
				timestamp: new Date().toISOString(),
				pagination: result.pagination,
			},
		};
	}

	@Post(":id/rows")
	@ApiParam({ name: "id", type: String })
	@ApiBody({ type: AddRowsDto })
	@ApiOkResponse({ type: TableCountDto })
	addRows(@Param("id") id: string, @Body() body: AddRowsDto): TableCountDto {
		return this.tables.addRows(id, body.rows);
	}

	@Post(":id/reset")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: TableCountDto })
	reset(@Param("id") id: string): TableCountDto {
		return this.tables.reset(id);
	}
}
