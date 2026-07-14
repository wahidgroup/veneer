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

// jsdom does not implement getComputedStyle(). axe asks for
// ::before/::after and floods the run with "Not implemented" errors.
const getComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element: Element) => {
	return getComputedStyle(element);
};

afterEach(cleanup);
