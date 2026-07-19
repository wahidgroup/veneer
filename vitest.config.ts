import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				url: "http://localhost:5173",
			},
		},
		include: ["src/**/*.test.{ts,tsx}"],
		exclude: ["node_modules"],
		setupFiles: ["src/test/setup.ts"],
		root: ".",
		coverage: {
			provider: "v8",
			reporter: ["text", "cobertura"],
			reportsDirectory: "coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
		},
	},
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "./src"),
		},
	},
});
