import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(TESTS_DIR, "..");

function allocatePort(envKey: string): string {
	const existing = process.env[envKey];
	if (existing) {
		return existing;
	}

	const port = execSync("./scripts/get-port.sh", {
		cwd: ROOT,
		stdio: ["ignore", "pipe", "inherit"],
	})
		.toString()
		.trim();

	process.env[envKey] = port;

	return port;
}

const API_PORT = allocatePort("E2E_API_PORT");
const UI_PORT = allocatePort("E2E_UI_PORT");
const PROOF_PORT = allocatePort("E2E_PROOF_PORT");

const webServerEnv = {
	...process.env,
	API_PORT,
};

export default defineConfig({
	testDir: "./specs",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: 0,
	reporter: "list",
	use: {
		baseURL: `http://127.0.0.1:${UI_PORT}`,
		trace: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: [
		{
			command: "npm run start --prefix examples/api",
			cwd: ROOT,
			env: webServerEnv,
			url: `http://127.0.0.1:${API_PORT}/health`,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
			stdout: "pipe",
			stderr: "pipe",
		},
		{
			command: `npm run dev --prefix examples -- --host 127.0.0.1 --port ${UI_PORT} --strictPort`,
			cwd: ROOT,
			env: webServerEnv,
			url: `http://127.0.0.1:${UI_PORT}`,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
			stdout: "pipe",
			stderr: "pipe",
		},
		{
			command: `npx vite --config overlay-focus.vite.config.ts --host 127.0.0.1 --port ${PROOF_PORT} --strictPort`,
			cwd: resolve(ROOT, "examples"),
			env: webServerEnv,
			url: `http://127.0.0.1:${PROOF_PORT}`,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
			stdout: "pipe",
			stderr: "pipe",
		},
	],
});
