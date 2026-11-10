import type { ComponentProps } from "react";
import { useState } from "react";

import { cn } from "../../utils/cn.js";

interface ToggleProps extends Omit<ComponentProps<"button">, "onChange"> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	label?: string;
}

/**
 * Switch control (`role="switch"`). Prefer controlled `checked` + `onCheckedChange` in forms.
 */
function Toggle({ checked, defaultChecked, onCheckedChange, label, className, disabled, id, ...rest }: ToggleProps) {
	const isControlled = checked !== undefined;
	const [uncontrolled, setUncontrolled] = useState(defaultChecked === true);

	let isOn = uncontrolled;
	if (isControlled) {
		isOn = checked;
	}

	let trackClass = "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors";
	trackClass = cn(
		trackClass,
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
	);
	if (isOn) {
		trackClass = cn(trackClass, "bg-primary");
	} else {
		trackClass = cn(trackClass, "bg-muted");
	}
	if (disabled === true) {
		trackClass = cn(trackClass, "cursor-not-allowed opacity-50");
	} else {
		trackClass = cn(trackClass, "cursor-pointer");
	}

	let thumbClass = "inline-block size-4 transform rounded-full bg-card transition-transform";
	if (isOn) {
		thumbClass = cn(thumbClass, "translate-x-6");
	} else {
		thumbClass = cn(thumbClass, "translate-x-1");
	}

	return (
		<button
			data-slot="toggle"
			id={id}
			type="button"
			role="switch"
			aria-checked={isOn}
			aria-label={label}
			disabled={disabled}
			className={cn(trackClass, className)}
			onClick={() => {
				if (disabled === true) {
					return;
				}
				const next = !isOn;
				if (!isControlled) {
					setUncontrolled(next);
				}
				if (onCheckedChange !== undefined) {
					onCheckedChange(next);
				}
			}}
			{...rest}
		>
			<span className={thumbClass} />
		</button>
	);
}

export type { ToggleProps };
export { Toggle };
