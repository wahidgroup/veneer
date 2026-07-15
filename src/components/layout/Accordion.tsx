import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useId, useState } from "react";

import { cn } from "../../utils/cn.js";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./Collapsible.js";

type AccordionType = "single" | "multiple";
type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

interface AccordionContextValue {
	type: AccordionType;
	collapsible: boolean;
	headingLevel: AccordionHeadingLevel;
	baseId: string;
	isOpen: (itemValue: string) => boolean;
	toggleItem: (itemValue: string, open: boolean) => void;
}

interface AccordionItemContextValue {
	value: string;
	triggerId: string;
	panelId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
	null,
);

function useAccordionContext(): AccordionContextValue {
	const ctx = useContext(AccordionContext);
	if (ctx === null) {
		throw new Error("Accordion components must be used within Accordion");
	}

	return ctx;
}

function useAccordionItemContext(): AccordionItemContextValue {
	const ctx = useContext(AccordionItemContext);
	if (ctx === null) {
		throw new Error(
			"Accordion item components must be used within AccordionItem",
		);
	}

	return ctx;
}

function AccordionHeading({
	level,
	className,
	children,
}: {
	level: AccordionHeadingLevel;
	className?: string;
	children: ReactNode;
}) {
	if (level === 2) {
		return <h2 className={className}>{children}</h2>;
	}
	if (level === 4) {
		return <h4 className={className}>{children}</h4>;
	}
	if (level === 5) {
		return <h5 className={className}>{children}</h5>;
	}
	if (level === 6) {
		return <h6 className={className}>{children}</h6>;
	}

	return <h3 className={className}>{children}</h3>;
}

interface AccordionProps extends Omit<ComponentProps<"div">, "onChange"> {
	type?: AccordionType;
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	collapsible?: boolean;
	headingLevel?: AccordionHeadingLevel;
	children: ReactNode;
}

/**
 * Accordion root (APG accordion pattern). Compose `AccordionItem`,
 * `AccordionTrigger`, and `AccordionContent`. Defaults to single-open mode.
 */
function Accordion({
	type,
	value,
	defaultValue,
	onValueChange,
	collapsible,
	headingLevel,
	children,
	className,
	...rest
}: AccordionProps) {
	const baseId = useId();
	const isControlled = value !== undefined;

	let resolvedType: AccordionType = "single";
	if (type === "multiple") {
		resolvedType = "multiple";
	}

	let resolvedCollapsible = false;
	if (collapsible === true) {
		resolvedCollapsible = true;
	}

	let resolvedHeadingLevel: AccordionHeadingLevel = 3;
	if (headingLevel !== undefined) {
		resolvedHeadingLevel = headingLevel;
	}

	const [uncontrolled, setUncontrolled] = useState<string | string[]>(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}
		if (resolvedType === "multiple") {
			return [];
		}

		return "";
	});

	let current = uncontrolled;
	if (isControlled) {
		current = value;
	}

	const setValue = (next: string | string[]) => {
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onValueChange !== undefined) {
			onValueChange(next);
		}
	};

	const isOpen = (itemValue: string): boolean => {
		if (resolvedType === "multiple") {
			let values: string[] = [];
			if (Array.isArray(current)) {
				values = current;
			}

			return values.includes(itemValue);
		}

		let active = "";
		if (typeof current === "string") {
			active = current;
		}

		return active === itemValue;
	};

	const toggleItem = (itemValue: string, open: boolean) => {
		if (resolvedType === "single") {
			if (open) {
				setValue(itemValue);
				return;
			}
			if (resolvedCollapsible) {
				setValue("");
			}

			return;
		}

		let values: string[] = [];
		if (Array.isArray(current)) {
			values = current;
		}

		if (open) {
			if (!values.includes(itemValue)) {
				setValue([...values, itemValue]);
			}
			return;
		}

		setValue(
			values.filter((entry) => {
				return entry !== itemValue;
			}),
		);
	};

	return (
		<AccordionContext.Provider
			value={{
				type: resolvedType,
				collapsible: resolvedCollapsible,
				headingLevel: resolvedHeadingLevel,
				baseId,
				isOpen,
				toggleItem,
			}}
		>
			<div
				data-slot="accordion"
				className={cn(
					"divide-y divide-border rounded-md border border-border",
					className,
				)}
				{...rest}
			>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}

interface AccordionItemProps extends ComponentProps<"div"> {
	value: string;
	children: ReactNode;
}

/**
 * One accordion section keyed by `value`. Wires open state to the parent
 * `Accordion`.
 */
function AccordionItem({
	value,
	children,
	className,
	...rest
}: AccordionItemProps) {
	const accordion = useAccordionContext();
	const triggerId = `${accordion.baseId}-trigger-${value}`;
	const panelId = `${accordion.baseId}-panel-${value}`;

	return (
		<AccordionItemContext.Provider
			value={{
				value,
				triggerId,
				panelId,
			}}
		>
			<div data-slot="accordion-item" className={cn(className)} {...rest}>
				<Collapsible
					open={accordion.isOpen(value)}
					onOpenChange={(next) => {
						accordion.toggleItem(value, next);
					}}
					triggerId={triggerId}
					panelId={panelId}
				>
					{children}
				</Collapsible>
			</div>
		</AccordionItemContext.Provider>
	);
}

interface AccordionTriggerProps extends ComponentProps<"button"> {
	children: ReactNode;
}

/**
 * Accordion header control. Renders a heading element wrapping the disclosure
 * button (`aria-expanded`, `aria-controls`). Caret comes from CollapsibleTrigger.
 */
function AccordionTrigger({
	children,
	className,
	...rest
}: AccordionTriggerProps) {
	const { headingLevel } = useAccordionContext();
	useAccordionItemContext();

	return (
		<AccordionHeading
			level={headingLevel}
			className="m-0 text-sm font-medium"
		>
			<CollapsibleTrigger
				data-slot="accordion-trigger"
				className={cn(
					"flex w-full items-center justify-between gap-2 px-4 py-3 text-left",
					className,
				)}
				{...rest}
			>
				{children}
			</CollapsibleTrigger>
		</AccordionHeading>
	);
}

interface AccordionContentProps extends ComponentProps<"div"> {
	children: ReactNode;
}

/**
 * Accordion panel (`role="region"`, `aria-labelledby`). Shown when its item
 * is expanded.
 */
function AccordionContent({
	children,
	className,
	...rest
}: AccordionContentProps) {
	useAccordionItemContext();

	return (
		<CollapsibleContent
			data-slot="accordion-content"
			role="region"
			className={cn("px-4 pb-4 text-sm text-muted-foreground", className)}
			{...rest}
		>
			{children}
		</CollapsibleContent>
	);
}

export type {
	AccordionProps,
	AccordionItemProps,
	AccordionTriggerProps,
	AccordionContentProps,
	AccordionType,
	AccordionHeadingLevel,
};
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
