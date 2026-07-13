import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
	value: () => {
		return null;
	},
});

afterEach(cleanup);
