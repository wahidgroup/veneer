import { describe, expect, it } from "vitest";

import { DismissLayerStack } from "./dismissLayerStack.js";

function escapeEvent(): KeyboardEvent {
	return new KeyboardEvent("keydown", {
		key: "Escape",
		bubbles: true,
		cancelable: true,
	});
}

describe("DismissLayerStack", () => {
	it("returns a pop that removes the layer", () => {
		const doc = document.implementation.createHTMLDocument("stack");
		const stack = new DismissLayerStack(doc);
		const calls: string[] = [];
		const pop = stack.push({
			onEscape: () => {
				calls.push("layer");
			},
		});

		expect(typeof pop).toBe("function");
		pop();
		doc.dispatchEvent(escapeEvent());
		expect(calls).toEqual([]);
	});

	it("sends Escape to the top layer only", () => {
		const doc = document.implementation.createHTMLDocument("stack");
		const stack = new DismissLayerStack(doc);
		const calls: string[] = [];
		stack.push({
			onEscape: () => {
				calls.push("lower");
			},
		});
		const popTop = stack.push({
			onEscape: () => {
				calls.push("top");
			},
		});

		doc.dispatchEvent(escapeEvent());
		expect(calls).toEqual(["top"]);
		popTop();
	});

	it("ignores an Escape that is already defaultPrevented", () => {
		const doc = document.implementation.createHTMLDocument("stack");
		const stack = new DismissLayerStack(doc);
		const calls: string[] = [];
		stack.push({
			onEscape: () => {
				calls.push("top");
			},
		});

		const event = escapeEvent();
		event.preventDefault();
		doc.dispatchEvent(event);
		expect(calls).toEqual([]);
		expect(event.defaultPrevented).toBe(true);
	});

	it("leaves Escape unmarked after the stack is empty", () => {
		const doc = document.implementation.createHTMLDocument("stack");
		const stack = new DismissLayerStack(doc);
		const pop = stack.push({
			onEscape: () => {
				/* emptied before the event */
			},
		});

		pop();
		const event = escapeEvent();
		doc.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});
});
