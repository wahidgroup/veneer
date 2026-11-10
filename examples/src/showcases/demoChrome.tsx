import type { ReactNode } from "react";

import { Alert, Badge, FieldHint, cn } from "@wahidgroup/veneer";

interface RailPanelProps {
	title: string;
	description: string;
	children?: ReactNode;
	className?: string;
}

/**
 * Right-rail chrome for demo knobs / descriptions.
 */
function RailPanel({ title, description, children, className }: RailPanelProps) {
	return (
		<div className={cn("flex flex-col gap-4 p-4", className)}>
			<header className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold text-foreground">{title} Knobs</h2>
				<hr className="border-0 border-t border-border" />
				<Alert type="info">{description}</Alert>
			</header>
			{children}
		</div>
	);
}

interface DemoRowProps {
	label: string;
	description?: string;
	children: ReactNode;
}

/**
 * Labeled control cluster for canvas or rail knobs.
 * Optional `description` renders as hint text under the control (FormField style).
 */
function DemoRow({ label, description, children }: DemoRowProps) {
	let hint: ReactNode = null;
	if (description !== undefined && description.length > 0) {
		hint = <FieldHint>{description}</FieldHint>;
	}

	return (
		<div className="flex flex-col gap-1">
			<div className="text-sm font-medium text-foreground">{label}</div>
			<div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
			{hint}
		</div>
	);
}

interface CanvasProps {
	children: ReactNode;
	className?: string;
}

/**
 * Main canvas padding for the active component demo.
 */
function Canvas({ children, className }: CanvasProps) {
	return <div className={cn("flex flex-col gap-6 p-6", className)}>{children}</div>;
}

/**
 * Marks Nest/API-backed example sections.
 */
function ApiDemoBadge() {
	return (
		<Badge variant="info" size="sm" aria-hidden="true">
			API
		</Badge>
	);
}

interface DemoSectionHeaderProps {
	title: string;
	description: string;
	apiDriven?: boolean;
}

/**
 * Stacked-category section title with optional API badge.
 */
function DemoSectionHeader({ title, description, apiDriven }: DemoSectionHeaderProps) {
	let badge: ReactNode = null;
	if (apiDriven === true) {
		badge = <ApiDemoBadge />;
	}

	return (
		<div className="px-6 pt-6">
			<div className="flex flex-wrap items-center gap-1.5">
				<h3 className="text-lg font-semibold text-foreground">{title}</h3>
				{badge}
			</div>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

function PassthroughProvider({ children }: { children: ReactNode }) {
	return children;
}

export { ApiDemoBadge, Canvas, DemoRow, DemoSectionHeader, PassthroughProvider, RailPanel };
