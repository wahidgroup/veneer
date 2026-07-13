import { describe, expect, it } from "vitest";
import * as lib from "./index.js";

/**
 * Runtime export lock. Grow as public API expands.
 */
const EXPECTED_EXPORTS = new Set([
	"Badge",
	"badgeVariants",
	"Button",
	"buttonVariants",
	"Checkbox",
	"cn",
	"Combobox",
	"controlVariants",
	"cva",
	"DateTimePicker",
	"FieldError",
	"FieldHint",
	"FileUpload",
	"FormField",
	"FormSection",
	"Input",
	"Label",
	"Loading",
	"loadingVariants",
	"NumberInput",
	"Portal",
	"RadioGroup",
	"SearchInput",
	"Select",
	"Slider",
	"Tabs",
	"TabsList",
	"TabsPanel",
	"TabsTrigger",
	"TagInput",
	"TextArea",
	"Toggle",
	"useDebounce",
]);

describe("public API surface", () => {
	it("exposes exactly the expected set of runtime exports", () => {
		const actualKeys = new Set(Object.keys(lib));

		const missing = [...EXPECTED_EXPORTS].filter((k) => {
			return !actualKeys.has(k);
		});
		const unexpected = [...actualKeys].filter((k) => {
			return !EXPECTED_EXPORTS.has(k);
		});

		expect(missing).toEqual([]);
		expect(unexpected).toEqual([]);
	});
});
