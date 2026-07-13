import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(rootDir, "..");
const rootModules = path.join(packageRoot, "node_modules");

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		dedupe: ["react", "react-dom"],
		alias: {
			"@wahidgroup/veneer": path.join(packageRoot, "src/index.ts"),
			react: path.join(rootModules, "react"),
			"react-dom": path.join(rootModules, "react-dom"),
			"react/jsx-runtime": path.join(rootModules, "react/jsx-runtime.js"),
			"react/jsx-dev-runtime": path.join(
				rootModules,
				"react/jsx-dev-runtime.js",
			),
		},
	},
	server: {
		port: 5173,
		open: false,
	},
});
