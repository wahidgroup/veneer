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
	},
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "./src"),
		},
	},
});
