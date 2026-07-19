import type { ComponentProps, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { CopyButton } from "../forms/CopyButton.js";
import { Input } from "../forms/Input.js";

/** Common BIP39 phrase lengths. */
type SeedPhraseWordCount = 12 | 15 | 18 | 24;

type SeedPhraseColumns = 2 | 3 | 4;

interface SeedPhraseProps extends Omit<ComponentProps<"div">, "children"> {
	words: string[];
	/**
	 * Grid column count. Defaults from `words.length`.
	 */
	columns?: SeedPhraseColumns;
	/**
	 * Fixed monospace width (ch) for each word slot so hide/reveal does not
	 * resize cells. BIP39 max word length is 8.
	 */
	wordSlotCh?: number;
	revealed?: boolean;
	defaultRevealed?: boolean;
	onRevealedChange?: (revealed: boolean) => void;
	verifyMode?: boolean;
	values?: string[];
	onWordChange?: (index: number, value: string) => void;
	showCopy?: boolean;
}

/** BIP39 English max word length: used for stable slot width. */
const DEFAULT_WORD_SLOT_CH = 8;

function resolveColumns(
	wordCount: number,
	columns?: SeedPhraseColumns,
): SeedPhraseColumns {
	if (columns !== undefined) {
		return columns;
	}
	if (wordCount > 0 && wordCount % 4 === 0) {
		return 4;
	}

	return 3;
}

function maskForSlot(slotCh: number): string {
	return "•".repeat(slotCh);
}

function gridColumnsClass(columns: SeedPhraseColumns): string {
	if (columns === 2) {
		return "grid-cols-2";
	}
	if (columns === 4) {
		return "grid-cols-2 sm:grid-cols-4";
	}

	return "grid-cols-2 sm:grid-cols-3";
}

/**
 * Presentation-only seed phrase grid. Parent supplies `words`. No BIP39
 * wordlist and no entropy generation. Unrevealed display omits plaintext
 * from the DOM (mask glyphs only).
 */
function SeedPhrase({
	words,
	columns,
	wordSlotCh,
	revealed,
	defaultRevealed,
	onRevealedChange,
	verifyMode,
	values,
	onWordChange,
	showCopy,
	className,
	...rest
}: SeedPhraseProps) {
	const isControlled = revealed !== undefined;
	const [uncontrolledRevealed, setUncontrolledRevealed] = useState(() => {
		if (defaultRevealed === true) {
			return true;
		}

		return false;
	});

	let isRevealed = uncontrolledRevealed;
	if (isControlled) {
		isRevealed = revealed;
	}

	let resolvedVerifyMode = false;
	if (verifyMode === true) {
		resolvedVerifyMode = true;
	}

	let resolvedShowCopy = true;
	if (showCopy === false) {
		resolvedShowCopy = false;
	}

	let resolvedSlotCh = DEFAULT_WORD_SLOT_CH;
	if (wordSlotCh !== undefined && wordSlotCh > 0) {
		resolvedSlotCh = wordSlotCh;
	}

	const resolvedColumns = resolveColumns(words.length, columns);
	const maskGlyph = maskForSlot(resolvedSlotCh);
	const wordSlotStyle = { width: `${String(resolvedSlotCh)}ch` };

	const setRevealed = (next: boolean) => {
		if (!isControlled) {
			setUncontrolledRevealed(next);
		}
		if (onRevealedChange !== undefined) {
			onRevealedChange(next);
		}
	};

	const copyValue = words.join(" ");

	let revealLabel = "Reveal seed phrase";
	let revealIcon = <Eye className="size-4" aria-hidden="true" />;
	if (isRevealed) {
		revealLabel = "Hide seed phrase";
		revealIcon = <EyeOff className="size-4" aria-hidden="true" />;
	}

	let revealedAttr = "false";
	if (isRevealed) {
		revealedAttr = "true";
	}

	let copyControl: ReactNode = null;
	if (resolvedShowCopy && !resolvedVerifyMode) {
		copyControl = (
			<CopyButton value={copyValue} aria-label="Copy seed phrase" />
		);
	}

	const gridClass = cn("grid gap-2", gridColumnsClass(resolvedColumns));

	let gridNode: ReactNode;
	if (resolvedVerifyMode) {
		gridNode = (
			<div className={gridClass}>
				{words.map((word, index) => {
					let inputValue = "";
					if (values !== undefined) {
						const fromValues = values[index];
						if (fromValues !== undefined) {
							inputValue = fromValues;
						}
					}

					return (
						<label
							key={`${String(index)}-verify`}
							className="flex min-w-0 flex-col gap-1 text-sm"
						>
							<span className="text-muted-foreground">
								{index + 1}
							</span>
							<Input
								value={inputValue}
								aria-label={`Word ${String(index + 1)}`}
								autoComplete="off"
								className="font-mono"
								style={wordSlotStyle}
								onChange={(event) => {
									if (onWordChange === undefined) {
										return;
									}
									onWordChange(index, event.target.value);
								}}
							/>
						</label>
					);
				})}
			</div>
		);
	} else {
		gridNode = (
			<ol
				className={gridClass}
				aria-label="Seed phrase words"
				data-columns={String(resolvedColumns)}
				data-word-count={String(words.length)}
			>
				{words.map((word, index) => {
					let displayWord = maskGlyph;
					if (isRevealed) {
						displayWord = word;
					}

					return (
						<li
							key={`${String(index)}-slot`}
							className="flex items-baseline gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5 font-mono text-sm"
						>
							<span
								className="w-6 shrink-0 text-muted-foreground tabular-nums"
								aria-hidden="true"
							>
								{index + 1}
							</span>
							<span
								className="inline-block shrink-0 truncate"
								style={wordSlotStyle}
							>
								{displayWord}
							</span>
						</li>
					);
				})}
			</ol>
		);
	}

	let verifyAttr = "false";
	if (resolvedVerifyMode) {
		verifyAttr = "true";
	}

	let revealButtonText = "Reveal";
	if (isRevealed) {
		revealButtonText = "Hide";
	}

	return (
		<div
			data-slot="seed-phrase"
			data-revealed={revealedAttr}
			data-verify={verifyAttr}
			data-word-count={String(words.length)}
			className={cn("flex flex-col gap-3", className)}
			{...rest}
		>
			<div className="flex min-h-8 items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					aria-pressed={isRevealed}
					aria-label={revealLabel}
					onClick={() => {
						setRevealed(!isRevealed);
					}}
				>
					{revealIcon}
					<span>{revealButtonText}</span>
				</Button>
				{copyControl}
			</div>
			{gridNode}
		</div>
	);
}

export type { SeedPhraseColumns, SeedPhraseProps, SeedPhraseWordCount };
export { DEFAULT_WORD_SLOT_CH, SeedPhrase };
