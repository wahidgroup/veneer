import type { ComponentProps, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useId, useRef, useState } from "react";

import type { HsvColor } from "./colorMath.js";
import { cn } from "../../utils/cn.js";
import { SegmentedControl } from "../navigation/SegmentedControl.js";
import { hexToHsv, hsvToHex, hsvToRgb, normalizeHex, rgbToHex } from "./colorMath.js";
import { CopyButton } from "./CopyButton.js";
import { Input } from "./Input.js";
import { NumberInput } from "./NumberInput.js";

type ColorPickerMode = "hex" | "rgb";

interface ColorPickerProps extends Omit<ComponentProps<"div">, "onChange" | "defaultValue"> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (hex: string) => void;
	swatches?: string[];
	label?: string;
}

const DEFAULT_HEX = "#3b82f6";
const HUE_GRADIENT = "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";

function resolveInitialHsv(hex: string | undefined): HsvColor {
	if (hex !== undefined) {
		const parsed = hexToHsv(hex);
		if (parsed !== null) {
			return parsed;
		}
	}

	const fallback = hexToHsv(DEFAULT_HEX);
	if (fallback !== null) {
		return fallback;
	}

	return { h: 217, s: 0.91, v: 0.95 };
}

function clampUnit(value: number): number {
	if (value < 0) {
		return 0;
	}
	if (value > 1) {
		return 1;
	}

	return value;
}

function clampHue(value: number): number {
	if (value < 0) {
		return 0;
	}
	if (value > 360) {
		return 360;
	}

	return value;
}

function formatRgbCss({ r, g, b }: { r: number; g: number; b: number }): string {
	return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

/**
 * Zero-dependency HSV color picker: S×V plane, hue strip, HEX/RGB fields,
 * optional swatches, and CopyButton for the active format string.
 */
function ColorPicker({ value, defaultValue, onValueChange, swatches, label, className, ...rest }: ColorPickerProps) {
	const baseId = useId();
	const isControlled = value !== undefined;
	const [uncontrolledHsv, setUncontrolledHsv] = useState(() => {
		return resolveInitialHsv(defaultValue);
	});
	const [mode, setMode] = useState<ColorPickerMode>("hex");
	const [hexDraft, setHexDraft] = useState(() => {
		return hsvToHex(resolveInitialHsv(defaultValue));
	});

	const svRef = useRef<HTMLDivElement>(null);
	const hueRef = useRef<HTMLDivElement>(null);

	let hsv = uncontrolledHsv;
	if (isControlled) {
		const fromValue = hexToHsv(value);
		if (fromValue !== null) {
			hsv = fromValue;
		}
	}

	const hex = hsvToHex(hsv);
	const rgb = hsvToRgb(hsv);
	const rgbCss = formatRgbCss(rgb);
	const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

	let copyValue = hex;
	let copyAria = `Copy ${hex}`;
	if (mode === "rgb") {
		copyValue = rgbCss;
		copyAria = `Copy ${rgbCss}`;
	}

	const setHsv = (next: HsvColor) => {
		const normalized: HsvColor = {
			h: clampHue(next.h),
			s: clampUnit(next.s),
			v: clampUnit(next.v),
		};
		if (!isControlled) {
			setUncontrolledHsv(normalized);
		}

		const nextHex = hsvToHex(normalized);
		setHexDraft(nextHex);

		if (onValueChange !== undefined) {
			onValueChange(nextHex);
		}
	};

	const commitHex = (raw: string) => {
		const normalized = normalizeHex(raw);
		if (normalized === null) {
			setHexDraft(hex);
			return;
		}

		const next = hexToHsv(normalized);
		if (next === null) {
			setHexDraft(hex);
			return;
		}

		setHsv(next);
	};

	const updateSvFromClient = (clientX: number, clientY: number) => {
		const node = svRef.current;
		if (node === null) {
			return;
		}

		const rect = node.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) {
			return;
		}

		const s = clampUnit((clientX - rect.left) / rect.width);
		const v = clampUnit(1 - (clientY - rect.top) / rect.height);
		setHsv({ h: hsv.h, s, v });
	};

	const updateHueFromClient = (clientX: number) => {
		const node = hueRef.current;
		if (node === null) {
			return;
		}

		const rect = node.getBoundingClientRect();
		if (rect.width <= 0) {
			return;
		}

		const h = clampHue(((clientX - rect.left) / rect.width) * 360);
		setHsv({ h, s: hsv.s, v: hsv.v });
	};

	const onSvKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		let nextS = hsv.s;
		let nextV = hsv.v;
		const step = 0.01;
		if (event.key === "ArrowRight") {
			event.preventDefault();
			nextS = clampUnit(hsv.s + step);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			nextS = clampUnit(hsv.s - step);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			nextV = clampUnit(hsv.v + step);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			nextV = clampUnit(hsv.v - step);
		} else if (event.key === "Home") {
			event.preventDefault();
			nextS = 0;
		} else if (event.key === "End") {
			event.preventDefault();
			nextS = 1;
		} else {
			return;
		}

		setHsv({ h: hsv.h, s: nextS, v: nextV });
	};

	const onHueKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		let nextH: number;
		if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			event.preventDefault();
			nextH = clampHue(hsv.h + 1);
		} else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			event.preventDefault();
			nextH = clampHue(hsv.h - 1);
		} else if (event.key === "Home") {
			event.preventDefault();
			nextH = 0;
		} else if (event.key === "End") {
			event.preventDefault();
			nextH = 360;
		} else {
			return;
		}

		setHsv({ h: nextH, s: hsv.s, v: hsv.v });
	};

	const bindPlanePointer = (node: HTMLDivElement | null, onMove: (event: PointerEvent) => void) => {
		if (node === null) {
			return;
		}

		const onPointerMove = (event: PointerEvent) => {
			onMove(event);
		};
		const onPointerUp = () => {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
		};

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
	};

	const onSvPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.currentTarget.focus();

		updateSvFromClient(event.clientX, event.clientY);
		bindPlanePointer(svRef.current, (moveEvent) => {
			updateSvFromClient(moveEvent.clientX, moveEvent.clientY);
		});
	};

	const onHuePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.currentTarget.focus();
		updateHueFromClient(event.clientX);
		bindPlanePointer(hueRef.current, (moveEvent) => {
			updateHueFromClient(moveEvent.clientX);
		});
	};

	let groupLabel = "Color";
	if (label !== undefined) {
		groupLabel = label;
	}

	let fields: ReactNode;
	if (mode === "hex") {
		fields = (
			<div className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
				<span aria-hidden="true">HEX</span>
				<Input
					aria-label={`${groupLabel} hex`}
					value={hexDraft}
					spellCheck={false}
					autoComplete="off"
					className="font-mono uppercase"
					onChange={(event) => {
						setHexDraft(event.target.value);
					}}
					onBlur={() => {
						commitHex(hexDraft);
					}}
					onKeyDown={(event) => {
						if (event.key !== "Enter") {
							return;
						}
						commitHex(hexDraft);
					}}
				/>
			</div>
		);
	} else {
		fields = (
			<div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
				<div className="flex flex-col gap-1 text-xs text-muted-foreground">
					<span aria-hidden="true">R</span>
					<NumberInput
						aria-label={`${groupLabel} red`}
						min={0}
						max={255}
						value={rgb.r}
						onValueChange={(next) => {
							if (next === undefined) {
								return;
							}
							const parsed = hexToHsv(
								rgbToHex({
									r: Math.round(next),
									g: rgb.g,
									b: rgb.b,
								}),
							);
							if (parsed !== null) {
								setHsv(parsed);
							}
						}}
					/>
				</div>
				<div className="flex flex-col gap-1 text-xs text-muted-foreground">
					<span aria-hidden="true">G</span>
					<NumberInput
						aria-label={`${groupLabel} green`}
						min={0}
						max={255}
						value={rgb.g}
						onValueChange={(next) => {
							if (next === undefined) {
								return;
							}
							const parsed = hexToHsv(
								rgbToHex({
									r: rgb.r,
									g: Math.round(next),
									b: rgb.b,
								}),
							);
							if (parsed !== null) {
								setHsv(parsed);
							}
						}}
					/>
				</div>
				<div className="flex flex-col gap-1 text-xs text-muted-foreground">
					<span aria-hidden="true">B</span>
					<NumberInput
						aria-label={`${groupLabel} blue`}
						min={0}
						max={255}
						value={rgb.b}
						onValueChange={(next) => {
							if (next === undefined) {
								return;
							}
							const parsed = hexToHsv(
								rgbToHex({
									r: rgb.r,
									g: rgb.g,
									b: Math.round(next),
								}),
							);
							if (parsed !== null) {
								setHsv(parsed);
							}
						}}
					/>
				</div>
			</div>
		);
	}

	let swatchRow: ReactNode = null;
	if (swatches !== undefined && swatches.length > 0) {
		swatchRow = (
			<div role="radiogroup" aria-label={`${groupLabel} swatches`} className="flex flex-wrap gap-1.5">
				{swatches.map((swatch) => {
					const normalized = normalizeHex(swatch);
					if (normalized === null) {
						return null;
					}
					const selected = normalized === hex;
					return (
						<button
							key={normalized}
							type="button"
							role="radio"
							aria-checked={selected}
							aria-label={normalized}
							data-slot="color-picker-swatch"
							className={cn(
								"size-6 rounded-md border border-border",
								selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
							)}
							style={{ backgroundColor: normalized }}
							onClick={() => {
								const next = hexToHsv(normalized);
								if (next !== null) {
									setHsv(next);
								}
							}}
						/>
					);
				})}
			</div>
		);
	}

	const satPercent = Math.round(hsv.s * 100);
	const valPercent = Math.round(hsv.v * 100);
	const hueRounded = Math.round(hsv.h);

	let previewText = hex;
	if (mode === "rgb") {
		previewText = rgbCss;
	}

	return (
		<div
			data-slot="color-picker"
			role="group"
			aria-label={groupLabel}
			className={cn("flex w-full max-w-xs flex-col gap-2", className)}
			{...rest}
		>
			<div className="flex items-center gap-2">
				<span
					data-slot="color-picker-preview"
					aria-hidden="true"
					className="size-7 shrink-0 rounded-md border border-border"
					style={{ backgroundColor: hex }}
				/>
				<span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{previewText}</span>
				<CopyButton value={copyValue} aria-label={copyAria} />
			</div>

			<div
				ref={svRef}
				data-slot="color-picker-sv"
				role="slider"
				tabIndex={0}
				aria-label={`${groupLabel} saturation and value`}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={satPercent}
				aria-valuetext={`Saturation ${String(satPercent)}%, value ${String(valPercent)}%`}
				className="relative h-28 w-full cursor-crosshair touch-none rounded-md border border-border"
				style={{
					backgroundColor: hueColor,
					backgroundImage:
						"linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
				}}
				onPointerDown={onSvPointerDown}
				onKeyDown={onSvKeyDown}
			>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
					style={{
						left: `${String(hsv.s * 100)}%`,
						top: `${String((1 - hsv.v) * 100)}%`,
						backgroundColor: hex,
					}}
				/>
			</div>

			<div
				ref={hueRef}
				data-slot="color-picker-hue"
				role="slider"
				tabIndex={0}
				aria-label={`${groupLabel} hue`}
				aria-valuemin={0}
				aria-valuemax={360}
				aria-valuenow={hueRounded}
				aria-valuetext={`${String(hueRounded)} degrees`}
				className="relative h-3 w-full cursor-ew-resize touch-none rounded-full border border-border"
				style={{ backgroundImage: HUE_GRADIENT }}
				onPointerDown={onHuePointerDown}
				onKeyDown={onHueKeyDown}
			>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
					style={{
						left: `${String((hsv.h / 360) * 100)}%`,
						backgroundColor: hueColor,
					}}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<SegmentedControl
					aria-label={`${groupLabel} input mode`}
					size="sm"
					options={[
						{ value: "hex", label: "HEX" },
						{ value: "rgb", label: "RGB" },
					]}
					value={mode}
					onValueChange={(next) => {
						if (next === "hex") {
							setMode("hex");
							setHexDraft(hex);
							return;
						}
						if (next === "rgb") {
							setMode("rgb");
						}
					}}
				/>
				{fields}
			</div>

			{swatchRow}
			<span id={`${baseId}-live`} className="sr-only" aria-live="polite">
				{previewText}
			</span>
		</div>
	);
}

export type { ColorPickerMode, ColorPickerProps };
export { ColorPicker, DEFAULT_HEX, formatRgbCss };
