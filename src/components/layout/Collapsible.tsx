import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { createContext, useContext, useId, useState } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface CollapsibleContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	disabled: boolean;
	triggerId: string;
	panelId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(): CollapsibleContextValue {
	const ctx = useContext(CollapsibleContext);
	if (ctx === null) {
		throw new Error(
			"Collapsible components must be used within Collapsible",
		);
	}

	return ctx;
}

interface CollapsibleProps extends Omit<ComponentProps<"div">, "onChange"> {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
	triggerId?: string;
	panelId?: string;
	children: ReactNode;
}

/**
 * Disclosure root. Compose `CollapsibleTrigger` and `CollapsibleContent`
 * for a single expand/collapse region.
 */
function Collapsible({
	open,
	defaultOpen,
	onOpenChange,
	disabled,
	triggerId,
	panelId,
	children,
	className,
	...rest
}: CollapsibleProps) {
	const baseId = useId();
	const isControlled = open !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultOpen === true) {
			return true;
		}
		return false;
	});

	let current = uncontrolled;
	if (isControlled) {
		current = open;
	}

	let resolvedDisabled = false;
	if (disabled === true) {
		resolvedDisabled = true;
	}

	let resolvedTriggerId = `${baseId}-trigger`;
	if (triggerId !== undefined) {
		resolvedTriggerId = triggerId;
	}

	let resolvedPanelId = `${baseId}-panel`;
	if (panelId !== undefined) {
		resolvedPanelId = panelId;
	}

	const setOpen = (next: boolean) => {
		if (resolvedDisabled) {
			return;
		}
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onOpenChange !== undefined) {
			onOpenChange(next);
		}
	};

	return (
		<CollapsibleContext.Provider
			value={{
				open: current,
				setOpen,
				disabled: resolvedDisabled,
				triggerId: resolvedTriggerId,
				panelId: resolvedPanelId,
			}}
		>
			<div data-slot="collapsible" className={cn(className)} {...rest}>
				{children}
			</div>
		</CollapsibleContext.Provider>
	);
}

interface CollapsibleTriggerProps extends ComponentProps<"button"> {
	children: ReactNode;
}

/**
 * Button that toggles the paired `CollapsibleContent`. Sets `aria-expanded`
 * and `aria-controls` on the trigger. Shows a caret that rotates when open.
 */
function CollapsibleTrigger({
	children,
	className,
	disabled,
	onClick,
	...rest
}: CollapsibleTriggerProps) {
	const {
		open,
		setOpen,
		disabled: rootDisabled,
		triggerId,
		panelId,
	} = useCollapsibleContext();

	let resolvedDisabled = rootDisabled;
	if (disabled === true) {
		resolvedDisabled = true;
	}

	let caretClass =
		"size-4 shrink-0 text-muted-foreground transition-transform";
	if (open) {
		caretClass = cn(caretClass, "rotate-180");
	}

	return (
		<Button
			data-slot="collapsible-trigger"
			type="button"
			variant="ghost"
			size="sm"
			id={triggerId}
			aria-expanded={open}
			aria-controls={panelId}
			disabled={resolvedDisabled}
			className={cn(
				"h-auto w-full items-center justify-between gap-2 px-0 py-0",
				className,
			)}
			onClick={(event) => {
				if (onClick !== undefined) {
					onClick(event);
				}
				if (event.defaultPrevented) {
					return;
				}
				if (resolvedDisabled) {
					return;
				}

				setOpen(!open);
			}}
			{...rest}
		>
			<span className="min-w-0 flex-1 text-left">{children}</span>
			<ChevronDown
				data-slot="collapsible-caret"
				className={caretClass}
				aria-hidden="true"
			/>
		</Button>
	);
}

interface CollapsibleContentProps extends ComponentProps<"div"> {
	children: ReactNode;
}

/**
 * Region shown when the parent `Collapsible` is open. Removed from the DOM
 * when closed.
 */
function CollapsibleContent({
	children,
	className,
	...rest
}: CollapsibleContentProps) {
	const { open, triggerId, panelId } = useCollapsibleContext();

	if (!open) {
		return null;
	}

	return (
		<div
			data-slot="collapsible-content"
			id={panelId}
			aria-labelledby={triggerId}
			className={cn(className)}
			{...rest}
		>
			{children}
		</div>
	);
}

export type {
	CollapsibleProps,
	CollapsibleTriggerProps,
	CollapsibleContentProps,
};
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
