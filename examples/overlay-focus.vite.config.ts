import { fileURLToPath } from "node:url";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const examplesDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(examplesDir, "..");
const rootModules = path.join(packageRoot, "node_modules");

/**
 * Playwright-only dev server. `vite build` in this package uses
 * vite.config.ts and index.html, so this entry is not in the examples dist.
 */
export default defineConfig({
	root: path.join(packageRoot, "tests/fixtures/overlay-focus"),
	plugins: [react(), tailwindcss()],
	resolve: {
		dedupe: ["react", "react-dom"],
		alias: {
			"@wahidgroup/veneer": path.join(packageRoot, "src/index.ts"),
			react: path.join(rootModules, "react"),
			"react-dom": path.join(rootModules, "react-dom"),
			"react/jsx-runtime": path.join(rootModules, "react/jsx-runtime.js"),
			"react/jsx-dev-runtime": path.join(rootModules, "react/jsx-dev-runtime.js"),
		},
	},
	server: {
		host: "127.0.0.1",
		strictPort: true,
		fs: {
			allow: [packageRoot],
		},
	},
});
