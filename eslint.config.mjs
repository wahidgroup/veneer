import { defineConfig } from "eslint/config";
import base from "@wahidgroup/lint-rules/eslint/base";
import react from "@wahidgroup/lint-rules/eslint/react";
import strict from "@wahidgroup/lint-rules/eslint/strict";

/**
 * jsx-a11y / react-hooks flat configs are untyped; narrow before spread.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const reactConfigs = react;

export default defineConfig(
	{
		ignores: ["examples/**", "tests/**"],
	},
	...base,
	...reactConfigs,
	...strict,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.mjs", "prettier.config.mjs"],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
