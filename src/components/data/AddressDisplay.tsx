import type { ComponentProps } from "react";

import { truncateMiddle } from "../../utils/truncateMiddle.js";
import { cn } from "../../utils/cn.js";
import { CopyButton } from "../forms/CopyButton.js";

interface AddressDisplayProps extends Omit<ComponentProps<"span">, "children"> {
	address: string;
	startChars?: number;
	endChars?: number;
	showCopy?: boolean;
	invalid?: boolean;
}

/**
 * Bitcoin / chain address chrome: middle-truncate, monospace, optional
 * CopyButton with the full address. Validation stays with the consumer
 * (`invalid` is visual only).
 */
function AddressDisplay({ address, startChars, endChars, showCopy, invalid, className, ...rest }: AddressDisplayProps) {
	let resolvedStart = 6;
	if (startChars !== undefined) {
		resolvedStart = startChars;
	}

	let resolvedEnd = 6;
	if (endChars !== undefined) {
		resolvedEnd = endChars;
	}

	let resolvedShowCopy = true;
	if (showCopy === false) {
		resolvedShowCopy = false;
	}

	const display = truncateMiddle(address, {
		start: resolvedStart,
		end: resolvedEnd,
	});

	let invalidAttr = "false";
	if (invalid === true) {
		invalidAttr = "true";
	}

	let textClass = "font-mono text-sm break-all";
	if (invalid === true) {
		textClass = cn(textClass, "text-destructive");
	}

	let copyControl = null;
	if (resolvedShowCopy) {
		copyControl = <CopyButton value={address} aria-label="Copy address" />;
	}

	return (
		<span
			data-slot="address-display"
			data-invalid={invalidAttr}
			className={cn("inline-flex items-center gap-1", className)}
			{...rest}
		>
			<span data-slot="address-display-text" className={textClass} title={address} aria-label={address}>
				{display}
			</span>
			{copyControl}
		</span>
	);
}

export type { AddressDisplayProps };
export { AddressDisplay };
