import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.js";
import { CopyButton } from "../forms/CopyButton.js";

type MaskedAccountFormat = "plain" | "iban";

interface MaskedAccountProps extends Omit<ComponentProps<"span">, "children"> {
	value: string;
	visibleEnd?: number;
	masked?: boolean;
	format?: MaskedAccountFormat;
	showCopy?: boolean;
}

function stripSpaces(value: string): string {
	return value.replace(/\s+/g, "");
}

function formatIbanGroups(value: string): string {
	const cleaned = stripSpaces(value).toUpperCase();

	const groups: string[] = [];
	let offset = 0;
	while (offset < cleaned.length) {
		groups.push(cleaned.slice(offset, offset + 4));
		offset += 4;
	}

	return groups.join(" ");
}

function maskValue(value: string, visibleEnd: number): string {
	const cleaned = stripSpaces(value);
	if (cleaned.length <= visibleEnd) {
		return cleaned;
	}

	const visible = cleaned.slice(cleaned.length - visibleEnd);
	return `••••${visible}`;
}

/**
 * Account / IBAN display with optional masking. Copy always uses the full
 * `value` (masking is shoulder-privacy UX, not security).
 */
function MaskedAccount({
	value,
	visibleEnd,
	masked,
	format,
	showCopy,
	className,
	...rest
}: MaskedAccountProps) {
	let resolvedVisibleEnd = 4;
	if (visibleEnd !== undefined) {
		resolvedVisibleEnd = visibleEnd;
	}

	let resolvedMasked = true;
	if (masked === false) {
		resolvedMasked = false;
	}

	let resolvedFormat: MaskedAccountFormat = "plain";
	if (format === "iban") {
		resolvedFormat = "iban";
	}

	let resolvedShowCopy = true;
	if (showCopy === false) {
		resolvedShowCopy = false;
	}

	let display = value;
	if (resolvedMasked) {
		display = maskValue(value, resolvedVisibleEnd);
	} else if (resolvedFormat === "iban") {
		display = formatIbanGroups(value);
	}

	let ariaLabel = display;
	if (resolvedMasked) {
		ariaLabel = `Masked account ending in ${stripSpaces(value).slice(-resolvedVisibleEnd)}`;
	}

	let maskedAttr = "false";
	if (resolvedMasked) {
		maskedAttr = "true";
	}

	let copyControl = null;
	if (resolvedShowCopy) {
		copyControl = (
			<CopyButton value={value} aria-label="Copy account number" />
		);
	}

	return (
		<span
			data-slot="masked-account"
			data-masked={maskedAttr}
			data-format={resolvedFormat}
			className={cn("inline-flex items-center gap-1", className)}
			{...rest}
		>
			<span
				data-slot="masked-account-text"
				className="font-mono text-sm tabular-nums"
				aria-label={ariaLabel}
			>
				{display}
			</span>
			{copyControl}
		</span>
	);
}

export type { MaskedAccountFormat, MaskedAccountProps };
export { MaskedAccount };
