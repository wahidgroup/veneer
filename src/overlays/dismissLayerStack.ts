import { useLayoutEffect, useRef } from "react";

interface DismissLayer {
	onEscape: () => void;
}

interface UseDismissLayerOptions {
	open: boolean;
	onEscape: () => void;
}

/**
 * Every portaled dismiss layer paints in this tier.
 * DOM mount order breaks ties. This is the S-ORDER invariant.
 */
const DISMISS_LAYER_TIER_CLASS = "z-modal";

/**
 * One bubble-phase document listener for every open dismiss layer.
 * The listener is added on the first push and removed on the last pop.
 */
class DismissLayerStack {
	readonly #doc: Document;
	#layers: DismissLayer[] = [];
	#attached = false;

	constructor(doc: Document) {
		this.#doc = doc;
	}

	push(layer: DismissLayer): () => void {
		this.#layers.push(layer);
		this.#listen();

		let active = true;
		return () => {
			if (!active) {
				return;
			}
			active = false;

			const index = this.#layers.indexOf(layer);
			if (index < 0) {
				return;
			}

			this.#layers.splice(index, 1);
			this.#removeKeyListener();
		};
	}

	#listen(): void {
		if (this.#attached) {
			return;
		}

		this.#doc.addEventListener("keydown", this.#onKeydown);
		this.#attached = true;
	}

	#removeKeyListener(): void {
		if (!this.#attached) {
			return;
		}
		if (this.#layers.length > 0) {
			return;
		}

		this.#doc.removeEventListener("keydown", this.#onKeydown);
		this.#attached = false;
	}

	#onKeydown = (event: KeyboardEvent): void => {
		if (event.key !== "Escape") {
			return;
		}
		if (event.defaultPrevented) {
			return;
		}

		const top = this.#layers.at(-1);
		if (top === undefined) {
			return;
		}

		event.preventDefault();
		top.onEscape();
	};
}

let activeStack: DismissLayerStack | undefined;

function currentStack(): DismissLayerStack {
	if (typeof document === "undefined") {
		throw new Error("dismiss layer stack requires a document");
	}
	activeStack ??= new DismissLayerStack(document);

	return activeStack;
}

/**
 * Push this layer while `open` and pop it on cleanup.
 * Later pushes sit above earlier ones. Only the top layer receives Escape.
 */
function useDismissLayer({ open, onEscape }: UseDismissLayerOptions): void {
	const onEscapeRef = useRef(onEscape);

	useLayoutEffect(() => {
		onEscapeRef.current = onEscape;
	}, [onEscape]);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}
		if (typeof document === "undefined") {
			return;
		}

		return currentStack().push({
			onEscape: () => {
				onEscapeRef.current();
			},
		});
	}, [open]);
}

export type { DismissLayer, UseDismissLayerOptions };
export { DISMISS_LAYER_TIER_CLASS, DismissLayerStack, useDismissLayer };
