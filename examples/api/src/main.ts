import { createApp } from "./create-app.js";

async function bootstrap() {
	const port = Number(process.env.API_PORT ?? "8787");
	const { app } = await createApp();

	await app.listen(port, "127.0.0.1");

	console.log(`examples api listening on 127.0.0.1:${String(port)}`);
}

void bootstrap();
