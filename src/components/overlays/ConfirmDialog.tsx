import type { ReactNode } from "react";
import { useId, useState } from "react";

import { Button } from "../forms/Button.js";
import { Input } from "../forms/Input.js";
import { Label } from "../forms/Label.js";
import { Modal } from "./Modal.js";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	/**
	 * Confirm button tone. `danger` for destructive ops.
	 */
	variant?: "danger" | "filled";
	/**
	 * When set, confirm stays disabled until the user types this exact phrase.
	 */
	confirmPhrase?: string;
	confirmPhraseHint?: string;
	closeOnBackdropClick?: boolean;
	className?: string;
}

/**
 * Confirmation dialog built on `Modal`. Optional typed phrase gate for destroy flows.
 */
function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel,
	onConfirm,
	variant,
	confirmPhrase,
	confirmPhraseHint,
	closeOnBackdropClick,
	className,
}: ConfirmDialogProps) {
	let resolvedConfirmLabel = confirmLabel;
	resolvedConfirmLabel ??= "Confirm";

	let resolvedCancelLabel = cancelLabel;
	resolvedCancelLabel ??= "Cancel";

	let resolvedVariant = variant;
	resolvedVariant ??= "filled";

	let phraseHint = confirmPhraseHint;
	if (phraseHint === undefined && confirmPhrase !== undefined) {
		phraseHint = `Type ${confirmPhrase} to confirm`;
	}

	const phraseId = useId();
	const [typed, setTyped] = useState("");
	const [prevOpen, setPrevOpen] = useState(open);

	if (open !== prevOpen) {
		setPrevOpen(open);
		if (open) {
			setTyped("");
		}
	}

	let confirmEnabled = true;
	if (confirmPhrase !== undefined) {
		confirmEnabled = typed === confirmPhrase;
	}

	let confirmButtonVariant: "danger" | "filled" = "filled";
	if (resolvedVariant === "danger") {
		confirmButtonVariant = "danger";
	}

	let phraseField: ReactNode = null;
	if (confirmPhrase !== undefined) {
		phraseField = (
			<div className="mt-4 flex flex-col gap-1.5">
				<Label htmlFor={phraseId} required>
					{phraseHint}
				</Label>
				<Input
					id={phraseId}
					value={typed}
					autoComplete="off"
					spellCheck={false}
					aria-required="true"
					onChange={(event) => {
						setTyped(event.target.value);
					}}
				/>
			</div>
		);
	}

	let body: ReactNode = null;
	if (description !== undefined) {
		body = <div className="text-muted-foreground">{description}</div>;
	}

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			closeOnBackdropClick={closeOnBackdropClick}
			className={className}
			data-slot="confirm-dialog"
		>
			{body}
			{phraseField}
			<div className="mt-6 flex justify-end gap-2">
				<Button
					variant="outlined"
					onClick={() => {
						onOpenChange(false);
					}}
				>
					{resolvedCancelLabel}
				</Button>
				<Button
					variant={confirmButtonVariant}
					disabled={!confirmEnabled}
					onClick={() => {
						if (!confirmEnabled) {
							return;
						}
						onConfirm();
						onOpenChange(false);
					}}
				>
					{resolvedConfirmLabel}
				</Button>
			</div>
		</Modal>
	);
}

export type { ConfirmDialogProps };
export { ConfirmDialog };
