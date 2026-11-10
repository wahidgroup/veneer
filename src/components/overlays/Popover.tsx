import type { KeyboardEvent, ReactNode } from "react";
import { useId } from "react";

import { useControllableState } from "../../hooks/useControllableState.js";
import { usePopover } from "../../hooks/usePopover.js";
import { DISMISS_LAYER_TIER_CLASS } from "../../overlays/dismissLayerStack.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { Portal } from "./Portal.js";

interface PopoverProps {
	trigger: ReactNode;
	children: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	title?: string;
	className?: string;
}

/**
 * Non-modal floating panel for interactive help or extras. Esc and outside
 * press dismiss. Not a Tooltip (allows focusable children).
 */
function Popover({
	trigger,
	children,
	open: openProp,
	defaultOpen,
	onOpenChange,
	title,
	className,
}: PopoverProps) {
	let initialOpen = defaultOpen;
	initialOpen ??= false;

	const [open, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: initialOpen,
		onChange: onOpenChange,
	});

	const panelId = useId();
	const titleId = useId();

	const { setReference, setFloating, floatingStyles } = usePopover({
		open,
		onClose: () => {
			setOpen(false);
		},
		matchTriggerWidth: false,
	});

	function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "ArrowDown" || event.key === "Enter") {
			event.preventDefault();
			setOpen(true);
		}
	}

	let titleNode: ReactNode = null;
	if (title !== undefined && title.length > 0) {
		titleNode = (
			<div
				id={titleId}
				className="mb-2 text-sm font-semibold text-foreground"
			>
				{title}
			</div>
		);
	}

	let labelledBy: string | undefined;
	if (titleNode !== null) {
		labelledBy = titleId;
	}

	let panel: ReactNode = null;
	if (open) {
		panel = (
			<Portal>
				<div
					ref={setFloating}
					id={panelId}
					role="dialog"
					aria-modal={false}
					aria-labelledby={labelledBy}
					data-slot="popover-content"
					style={floatingStyles}
					className={cn(
						DISMISS_LAYER_TIER_CLASS,
						"max-w-xs rounded-md border border-border bg-popover p-3",
						"text-sm text-popover-foreground shadow-md outline-none",
						className,
					)}
				>
					{titleNode}
					{children}
				</div>
			</Portal>
		);
	}

	return (
		<div data-slot="popover" className="inline-flex">
			<div ref={setReference} className="inline-flex">
				<Button
					type="button"
					variant="outlined"
					size="sm"
					aria-expanded={open}
					aria-controls={panelId}
					aria-haspopup="dialog"
					onClick={() => {
						setOpen(!open);
					}}
					onKeyDown={onTriggerKeyDown}
				>
					{trigger}
				</Button>
			</div>
			{panel}
		</div>
	);
}

export type { PopoverProps };
export { Popover };
