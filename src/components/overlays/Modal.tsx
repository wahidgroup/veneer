import type { ComponentProps, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { lockBodyScroll } from "../../utils/lockBodyScroll.js";
import { Button } from "../forms/Button.js";
import { Portal } from "./Portal.js";

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

function listFocusable(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

interface ModalProps extends Omit<ComponentProps<"div">, "title"> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
	closeOnBackdropClick?: boolean;
	showCloseButton?: boolean;
}

/**
 * Modal dialog with backdrop, Esc dismiss, scroll lock, and focus trap.
 * Renders through `Portal`.
 */
function Modal({
	open,
	onOpenChange,
	title,
	children,
	closeOnBackdropClick,
	showCloseButton,
	className,
	...rest
}: ModalProps) {
	let allowBackdropClose = closeOnBackdropClick;
	allowBackdropClose ??= true;

	let allowCloseButton = showCloseButton;
	allowCloseButton ??= true;

	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const restoreFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		const active = document.activeElement;
		if (active instanceof HTMLElement) {
			restoreFocusRef.current = active;
		}

		const unlockScroll = lockBodyScroll();

		const dialog = dialogRef.current;
		if (dialog !== null) {
			const targets = listFocusable(dialog);
			const first = targets[0];
			if (first !== undefined) {
				first.focus();
			} else {
				dialog.focus();
			}
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				onOpenChange(false);

				return;
			}

			if (event.key !== "Tab") {
				return;
			}

			const node = dialogRef.current;
			if (node === null) {
				return;
			}

			const targets = listFocusable(node);
			if (targets.length === 0) {
				event.preventDefault();
				node.focus();

				return;
			}

			const first = targets[0];
			const last = targets[targets.length - 1];
			if (first === undefined || last === undefined) {
				return;
			}

			const activeEl = document.activeElement;
			if (event.shiftKey) {
				if (activeEl === first || activeEl === node) {
					event.preventDefault();
					last.focus();
				}

				return;
			}

			if (activeEl === last) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			unlockScroll();

			const restore = restoreFocusRef.current;
			if (restore !== null) {
				restore.focus();
			}
		};
	}, [open, onOpenChange]);

	if (!open) {
		return null;
	}

	let closeControl: ReactNode = null;
	if (allowCloseButton) {
		closeControl = (
			<Button
				variant="ghost"
				size="icon"
				aria-label="Close"
				onClick={() => {
					onOpenChange(false);
				}}
			>
				<X aria-hidden="true" className="size-4" />
			</Button>
		);
	}

	return (
		<Portal>
			<div
				data-slot="modal"
				className="fixed inset-0 z-modal flex items-center justify-center p-4"
			>
				<div
					data-slot="modal-backdrop"
					aria-hidden="true"
					className="absolute inset-0 bg-foreground/40"
					onClick={() => {
						if (!allowBackdropClose) {
							return;
						}
						onOpenChange(false);
					}}
				/>
				<div
					ref={dialogRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					tabIndex={-1}
					className={cn(
						"relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg outline-none",
						className,
					)}
					{...rest}
				>
					<div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
						<h2
							id={titleId}
							className="text-lg font-semibold text-foreground"
						>
							{title}
						</h2>
						{closeControl}
					</div>
					<div className="flex-1 overflow-auto px-5 py-4 text-sm text-foreground">
						{children}
					</div>
				</div>
			</div>
		</Portal>
	);
}

export type { ModalProps };
export { Modal };
