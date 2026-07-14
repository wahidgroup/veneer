const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Focusable descendants of `root` (anchors, enabled controls, positive
 * tabindex). Used by modal dialogs for initial focus and Tab trapping.
 */
function listFocusable(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Focus the first focusable descendant, or `root` when the scope is empty.
 */
function focusInitial(root: HTMLElement): void {
	const targets = listFocusable(root);
	const first = targets[0];
	if (first !== undefined) {
		first.focus();
		return;
	}

	root.focus();
}

/**
 * Cycle Tab / Shift+Tab inside `root`. No-op for other keys.
 */
function trapTabKey(event: KeyboardEvent, root: HTMLElement): void {
	if (event.key !== "Tab") {
		return;
	}

	const targets = listFocusable(root);
	if (targets.length === 0) {
		event.preventDefault();
		root.focus();
		return;
	}

	const first = targets[0];
	const last = targets[targets.length - 1];
	if (first === undefined || last === undefined) {
		return;
	}

	const activeEl = document.activeElement;
	if (event.shiftKey) {
		if (activeEl === first || activeEl === root) {
			event.preventDefault();
			last.focus();
		}
		return;
	}

	if (activeEl === last) {
		event.preventDefault();
		first.focus();
	}
}

/**
 * Capture the currently focused element for later restore, if any.
 */
function captureFocusRestore(): HTMLElement | null {
	const active = document.activeElement;
	if (active instanceof HTMLElement) {
		return active;
	}

	return null;
}

/**
 * Restore focus to a previously captured element.
 */
function restoreFocus(target: HTMLElement | null): void {
	if (target === null) {
		return;
	}

	target.focus();
}

export {
	captureFocusRestore,
	focusInitial,
	listFocusable,
	restoreFocus,
	trapTabKey,
};
