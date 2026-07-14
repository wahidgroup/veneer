import { fileURLToPath } from "node:url";
import { createLogger, defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(rootDir, "..");
const rootModules = path.join(packageRoot, "node_modules");

let apiPort = "8787";
if (process.env.API_PORT !== undefined && process.env.API_PORT !== "") {
	apiPort = process.env.API_PORT;
}

const apiTarget = `http://127.0.0.1:${apiPort}`;

const logger = createLogger();
const logError = logger.error.bind(logger);

logger.error = (msg, options) => {
	if (typeof msg === "string") {
		const benignWsProxy =
			msg.includes("ws proxy socket error:") ||
			msg.includes("ws proxy error:");
		if (benignWsProxy) {
			if (msg.includes("EPIPE") || msg.includes("ECONNRESET")) {
				return;
			}
		}
	}

	logError(msg, options);
};

export default defineConfig({
	customLogger: logger,
	plugins: [react(), tailwindcss()],
	resolve: {
		dedupe: ["react", "react-dom"],
		alias: {
			"@wahidgroup/veneer/data-table": path.join(
				packageRoot,
				"src/data-table.ts",
			),
			"@wahidgroup/veneer/diff": path.join(packageRoot, "src/diff.ts"),
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
		host: "127.0.0.1",
		port: 5173,
		strictPort: false,
		open: false,
		proxy: {
			"/health": {
				target: apiTarget,
				changeOrigin: true,
			},
			"/v1": {
				target: apiTarget,
				changeOrigin: true,
				ws: true,
			},
			"/docs": {
				target: apiTarget,
				changeOrigin: true,
			},
		},
	},
});
