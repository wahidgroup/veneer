import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import { createApp } from "../create-app.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const specPath = resolve(root, "openapi.json");

async function main(): Promise<void> {
	const { app, document } = await createApp();

	mkdirSync(dirname(specPath), { recursive: true });
	writeFileSync(specPath, `${JSON.stringify(document, null, "\t")}\n`);

	console.log(`OpenAPI spec -> ${specPath}`);

	execSync("npm run generate-types", {
		stdio: "inherit",
		cwd: root,
	});

	await app.close();
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
