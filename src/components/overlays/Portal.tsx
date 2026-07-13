import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
	children: ReactNode;
	container?: Element | DocumentFragment | null;
}

/**
 * Renders children into `document.body` (or `container`).
 * Use for floating UI that must escape overflow clipping.
 */
function Portal({ children, container }: PortalProps) {
	if (typeof document === "undefined") {
		return null;
	}

	let target: Element | DocumentFragment = document.body;
	if (container !== undefined && container !== null) {
		target = container;
	}

	return createPortal(children, target);
}

export type { PortalProps };
export { Portal };
