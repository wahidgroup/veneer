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

export default defineConfig({
	testDir: "./specs",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
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
			command: `API_PORT=${API_PORT} npm run start --prefix ../examples/api`,
			url: `http://127.0.0.1:${API_PORT}/health`,
			reuseExistingServer: false,
			timeout: 120_000,
		},
		{
			command: `API_PORT=${API_PORT} npm run dev --prefix ../examples -- --port ${UI_PORT} --strictPort`,
			url: `http://127.0.0.1:${UI_PORT}`,
			reuseExistingServer: false,
			timeout: 120_000,
		},
	],
});
