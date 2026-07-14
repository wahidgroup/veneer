import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils/cn.js";
import { CopyButton } from "../forms/CopyButton.js";

interface CodeBlockProps extends Omit<ComponentProps<"div">, "children"> {
	code: string;
	language?: string;
	showCopy?: boolean;
	showLineNumbers?: boolean;
	tabSize?: number;
}

/**
 * Read-only plain-text code chrome. Toolbar may show a language label and
 * CopyButton. Optional line gutter is aria-hidden so SR hears code only.
 * `tabSize` maps to CSS tab-size on the pre. No syntax highlighting in v1.
 */
function CodeBlock({
	code,
	language,
	showCopy = true,
	showLineNumbers = false,
	tabSize = 2,
	className,
	"aria-label": ariaLabel,
	...rest
}: CodeBlockProps) {
	let languageNode: ReactNode = null;
	if (language !== undefined && language !== "") {
		languageNode = (
			<span
				data-slot="code-block-language"
				className="text-xs font-medium text-muted-foreground"
			>
				{language}
			</span>
		);
	}

	let copyNode: ReactNode = null;
	if (showCopy) {
		copyNode = <CopyButton value={code} className="size-7" />;
	}

	let toolbarNode: ReactNode = null;
	if (languageNode !== null || copyNode !== null) {
		toolbarNode = (
			<div
				data-slot="code-block-toolbar"
				className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5"
			>
				<div className="min-w-0">{languageNode}</div>
				{copyNode}
			</div>
		);
	}

	let codeBody: ReactNode = code;
	if (showLineNumbers) {
		const lines = code.split("\n");
		codeBody = lines.map((line, index) => {
			const lineKey = `line-${String(index)}`;
			let lineText = line;
			if (lineText.length === 0) {
				lineText = " ";
			}

			return (
				<span
					key={lineKey}
					data-slot="code-block-line"
					className="flex gap-3"
				>
					<span
						data-slot="code-block-line-number"
						aria-hidden="true"
						className="w-8 shrink-0 select-none text-right text-muted-foreground"
					>
						{index + 1}
					</span>
					<span className="min-w-0 flex-1 whitespace-pre">
						{lineText}
					</span>
				</span>
			);
		});
	}

	let lineNumbersAttr: string | undefined;
	if (showLineNumbers) {
		lineNumbersAttr = "true";
	}

	let codeClass = "font-mono";
	if (showLineNumbers) {
		codeClass = cn(codeClass, "block");
	}

	const root = (
		<div
			data-slot="code-block"
			data-line-numbers={lineNumbersAttr}
			data-tab-size={String(tabSize)}
			className={cn(
				"overflow-hidden rounded-md border border-border bg-card text-card-foreground",
				className,
			)}
			{...rest}
		>
			{toolbarNode}
			<pre
				data-slot="code-block-pre"
				aria-label={ariaLabel}
				className="m-0 overflow-auto p-3 text-xs leading-relaxed"
				style={{ tabSize }}
			>
				<code data-slot="code-block-code" className={codeClass}>
					{codeBody}
				</code>
			</pre>
		</div>
	);

	return root;
}

export type { CodeBlockProps };
export { CodeBlock };
