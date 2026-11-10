import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

import { cn } from "../../utils/cn.js";

interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface RadioGroupProps extends Omit<ComponentProps<"fieldset">, "onChange"> {
	options: RadioOption[];
	name?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	orientation?: "vertical" | "horizontal";
	legend?: string;
}

/**
 * Radio group with a fieldset legend. Controlled via `value` / `onValueChange` or uncontrolled `defaultValue`.
 */
function RadioGroup({
	options,
	name,
	value,
	defaultValue,
	onValueChange,
	disabled,
	orientation,
	legend,
	className,
	...rest
}: RadioGroupProps) {
	const autoName = useId();
	let groupName = name;
	groupName ??= autoName;

	let resolvedOrientation = orientation;
	resolvedOrientation ??= "vertical";

	let listClass = "flex flex-col gap-3";
	if (resolvedOrientation === "horizontal") {
		listClass = "flex flex-wrap gap-4";
	}

	let legendNode: ReactNode = null;
	if (legend !== undefined && legend.length > 0) {
		legendNode = <legend className="text-sm font-medium text-foreground">{legend}</legend>;
	}

	return (
		<fieldset
			data-slot="radio-group"
			disabled={disabled}
			className={cn("flex w-full flex-col gap-2 border-0 p-0", className)}
			{...rest}
		>
			{legendNode}
			<div className={listClass} role="presentation">
				{options.map((option) => {
					const optionId = `${groupName}-${option.value}`;
					let checked: boolean | undefined;
					if (value !== undefined) {
						checked = value === option.value;
					}

					let defaultChecked = false;
					if (value === undefined && defaultValue === option.value) {
						defaultChecked = true;
					}

					return (
						<label key={option.value} htmlFor={optionId} className="flex cursor-pointer items-center gap-2">
							<input
								id={optionId}
								type="radio"
								name={groupName}
								value={option.value}
								checked={checked}
								defaultChecked={defaultChecked}
								disabled={option.disabled === true || disabled}
								onChange={() => {
									if (onValueChange !== undefined) {
										onValueChange(option.value);
									}
								}}
								className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
							/>
							<span className="text-sm font-medium text-foreground">{option.label}</span>
						</label>
					);
				})}
			</div>
		</fieldset>
	);
}

export type { RadioGroupProps, RadioOption };
export { RadioGroup };
