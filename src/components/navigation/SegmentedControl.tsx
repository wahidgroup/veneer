import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { useId, useState } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";

interface SegmentedControlOption {
	value: string;
	label: ReactNode;
	disabled?: boolean;
	icon?: ReactNode;
}

const segmentedControlVariants = cva(
	"inline-flex items-center rounded-md border border-border bg-[var(--segment-track-bg,var(--muted))] p-0.5",
	{
		variants: {
			size: {
				sm: "gap-0.5",
				md: "gap-0.5",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

type SegmentedControlSize = NonNullable<
	VariantProps<typeof segmentedControlVariants>["size"]
>;

interface SegmentedControlProps
	extends
		Omit<ComponentProps<"div">, "onChange" | "role">,
		VariantProps<typeof segmentedControlVariants> {
	options: SegmentedControlOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
}

/**
 * Exclusive single-select strip (`role="radiogroup"`). Prefer over ChipGroup
 * (multi) and Tabs (panels). Skin via `--segment-*` CSS vars on the root.
 */
function SegmentedControl({
	options,
	value,
	defaultValue,
	onValueChange,
	disabled,
	size,
	className,
	...rest
}: SegmentedControlProps) {
	const baseId = useId();
	const isControlled = value !== undefined;
	const [uncontrolled, setUncontrolled] = useState(() => {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		const first = options[0];
		if (first !== undefined) {
			return first.value;
		}

		return "";
	});

	let current = uncontrolled;
	if (isControlled) {
		current = value;
	}

	let resolvedSize: SegmentedControlSize = "md";
	if (size === "sm") {
		resolvedSize = "sm";
	}

	let groupDisabled = disabled;
	groupDisabled ??= false;

	function setValue(next: string) {
		if (!isControlled) {
			setUncontrolled(next);
		}
		if (onValueChange !== undefined) {
			onValueChange(next);
		}
	}

	function enabledOptions(): SegmentedControlOption[] {
		return options.filter((option) => {
			if (groupDisabled) {
				return false;
			}
			if (option.disabled === true) {
				return false;
			}

			return true;
		});
	}

	function onRadioKeyDown(
		event: KeyboardEvent<HTMLButtonElement>,
		optionValue: string,
	) {
		const enabled = enabledOptions();
		if (enabled.length === 0) {
			return;
		}

		const index = enabled.findIndex((option) => {
			return option.value === optionValue;
		});
		if (index < 0) {
			return;
		}

		let nextIndex: number;
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			event.preventDefault();
			nextIndex = (index + 1) % enabled.length;
		} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			event.preventDefault();
			nextIndex = (index - 1 + enabled.length) % enabled.length;
		} else if (event.key === "Home") {
			event.preventDefault();
			nextIndex = 0;
		} else if (event.key === "End") {
			event.preventDefault();
			nextIndex = enabled.length - 1;
		} else {
			return;
		}

		const next = enabled[nextIndex];
		if (next === undefined) {
			return;
		}

		setValue(next.value);

		const group = event.currentTarget.closest('[role="radiogroup"]');
		if (group === null) {
			return;
		}

		const nextButton = group.querySelector<HTMLButtonElement>(
			`[data-segment-value="${CSS.escape(next.value)}"]`,
		);
		if (nextButton !== null) {
			nextButton.focus();
		}
	}

	let buttonSize: "sm" | "md" = "md";
	if (resolvedSize === "sm") {
		buttonSize = "sm";
	}

	return (
		<div
			data-slot="segmented-control"
			role="radiogroup"
			className={cn(
				segmentedControlVariants({ size: resolvedSize }),
				className,
			)}
			{...rest}
		>
			{options.map((option) => {
				const selected = current === option.value;
				let optionDisabled = groupDisabled;
				if (option.disabled === true) {
					optionDisabled = true;
				}

				let tabIndex = -1;
				if (selected && !optionDisabled) {
					tabIndex = 0;
				} else if (!selected && current === "" && !optionDisabled) {
					const firstOption = options[0];
					if (firstOption?.value === option.value) {
						tabIndex = 0;
					}
				}

				let segmentClass =
					"rounded-[calc(var(--radius-md)-2px)] shadow-none hover:bg-[var(--segment-hover-bg,color-mix(in_srgb,var(--segment-active-bg,var(--primary))_18%,transparent))] active:bg-[var(--segment-hover-bg,color-mix(in_srgb,var(--segment-active-bg,var(--primary))_24%,transparent))]";
				if (selected) {
					segmentClass = cn(
						segmentClass,
						"bg-[var(--segment-active-bg,var(--background))] font-medium text-[var(--segment-active-fg,var(--foreground))] shadow-sm ring-1 ring-[var(--segment-active-ring,var(--border))] hover:text-[var(--segment-active-fg,var(--foreground))] hover:bg-[var(--segment-hover-bg,color-mix(in_srgb,var(--segment-active-bg,var(--primary))_12%,var(--segment-active-bg,var(--background))))] active:bg-[var(--segment-hover-bg,color-mix(in_srgb,var(--segment-active-bg,var(--primary))_18%,var(--segment-active-bg,var(--background))))]",
					);
				} else {
					segmentClass = cn(
						segmentClass,
						"bg-transparent font-normal text-[var(--segment-inactive-fg,var(--muted-foreground))] hover:text-[var(--segment-active-fg,var(--foreground))]",
					);
				}

				return (
					<Button
						key={option.value}
						type="button"
						variant="ghost"
						size={buttonSize}
						role="radio"
						id={`${baseId}-${option.value}`}
						data-slot="segmented-control-option"
						data-segment-value={option.value}
						aria-checked={selected}
						tabIndex={tabIndex}
						disabled={optionDisabled}
						className={segmentClass}
						onClick={() => {
							if (optionDisabled) {
								return;
							}
							setValue(option.value);
						}}
						onKeyDown={(event) => {
							onRadioKeyDown(event, option.value);
						}}
					>
						{option.icon}
						{option.label}
					</Button>
				);
			})}
		</div>
	);
}

export type {
	SegmentedControlOption,
	SegmentedControlProps,
	SegmentedControlSize,
};
export { SegmentedControl, segmentedControlVariants };
