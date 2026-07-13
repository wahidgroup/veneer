import { afterEach, describe, expect, it } from "vitest";

import { lockBodyScroll } from "./lockBodyScroll.js";

describe("lockBodyScroll", () => {
	afterEach(() => {
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
	});

	it("sets overflow hidden and restores prior inline styles", () => {
		document.body.style.overflow = "auto";
		document.body.style.paddingRight = "12px";

		const unlock = lockBodyScroll();
		expect(document.body.style.overflow).toBe("hidden");

		unlock();
		expect(document.body.style.overflow).toBe("auto");
		expect(document.body.style.paddingRight).toBe("12px");
	});
});
