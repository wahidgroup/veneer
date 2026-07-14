import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { Button } from "./Button.js";

interface CopyButtonProps extends Omit<
	ComponentProps<typeof Button>,
	"children" | "onClick" | "value"
> {
	value: string;
	label?: ReactNode;
	copiedLabel?: ReactNode;
	resetMs?: number;
	onCopied?: (value: string) => void;
}

/**
 * Copies `value` to the clipboard. Shows a brief copied affordance, then
 * resets. Builds on Button (`ghost` / `icon` by default for ARN/ID chrome).
 */
function CopyButton({
	value,
	label,
	copiedLabel,
	resetMs,
	onCopied,
	variant,
	size,
	type,
	className,
	disabled,
	"aria-label": ariaLabel,
	...rest
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	let resolvedResetMs = resetMs;
	resolvedResetMs ??= 2000;

	let resolvedVariant = variant;
	resolvedVariant ??= "ghost";

	let resolvedSize = size;
	resolvedSize ??= "icon";

	let resolvedType = type;
	resolvedType ??= "button";

	let idleLabel = label;
	idleLabel ??= <Copy className="size-4" aria-hidden="true" />;

	let doneLabel = copiedLabel;
	doneLabel ??= <Check className="size-4" aria-hidden="true" />;

	let resolvedAriaLabel = ariaLabel;
	if (resolvedAriaLabel === undefined) {
		if (copied) {
			resolvedAriaLabel = "Copied";
		} else {
			resolvedAriaLabel = "Copy to clipboard";
		}
	}

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timer = window.setTimeout(() => {
			setCopied(false);
		}, resolvedResetMs);

		return () => {
			window.clearTimeout(timer);
		};
	}, [copied, resolvedResetMs]);

	let copiedAttr = "false";
	if (copied) {
		copiedAttr = "true";
	}

	let content: ReactNode = idleLabel;
	if (copied) {
		content = doneLabel;
	}

	return (
		<Button
			{...rest}
			data-slot="copy-button"
			data-copied={copiedAttr}
			type={resolvedType}
			variant={resolvedVariant}
			size={resolvedSize}
			disabled={disabled}
			aria-label={resolvedAriaLabel}
			className={cn(className)}
			onClick={() => {
				void (async () => {
					await navigator.clipboard.writeText(value);
					setCopied(true);
					if (onCopied !== undefined) {
						onCopied(value);
					}
				})();
			}}
		>
			{content}
		</Button>
	);
}

export type { CopyButtonProps };
export { CopyButton };
