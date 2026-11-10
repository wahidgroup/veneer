import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../../utils/cn.js";
import { lockBodyScroll } from "../../utils/lockBodyScroll.js";
import { DISMISS_LAYER_TIER_CLASS, useDismissLayer } from "../../overlays/dismissLayerStack.js";
import { Button } from "../forms/Button.js";
import { Portal } from "./Portal.js";
import { captureFocusRestore, focusInitial, restoreFocus, trapTabKey } from "../../utils/focusScope.js";

type DrawerSide = "right" | "left" | "top" | "bottom";

const drawerPanelVariants = cva(
	[
		"relative z-10 flex w-full flex-col overflow-hidden",
		"border-border bg-card text-card-foreground shadow-lg outline-none",
	].join(" "),
	{
		variants: {
			side: {
				right: "h-full max-w-md rounded-l-lg border-l",
				left: "h-full max-w-md rounded-r-lg border-r",
				top: "max-h-[min(24rem,90vh)] rounded-b-lg border-b",
				bottom: "max-h-[min(24rem,90vh)] rounded-t-lg border-t",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

interface DrawerProps extends Omit<ComponentProps<"div">, "title">, VariantProps<typeof drawerPanelVariants> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
	closeOnBackdropClick?: boolean;
	showCloseButton?: boolean;
}

/**
 * Edge sheet dialog (APG modal dialog pattern).
 */
function Drawer({
	open,
	onOpenChange,
	title,
	children,
	side,
	closeOnBackdropClick,
	showCloseButton,
	className,
	...rest
}: DrawerProps) {
	let resolvedSide: DrawerSide = "right";
	if (side === "left") {
		resolvedSide = "left";
	}
	if (side === "top") {
		resolvedSide = "top";
	}
	if (side === "bottom") {
		resolvedSide = "bottom";
	}

	let allowBackdropClose = closeOnBackdropClick;
	allowBackdropClose ??= true;

	let allowCloseButton = showCloseButton;
	allowCloseButton ??= true;

	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const restoreFocusRef = useRef<HTMLElement | null>(null);

	useDismissLayer({
		open,
		onEscape: () => {
			onOpenChange(false);
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		restoreFocusRef.current = captureFocusRestore();

		const unlockScroll = lockBodyScroll();

		const dialog = dialogRef.current;
		if (dialog !== null) {
			focusInitial(dialog);
		}

		function onKeyDown(event: KeyboardEvent) {
			const node = dialogRef.current;
			if (node === null) {
				return;
			}

			trapTabKey(event, node);
		}

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			unlockScroll();
			restoreFocus(restoreFocusRef.current);
		};
	}, [open, onOpenChange]);

	if (!open) {
		return null;
	}

	const shellTier = "fixed inset-0 " + DISMISS_LAYER_TIER_CLASS;
	let shellClass = shellTier + " flex justify-end";
	if (resolvedSide === "left") {
		shellClass = shellTier + " flex justify-start";
	}
	if (resolvedSide === "top") {
		shellClass = shellTier + " flex flex-col justify-start";
	}
	if (resolvedSide === "bottom") {
		shellClass = shellTier + " flex flex-col justify-end";
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
			<div data-slot="drawer" data-side={resolvedSide} className={shellClass}>
				<div
					data-slot="drawer-backdrop"
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
					className={cn(drawerPanelVariants({ side: resolvedSide }), className)}
					{...rest}
				>
					<div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
						<h2 id={titleId} className="text-lg font-semibold text-foreground">
							{title}
						</h2>
						{closeControl}
					</div>
					<div className="flex-1 overflow-auto px-5 py-4 text-sm text-foreground">{children}</div>
				</div>
			</div>
		</Portal>
	);
}

export type { DrawerProps, DrawerSide };
export { Drawer, drawerPanelVariants };
