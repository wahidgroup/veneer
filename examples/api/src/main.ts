import { createApp } from "./create-app.js";

async function bootstrap() {
	const port = Number(process.env.API_PORT ?? "8787");
	const { app } = await createApp();

	await app.listen(port);

	console.log(`examples api listening on ${String(port)}`);
}

void bootstrap();
