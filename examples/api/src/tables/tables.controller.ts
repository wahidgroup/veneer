import { Transform, Type } from "class-transformer";
import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from "class-validator";

import type { ApiEnvelope } from "../common/envelope.interceptor.js";
import type { TableRow } from "./table-types.js";
import { TablesService } from "./tables.service.js";

enum TableRowStatusEnum {
	Healthy = "healthy",
	Degraded = "degraded",
	Down = "down",
}

function toNumber(value: unknown): number | undefined {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}
	if (Array.isArray(value)) {
		const items: string[] = [];
		for (const item of value) {
			if (typeof item === "string") {
				items.push(item);
			}
		}

		return items;
	}
	if (typeof value === "string") {
		return [value];
	}

	return undefined;
}

class TableListQueryDto {
	@ApiPropertyOptional({ default: 1 })
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => {
		return toNumber(value);
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 25 })
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => {
		return toNumber(value);
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(500)
	limit = 25;

	@ApiPropertyOptional({ type: [String], isArray: true })
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => {
		return toStringArray(value);
	})
	@IsArray()
	@IsString({ each: true })
	queries?: string[];

	@ApiPropertyOptional({
		description: "Alias for a single query chip when queries is omitted",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		enum: ["name", "region", "status", "cpu"],
	})
	@IsOptional()
	@IsString()
	@IsIn(["name", "region", "status", "cpu"])
	sortBy?: string;

	@ApiPropertyOptional({ type: Boolean })
	@IsOptional()
	@Transform(({ value }: { value: unknown }) => {
		if (value === true || value === "true" || value === "1") {
			return true;
		}
		if (value === false || value === "false" || value === "0") {
			return false;
		}

		return undefined;
	})
	@IsBoolean()
	sortDesc?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	filterName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	filterRegion?: string;

	@ApiPropertyOptional({
		enum: TableRowStatusEnum,
		enumName: "TableRowStatusEnum",
	})
	@IsOptional()
	@IsEnum(TableRowStatusEnum)
	filterStatus?: TableRowStatusEnum;
}

class TableRowDto {
	@ApiProperty({ type: String })
	@IsString()
	id!: string;

	@ApiProperty({ type: String })
	@IsString()
	name!: string;

	@ApiProperty({ type: String })
	@IsString()
	region!: string;

	@ApiProperty({
		enum: TableRowStatusEnum,
		enumName: "TableRowStatusEnum",
	})
	@IsEnum(TableRowStatusEnum)
	status!: TableRowStatusEnum;

	@ApiProperty({ type: Number })
	@IsNumber()
	cpu!: number;
}

class AddRowsDto {
	@ApiProperty({ type: [TableRowDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => TableRowDto)
	rows!: TableRowDto[];
}

class RemoveRowsDto {
	@ApiProperty({ type: [String] })
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	ids!: string[];
}

class TableCountDto {
	@ApiProperty({ type: Number })
	count!: number;
}

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

@ApiTags("tables")
@Controller("v1/tables")
export class TablesController {
	constructor(@Inject(TablesService) private readonly tables: TablesService) {}

	@Get(":id")
	@ApiParam({ name: "id", type: String })
	@ApiQuery({ name: "page", required: false, type: Number })
	@ApiQuery({ name: "limit", required: false, type: Number })
	@ApiQuery({ name: "queries", required: false, type: String, isArray: true })
	@ApiQuery({ name: "search", required: false, type: String })
	@ApiQuery({ name: "sortBy", required: false, type: String })
	@ApiQuery({ name: "sortDesc", required: false, type: Boolean })
	@ApiQuery({ name: "filterName", required: false, type: String })
	@ApiQuery({ name: "filterRegion", required: false, type: String })
	@ApiQuery({ name: "filterStatus", required: false, type: String })
	@ApiOkResponse({ type: TableRowDto, isArray: true })
	list(@Param("id") id: string, @Query() query: TableListQueryDto): ApiEnvelope<TableRow[]> {
		const result = this.tables.list(id, {
			page: Number(query.page),
			limit: Number(query.limit),
			queries: query.queries,
			search: query.search,
			sortBy: query.sortBy,
			sortDesc: query.sortDesc,
			filterName: query.filterName,
			filterRegion: query.filterRegion,
			filterStatus: query.filterStatus,
		});

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

	@Post(":id/rows/remove")
	@ApiParam({ name: "id", type: String })
	@ApiBody({ type: RemoveRowsDto })
	@ApiOkResponse({ type: TableCountDto })
	removeRows(@Param("id") id: string, @Body() body: RemoveRowsDto): TableCountDto {
		return this.tables.removeRows(id, body.ids);
	}

	@Post(":id/reset")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: ResetStateDto })
	reset(@Param("id") id: string): ResetStateDto {
		return this.tables.reset(id);
	}

	@Get(":id/stream")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: StreamStateDto })
	streamStatus(@Param("id") id: string): StreamStateDto {
		return { streaming: this.tables.isStreaming(id) };
	}

	@Post(":id/stream/start")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: StreamStateDto })
	startStream(@Param("id") id: string): StreamStateDto {
		return this.tables.startStream(id);
	}

	@Post(":id/stream/stop")
	@ApiParam({ name: "id", type: String })
	@ApiOkResponse({ type: StreamStateDto })
	stopStream(@Param("id") id: string): StreamStateDto {
		return this.tables.stopStream(id);
	}
}
