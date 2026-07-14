import "reflect-metadata";

import type { NestExpressApplication } from "@nestjs/platform-express";
import type { OpenAPIObject } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { EnvelopeInterceptor } from "./common/envelope.interceptor.js";

async function createApp(): Promise<{
	app: NestExpressApplication;
	document: OpenAPIObject;
}> {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: ["error", "warn"],
	});
	app.useWebSocketAdapter(new WsAdapter(app));
	app.enableCors({ origin: true });
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidUnknownValues: true,
		}),
	);
	app.useGlobalInterceptors(new EnvelopeInterceptor());
	app.enableShutdownHooks();

	const config = new DocumentBuilder()
		.setTitle("Veneer Examples API")
		.setDescription("In-memory control plane for Veneer examples")
		.setVersion("0.0.0")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);

	return { app, document };
}

export { createApp };
