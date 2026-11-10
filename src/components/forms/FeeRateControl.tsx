import type { ComponentProps } from "react";
import { useState } from "react";

import { cn } from "../../utils/cn.js";
import { SegmentedControl } from "../navigation/SegmentedControl.js";
import { NumberInput } from "./NumberInput.js";
import { Slider } from "./Slider.js";

interface FeeRatePreset {
	id: string;
	label: string;
	rate: number;
}

interface FeeRateControlProps extends Omit<ComponentProps<"div">, "onChange"> {
	value?: number;
	defaultValue?: number;
	onValueChange?: (rate: number) => void;
	min?: number;
	max?: number;
	step?: number;
	presets?: FeeRatePreset[];
	numberInputId?: string;
}

const DEFAULT_PRESETS: FeeRatePreset[] = [
	{ id: "economy", label: "Economy", rate: 1 },
	{ id: "normal", label: "Normal", rate: 10 },
	{ id: "priority", label: "Priority", rate: 50 },
];

function clampRate(rate: number, min: number, max: number): number {
	if (rate < min) {
		return min;
	}
	if (rate > max) {
		return max;
	}

	return rate;
}

function findPresetIdForRate(presets: FeeRatePreset[], rate: number): string | undefined {
	for (const preset of presets) {
		if (preset.rate === rate) {
			return preset.id;
		}
	}

	return undefined;
}

/**
 * Fee rate picker for Bitcoin transactions (sat/vB). Combines preset
 * segments, a range slider, and numeric entry. Controlled via `value` /
 * `onValueChange`; uncontrolled via `defaultValue`.
 */
function FeeRateControl({
	value,
	defaultValue,
	onValueChange,
	min,
	max,
	step,
	presets: presetsProp,
	numberInputId,
	className,
	"aria-label": ariaLabel,
	...rest
}: FeeRateControlProps) {
	let resolvedMin = 1;
	if (min !== undefined) {
		resolvedMin = min;
	}

	let resolvedMax = 200;
	if (max !== undefined) {
		resolvedMax = max;
	}

	let resolvedStep = 1;
	if (step !== undefined) {
		resolvedStep = step;
	}

	let resolvedPresets = DEFAULT_PRESETS;
	if (presetsProp !== undefined) {
		resolvedPresets = presetsProp;
	}

	const isControlled = value !== undefined;

	let initialRate = resolvedMin;
	if (defaultValue !== undefined) {
		initialRate = clampRate(defaultValue, resolvedMin, resolvedMax);
	} else {
		const firstPreset = resolvedPresets[0];
		if (firstPreset !== undefined) {
			initialRate = clampRate(firstPreset.rate, resolvedMin, resolvedMax);
		}
	}

	const [uncontrolled, setUncontrolled] = useState(initialRate);

	let currentRate = uncontrolled;
	if (value !== undefined) {
		currentRate = clampRate(value, resolvedMin, resolvedMax);
	}

	function setRate(next: number) {
		const clamped = clampRate(next, resolvedMin, resolvedMax);
		if (!isControlled) {
			setUncontrolled(clamped);
		}
		if (onValueChange !== undefined) {
			onValueChange(clamped);
		}
	}

	const activePresetId = findPresetIdForRate(resolvedPresets, currentRate);

	let presetValue = "";
	if (activePresetId !== undefined) {
		presetValue = activePresetId;
	}

	const segmentOptions = resolvedPresets.map((preset) => {
		return {
			value: preset.id,
			label: preset.label,
		};
	});

	let sliderLabel = ariaLabel;
	if (sliderLabel === undefined || sliderLabel.length === 0) {
		sliderLabel = "Fee rate";
	}

	return (
		<div data-slot="fee-rate-control" className={cn("flex w-full flex-col gap-3", className)} {...rest}>
			<SegmentedControl
				aria-label={`${sliderLabel} presets`}
				options={segmentOptions}
				value={presetValue}
				onValueChange={(presetId) => {
					const preset = resolvedPresets.find((item) => {
						return item.id === presetId;
					});
					if (preset === undefined) {
						return;
					}

					setRate(preset.rate);
				}}
			/>
			<div className="flex w-full items-center gap-3">
				<Slider
					aria-label={sliderLabel}
					className="min-w-0 flex-1"
					min={resolvedMin}
					max={resolvedMax}
					step={resolvedStep}
					value={currentRate}
					showValue={false}
					onValueChange={setRate}
				/>
				<NumberInput
					id={numberInputId}
					aria-label={`${sliderLabel} (sat/vB)`}
					className="w-24 shrink-0"
					min={resolvedMin}
					max={resolvedMax}
					step={resolvedStep}
					value={currentRate}
					onValueChange={(next) => {
						if (next === undefined) {
							return;
						}

						setRate(next);
					}}
				/>
			</div>
		</div>
	);
}

export type { FeeRateControlProps, FeeRatePreset };
export { FeeRateControl, DEFAULT_PRESETS };
