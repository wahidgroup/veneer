import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { Check } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface StepperStep {
	id: string;
	label: string;
	description?: string;
}

type StepperStepState = "complete" | "current" | "upcoming";

interface StepperContextValue {
	steps: StepperStep[];
	currentId: string;
	currentIndex: number;
	setValue: (next: string) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(): StepperContextValue {
	const ctx = useContext(StepperContext);
	if (ctx === null) {
		throw new Error("StepperActions must be used within Stepper");
	}

	return ctx;
}

interface StepperProps extends Omit<ComponentProps<"nav">, "onChange"> {
	steps: StepperStep[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children?: ReactNode;
}

function resolveStepState(index: number, currentIndex: number): StepperStepState {
	if (index < currentIndex) {
		return "complete";
	}
	if (index === currentIndex) {
		return "current";
	}

	return "upcoming";
}

/**
 * Form-wizard step indicator for checkout/KYC flows.
 */
function Stepper({ steps, value, defaultValue, onValueChange, children, className, ...rest }: StepperProps) {
	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		const first = steps[0];
		if (first !== undefined) {
			return first.id;
		}

		return "";
	});

	let currentId = uncontrolled;
	if (isControlled) {
		currentId = value;
	}

	let currentIndex = steps.findIndex((step) => {
		return step.id === currentId;
	});
	if (currentIndex < 0) {
		currentIndex = 0;
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
		<StepperContext.Provider value={{ steps, currentId, currentIndex, setValue }}>
			<nav data-slot="stepper" aria-label="Progress" className={cn("flex flex-col gap-4", className)} {...rest}>
				<ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
					{steps.map((step, index) => {
						const state = resolveStepState(index, currentIndex);
						const stepNumber = index + 1;

						let markerClass =
							"flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium";
						let labelClass = "text-sm font-medium";
						const descriptionClass = "text-sm text-muted-foreground";

						if (state === "complete") {
							markerClass = cn(markerClass, "border-primary bg-primary text-primary-foreground");
							labelClass = cn(labelClass, "text-foreground");
						} else if (state === "current") {
							markerClass = cn(markerClass, "border-primary bg-card text-primary");
							labelClass = cn(labelClass, "text-foreground");
						} else {
							markerClass = cn(markerClass, "border-border bg-muted text-muted-foreground");
							labelClass = cn(labelClass, "text-muted-foreground");
						}

						let ariaCurrent: "step" | undefined;
						if (state === "current") {
							ariaCurrent = "step";
						}

						let markerContent: ReactNode = stepNumber;
						if (state === "complete") {
							markerContent = <Check className="size-4" aria-hidden="true" />;
						}

						let descriptionNode: ReactNode = null;
						if (step.description !== undefined) {
							descriptionNode = <p className={descriptionClass}>{step.description}</p>;
						}

						return (
							<li
								key={step.id}
								data-slot="stepper-step"
								data-state={state}
								aria-current={ariaCurrent}
								className="flex min-w-0 flex-1 gap-3"
							>
								<span className={markerClass} aria-hidden="true">
									{markerContent}
								</span>
								<div className="min-w-0 space-y-1">
									<p className={labelClass}>{step.label}</p>
									{descriptionNode}
								</div>
							</li>
						);
					})}
				</ol>
				{children}
			</nav>
		</StepperContext.Provider>
	);
}

interface StepperActionsProps extends Omit<ComponentProps<"div">, "children"> {
	onNext?: () => void;
	onBack?: () => void;
	nextLabel?: string;
	backLabel?: string;
}

/**
 * Optional Back/Next chrome for a parent Stepper. Disables Back on the first
 * step; parent handles advance logic via `onNext` / `onBack`.
 */
function StepperActions({ onNext, onBack, nextLabel, backLabel, className, ...rest }: StepperActionsProps) {
	const { steps, currentIndex } = useStepperContext();

	let resolvedNextLabel = nextLabel;
	resolvedNextLabel ??= "Next";

	let resolvedBackLabel = backLabel;
	resolvedBackLabel ??= "Back";

	const onFirst = currentIndex <= 0;
	const onLast = currentIndex >= steps.length - 1;

	let backNode: ReactNode = null;
	if (onBack !== undefined) {
		backNode = (
			<Button type="button" variant="outlined" disabled={onFirst} onClick={onBack}>
				{resolvedBackLabel}
			</Button>
		);
	}

	let nextNode: ReactNode = null;
	if (onNext !== undefined) {
		let finishLabel = resolvedNextLabel;
		if (onLast) {
			finishLabel = "Finish";
		}

		nextNode = (
			<Button type="button" onClick={onNext}>
				{finishLabel}
			</Button>
		);
	}

	return (
		<div data-slot="stepper-actions" className={cn("flex items-center justify-between gap-3", className)} {...rest}>
			{backNode}
			{nextNode}
		</div>
	);
}

export type { StepperProps, StepperStep, StepperStepState, StepperActionsProps };
export { Stepper, StepperActions };
