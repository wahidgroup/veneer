import { defineConfig } from "eslint/config";
import base from "@wahidgroup/lint-rules/eslint/base";
import nestjs from "@wahidgroup/lint-rules/eslint/nestjs";
import strict from "@wahidgroup/lint-rules/eslint/strict";

export default defineConfig(
	{
		ignores: ["dist/**", "openapi.json"],
	},
	...base,
	...nestjs,
	...strict,
	{
		files: ["**/*.test.ts"],
		rules: {
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						"eslint.config.mjs",
						"vitest.config.ts",
					],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
