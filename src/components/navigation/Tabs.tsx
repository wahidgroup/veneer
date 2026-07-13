import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { createContext, useContext, useId, useState } from "react";

import { cn } from "../../utils/cn.js";

interface TabsContextValue {
	value: string;
	setValue: (value: string) => void;
	baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
	const ctx = useContext(TabsContext);
	if (ctx === null) {
		throw new Error("Tabs components must be used within Tabs");
	}

	return ctx;
}

interface TabsProps extends Omit<ComponentProps<"div">, "onChange"> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children: ReactNode;
}

/**
 * Tabbed interface root. Compose `TabsList` / `TabsTrigger` / `TabsPanel`.
 */
function Tabs({
	value,
	defaultValue,
	onValueChange,
	children,
	className,
	...rest
}: TabsProps) {
	const baseId = useId();
	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}
		return "";
	});

	let current = uncontrolled;
	if (isControlled) {
		current = value;
	}

	const setValue = (next: string) => {
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onValueChange !== undefined) {
			onValueChange(next);
		}
	};

	return (
		<TabsContext.Provider
			value={{
				value: current,
				setValue,
				baseId,
			}}
		>
			<div data-slot="tabs" className={cn("w-full", className)} {...rest}>
				{children}
			</div>
		</TabsContext.Provider>
	);
}

interface TabsListProps extends ComponentProps<"div"> {
	children: ReactNode;
}

/**
 * Horizontal tab strip (`role="tablist"`). Underline active indicator.
 */
function TabsList({ children, className, ...rest }: TabsListProps) {
	return (
		<div
			data-slot="tabs-list"
			role="tablist"
			className={cn(
				"flex flex-wrap items-end gap-6 border-b border-border",
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
}

interface TabsTriggerProps extends ComponentProps<"button"> {
	value: string;
	children: ReactNode;
}

/**
 * Individual tab control. Activates matching `TabsPanel`.
 */
function TabsTrigger({
	value,
	children,
	className,
	disabled,
	onKeyDown,
	...rest
}: TabsTriggerProps) {
	const { value: active, setValue, baseId } = useTabsContext();
	const selected = active === value;
	const triggerId = `${baseId}-tab-${value}`;
	const panelId = `${baseId}-panel-${value}`;

	let tabIndex = -1;
	if (selected) {
		tabIndex = 0;
	}

	let tabClass =
		"relative -mb-px cursor-pointer border-b-2 px-1 pb-3 text-sm font-medium transition-colors";
	if (selected) {
		tabClass = cn(tabClass, "border-primary text-foreground");
	} else {
		tabClass = cn(
			tabClass,
			"border-transparent text-muted-foreground hover:border-border hover:text-foreground",
		);
	}
	if (disabled === true) {
		tabClass = cn(
			tabClass,
			"cursor-not-allowed opacity-50 hover:border-transparent hover:text-muted-foreground",
		);
	}

	tabClass = cn(tabClass, className);

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (onKeyDown !== undefined) {
			onKeyDown(event);
		}
		if (event.defaultPrevented) {
			return;
		}

		const list = event.currentTarget.closest('[role="tablist"]');
		if (list === null) {
			return;
		}

		const tabs = Array.from(
			list.querySelectorAll<HTMLButtonElement>(
				'[role="tab"]:not([disabled])',
			),
		);
		if (tabs.length === 0) {
			return;
		}

		const index = tabs.findIndex((tab) => {
			return tab === event.currentTarget;
		});
		if (index < 0) {
			return;
		}

		let nextIndex = index;
		if (event.key === "ArrowRight") {
			event.preventDefault();
			nextIndex = (index + 1) % tabs.length;
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			nextIndex = (index - 1 + tabs.length) % tabs.length;
		} else if (event.key === "Home") {
			event.preventDefault();
			nextIndex = 0;
		} else if (event.key === "End") {
			event.preventDefault();
			nextIndex = tabs.length - 1;
		} else {
			return;
		}

		const nextTab = tabs[nextIndex];
		if (nextTab !== undefined) {
			nextTab.focus();
			nextTab.click();
		}
	}

	return (
		<button
			data-slot="tabs-trigger"
			type="button"
			role="tab"
			id={triggerId}
			aria-selected={selected}
			aria-controls={panelId}
			tabIndex={tabIndex}
			disabled={disabled}
			className={tabClass}
			onClick={() => {
				if (disabled === true) {
					return;
				}
				setValue(value);
			}}
			onKeyDown={handleKeyDown}
			{...rest}
		>
			{children}
		</button>
	);
}

interface TabsPanelProps extends ComponentProps<"div"> {
	value: string;
	children: ReactNode;
}

/**
 * Panel shown when its `value` matches the active tab.
 */
function TabsPanel({ value, children, className, ...rest }: TabsPanelProps) {
	const { value: active, baseId } = useTabsContext();
	const selected = active === value;
	const triggerId = `${baseId}-tab-${value}`;
	const panelId = `${baseId}-panel-${value}`;

	if (!selected) {
		return null;
	}

	return (
		<div
			data-slot="tabs-panel"
			role="tabpanel"
			id={panelId}
			aria-labelledby={triggerId}
			tabIndex={0}
			className={cn("outline-none", className)}
			{...rest}
		>
			{children}
		</div>
	);
}

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsPanelProps };
export { Tabs, TabsList, TabsTrigger, TabsPanel };
