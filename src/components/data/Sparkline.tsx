import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "../../utils/cn.js";

const sparklineStrokeVariants = cva("fill-none stroke-2", {
	variants: {
		tone: {
			default: "stroke-primary",
			success: "stroke-success",
			danger: "stroke-destructive",
		},
	},
	defaultVariants: {
		tone: "default",
	},
});

type SparklineTone = NonNullable<VariantProps<typeof sparklineStrokeVariants>["tone"]>;

interface SparklineProps extends Omit<ComponentProps<"svg">, "children" | "values"> {
	values: number[];
	width?: number;
	height?: number;
	tone?: SparklineTone;
}

interface SparklineSummary {
	last: number;
	min: number;
	max: number;
}

function summarizeValues(values: number[]): SparklineSummary | undefined {
	if (values.length === 0) {
		return undefined;
	}

	const first = values[0];
	if (first === undefined) {
		return undefined;
	}

	let min = first;
	let max = first;
	for (const value of values) {
		if (value < min) {
			min = value;
		}
		if (value > max) {
			max = value;
		}
	}

	const last = values[values.length - 1];
	if (last === undefined) {
		return undefined;
	}

	return { last, min, max };
}

function buildSparklineLabel(summary: SparklineSummary): string {
	return `Sparkline chart: last value ${String(summary.last)}, minimum ${String(summary.min)}, maximum ${String(summary.max)}`;
}

function buildPolylinePoints(values: number[], width: number, height: number): string {
	if (values.length === 0) {
		return "";
	}

	const summary = summarizeValues(values);
	if (summary === undefined) {
		return "";
	}

	const padding = 2;
	const innerWidth = width - padding * 2;
	const innerHeight = height - padding * 2;
	const range = summary.max - summary.min;

	const points: string[] = [];
	for (let index = 0; index < values.length; index += 1) {
		const value = values[index];
		if (value === undefined) {
			continue;
		}

		let x = padding + innerWidth / 2;
		if (values.length > 1) {
			x = padding + (index / (values.length - 1)) * innerWidth;
		}

		let y = padding + innerHeight / 2;
		if (range > 0) {
			const normalized = (value - summary.min) / range;
			y = padding + innerHeight - normalized * innerHeight;
		}

		points.push(`${String(x)},${String(y)}`);
	}

	return points.join(" ");
}

/**
 * Compact SVG sparkline for trend snippets in activity and ledger surfaces.
 * Accessible summary via `role="img"` and an `aria-label` derived from
 * last/min/max values. Empty `values` renders a labeled empty chart.
 */
function Sparkline({ values, width, height, tone, className, ...rest }: SparklineProps) {
	let resolvedWidth = width;
	resolvedWidth ??= 120;

	let resolvedHeight = height;
	resolvedHeight ??= 32;

	let resolvedTone: SparklineTone = "default";
	if (tone === "success") {
		resolvedTone = "success";
	} else if (tone === "danger") {
		resolvedTone = "danger";
	}

	const summary = summarizeValues(values);
	let ariaLabel = "No data";
	if (summary !== undefined) {
		ariaLabel = buildSparklineLabel(summary);
	}

	const points = buildPolylinePoints(values, resolvedWidth, resolvedHeight);
	let polylineNode = null;
	if (points.length > 0) {
		polylineNode = <polyline points={points} className={sparklineStrokeVariants({ tone: resolvedTone })} />;
	}

	return (
		<svg
			data-slot="sparkline"
			data-tone={resolvedTone}
			role="img"
			aria-label={ariaLabel}
			width={resolvedWidth}
			height={resolvedHeight}
			viewBox={`0 0 ${String(resolvedWidth)} ${String(resolvedHeight)}`}
			className={cn("block shrink-0", className)}
			{...rest}
		>
			{polylineNode}
		</svg>
	);
}

export type { SparklineProps, SparklineTone };
export { Sparkline, sparklineStrokeVariants };
