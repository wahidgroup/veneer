import { afterEach, describe, expect, it } from "vitest";

import {
	captureFocusRestore,
	focusInitial,
	listFocusable,
	restoreFocus,
	trapTabKey,
} from "./focusScope.js";

describe("focusScope", () => {
	afterEach(() => {
		document.body.replaceChildren();
	});

	it("lists enabled focusable descendants in document order", () => {
		const root = document.createElement("div");
		root.innerHTML = `
			<button type="button">One</button>
			<button type="button" disabled>Skip</button>
			<a href="#x">Link</a>
			<span tabindex="-1">Ignored</span>
			<input type="text" />
		`;
		document.body.append(root);

		const nodes = listFocusable(root);
		expect(nodes).toHaveLength(3);
		expect(nodes[0]).toHaveTextContent("One");
		expect(nodes[1]).toHaveTextContent("Link");
		expect(nodes[2]?.tagName).toBe("INPUT");
	});

	it("focusInitial prefers the first focusable, else the root", () => {
		const root = document.createElement("div");
		root.tabIndex = -1;
		document.body.append(root);

		focusInitial(root);
		expect(document.activeElement).toBe(root);

		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "Go";
		root.append(button);

		focusInitial(root);
		expect(document.activeElement).toBe(button);
	});

	it("trapTabKey wraps forward and backward within the scope", () => {
		const root = document.createElement("div");
		root.tabIndex = -1;

		const first = document.createElement("button");
		first.type = "button";
		first.textContent = "First";

		const second = document.createElement("button");
		second.type = "button";
		second.textContent = "Second";

		root.append(first, second);
		document.body.append(root);

		second.focus();

		const tabForward = new KeyboardEvent("keydown", {
			key: "Tab",
			bubbles: true,
			cancelable: true,
		});
		trapTabKey(tabForward, root);
		expect(tabForward.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(first);

		first.focus();

		const tabBackward = new KeyboardEvent("keydown", {
			key: "Tab",
			shiftKey: true,
			bubbles: true,
			cancelable: true,
		});
		trapTabKey(tabBackward, root);
		expect(tabBackward.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(second);
	});

	it("captureFocusRestore and restoreFocus round-trip", () => {
		const button = document.createElement("button");
		button.type = "button";
		document.body.append(button);
		button.focus();

		const captured = captureFocusRestore();
		expect(captured).toBe(button);

		const other = document.createElement("button");
		other.type = "button";
		document.body.append(other);
		other.focus();

		restoreFocus(captured);
		expect(document.activeElement).toBe(button);
	});
});
