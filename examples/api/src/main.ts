import { createApp } from "./create-app.js";

async function bootstrap() {
	const portEnv = process.env.API_PORT;
	let port = 0;
	if (portEnv !== undefined && portEnv !== "") {
		port = Number(portEnv);
	}

	const { app } = await createApp();
	await app.listen(port, "127.0.0.1");

	const address = app.getHttpServer().address();
	let bound = String(port);
	if (address !== null && typeof address === "object") {
		bound = String(address.port);
	}

	console.log(`examples api listening on 127.0.0.1:${bound}`);
}

void bootstrap();
