import type { MouseEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { ActionMenuEntry } from "./actionMenuList.js";
import { DISMISS_LAYER_TIER_CLASS, useDismissLayer } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Portal } from "./Portal.js";
import { focusFirstMenuItem, onActionMenuKeyDown, renderActionMenuEntries } from "./actionMenuList.js";

interface ContextMenuPosition {
	x: number;
	y: number;
}

interface ContextMenuProps {
	items: ActionMenuEntry[];
	children: ReactNode;
	className?: string;
}

/**
 * APG menu pattern on `contextmenu`. Opens at pointer; Esc and outside
 * press dismiss. Parent supplies `ActionMenuEntry` items (same shape as
 * ActionMenu).
 */
function ContextMenu({ items, children, className }: ContextMenuProps) {
	const menuId = useId();
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState<ContextMenuPosition>({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		focusFirstMenuItem(menuId);
	}, [open, menuId]);

	useDismissLayer({
		open,
		onEscape: () => {
			setOpen(false);
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		const handlePointer = (event: globalThis.MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) {
				return;
			}

			const panel = panelRef.current;
			if (panel?.contains(target) === true) {
				return;
			}

			setOpen(false);
		};

		document.addEventListener("mousedown", handlePointer);

		return () => {
			document.removeEventListener("mousedown", handlePointer);
		};
	}, [open]);

	function onContextMenu(event: MouseEvent<HTMLDivElement>) {
		event.preventDefault();

		setPosition({ x: event.clientX, y: event.clientY });
		setOpen(true);
	}

	let menuNode: ReactNode = null;
	if (open) {
		menuNode = (
			<Portal>
				<div
					ref={panelRef}
					id={menuId}
					role="menu"
					data-slot="context-menu-panel"
					tabIndex={-1}
					style={{
						position: "fixed",
						top: position.y,
						left: position.x,
						visibility: "visible",
					}}
					className={cn(
						DISMISS_LAYER_TIER_CLASS,
						"min-w-44 overflow-auto rounded-md border border-border bg-card py-1 shadow-md",
					)}
					onKeyDown={onActionMenuKeyDown}
				>
					{renderActionMenuEntries({
						items,
						onItemSelect: (entry) => {
							entry.onSelect();
							setOpen(false);
						},
					})}
				</div>
			</Portal>
		);
	}

	return (
		<div data-slot="context-menu" className={cn(className)} onContextMenu={onContextMenu}>
			{children}
			{menuNode}
		</div>
	);
}

export type { ContextMenuProps, ContextMenuPosition };
export { ContextMenu };
