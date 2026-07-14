import { Module } from "@nestjs/common";

import { HealthController } from "./health/health.controller.js";
import { LogsController } from "./logs/logs.controller.js";
import { LogsGateway } from "./logs/logs.gateway.js";
import { LogsService } from "./logs/logs.service.js";
import { TablesController } from "./tables/tables.controller.js";
import { TablesGateway } from "./tables/tables.gateway.js";
import { TablesService } from "./tables/tables.service.js";

@Module({
	controllers: [HealthController, LogsController, TablesController],
	providers: [LogsService, LogsGateway, TablesService, TablesGateway],
})
export class AppModule {}
