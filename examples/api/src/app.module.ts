import { Module } from "@nestjs/common";

import { CommandsController } from "./commands/commands.controller.js";
import { CommandsService } from "./commands/commands.service.js";
import { HealthController } from "./health/health.controller.js";
import { LogsController } from "./logs/logs.controller.js";
import { LogsGateway } from "./logs/logs.gateway.js";
import { LogsService } from "./logs/logs.service.js";
import { MetricsController } from "./metrics/metrics.controller.js";
import { MetricsService } from "./metrics/metrics.service.js";
import { OptionsController } from "./options/options.controller.js";
import { OptionsService } from "./options/options.service.js";
import { TablesController } from "./tables/tables.controller.js";
import { TablesGateway } from "./tables/tables.gateway.js";
import { TablesService } from "./tables/tables.service.js";

@Module({
	controllers: [
		CommandsController,
		HealthController,
		LogsController,
		MetricsController,
		OptionsController,
		TablesController,
	],
	providers: [
		CommandsService,
		LogsService,
		LogsGateway,
		MetricsService,
		OptionsService,
		TablesService,
		TablesGateway,
	],
})
export class AppModule {}
