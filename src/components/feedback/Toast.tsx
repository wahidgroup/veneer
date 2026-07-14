import type { CSSProperties, ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { ButtonProps } from "../forms/Button.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../forms/Button.js";
import { Portal } from "../overlays/Portal.js";

type ToastType = "success" | "error" | "warning" | "info";
type ToastPlacement = "floating" | "stacked";
type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface ToastAction {
	label: string;
	onClick: () => void;
	variant?: ButtonProps["variant"];
}

interface ToastFadeConfig {
	enterMs?: number;
	exitMs?: number;
}

type ToastFade = boolean | ToastFadeConfig;

interface ToastViewportContextValue {
	inViewport: boolean;
	position: ToastPosition;
}

const DEFAULT_POSITION: ToastPosition = "top-right";
const DEFAULT_ENTER_MS = 200;
const DEFAULT_EXIT_MS = 200;

const ToastViewportContext = createContext<ToastViewportContextValue>({
	inViewport: false,
	position: DEFAULT_POSITION,
});

const POSITION_CLASS: Record<ToastPosition, string> = {
	"top-right": "top-4 right-4 items-end",
	"top-left": "top-4 left-4 items-start",
	"bottom-right": "bottom-4 right-4 items-end",
	"bottom-left": "bottom-4 left-4 items-start",
};

const toastVariants = cva(
	[
		"flex min-w-[300px] max-w-md items-center gap-3 rounded-md border px-4 py-3 text-sm shadow-md",
		/*
		 * `bg-card` under a type wash. Dark semantic fills are translucent;
		 * stacking them on card keeps typed color without see-through panels.
		 */
		"bg-card [background-image:linear-gradient(var(--toast-wash),var(--toast-wash))]",
	].join(" "),
	{
		variants: {
			type: {
				success:
					"border-success text-success-muted-foreground [--toast-wash:var(--success-muted)]",
				error: "border-destructive text-destructive-muted-foreground [--toast-wash:var(--destructive-muted)]",
				warning:
					"border-warning text-warning-foreground [--toast-wash:var(--warning)]",
				info: "border-info text-info-foreground [--toast-wash:var(--info)]",
			},
			placement: {
				floating: "fixed z-toast",
				stacked: "relative pointer-events-auto",
			},
		},
		defaultVariants: {
			type: "info",
			placement: "floating",
		},
	},
);

interface ToastProps
	extends
		Omit<ComponentProps<"div">, "children">,
		Omit<VariantProps<typeof toastVariants>, "placement" | "type"> {
	message: string;
	type?: ToastType;
	/**
	 * Auto-dismiss delay in ms. `0` keeps the toast until dismissed.
	 */
	duration?: number;
	actions?: ToastAction[];
	onClose: () => void;
	placement?: ToastPlacement;
	/**
	 * Corner for floating toasts. Inside a viewport, inherits viewport `position` unless set.
	 */
	position?: ToastPosition;
	/**
	 * Fully-shown opacity (`0`–`1`). Default `1`.
	 */
	opacity?: number;
	/**
	 * Fade enter/exit. Default `true` (`200ms` each). `false` dismisses immediately.
	 */
	fade?: ToastFade;
}

type Phase = "enter" | "shown" | "exit";

function resolveFade(fade: ToastFade | undefined): {
	enabled: boolean;
	enterMs: number;
	exitMs: number;
} {
	if (fade === false) {
		return { enabled: false, enterMs: 0, exitMs: 0 };
	}

	let enterMs = DEFAULT_ENTER_MS;
	let exitMs = DEFAULT_EXIT_MS;

	if (fade !== undefined && fade !== true) {
		if (fade.enterMs !== undefined) {
			enterMs = fade.enterMs;
		}
		if (fade.exitMs !== undefined) {
			exitMs = fade.exitMs;
		}
	}

	return { enabled: true, enterMs, exitMs };
}

function clampOpacity(value: number): number {
	if (value < 0) {
		return 0;
	}
	if (value > 1) {
		return 1;
	}
	return value;
}

/**
 * Auto-dismissing notification. Defaults to `stacked` inside `ToastViewport`, else `floating`.
 * Uses a polite status region (alert for `error`).
 */
function Toast({
	message,
	type,
	duration,
	actions,
	onClose,
	className,
	placement: placementProp,
	position: positionProp,
	opacity: opacityProp,
	fade,
	style,
	...props
}: ToastProps) {
	let resolvedType = type;
	resolvedType ??= "info";

	let resolvedDuration = duration;
	resolvedDuration ??= 3000;

	let resolvedOpacity = 1;
	if (opacityProp !== undefined) {
		resolvedOpacity = clampOpacity(opacityProp);
	}

	const fadeConfig = resolveFade(fade);
	const viewport = useContext(ToastViewportContext);
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	let placement: ToastPlacement = "floating";
	if (placementProp !== undefined) {
		placement = placementProp;
	} else if (viewport.inViewport) {
		placement = "stacked";
	}

	let position = DEFAULT_POSITION;
	if (positionProp !== undefined) {
		position = positionProp;
	} else if (viewport.inViewport) {
		position = viewport.position;
	}

	let initialPhase: Phase = "shown";
	if (fadeConfig.enabled) {
		initialPhase = "enter";
	}

	const [phase, setPhase] = useState<Phase>(initialPhase);

	function dismiss() {
		if (!fadeConfig.enabled) {
			onCloseRef.current();
			return;
		}
		if (phase === "exit") {
			return;
		}
		setPhase("exit");
	}

	useEffect(() => {
		if (!fadeConfig.enabled) {
			return;
		}
		if (phase !== "enter") {
			return;
		}

		const timer = setTimeout(() => {
			setPhase("shown");
		}, 0);

		return () => {
			clearTimeout(timer);
		};
	}, [fadeConfig.enabled, phase]);

	useEffect(() => {
		if (phase !== "exit") {
			return;
		}

		const timer = setTimeout(() => {
			onCloseRef.current();
		}, fadeConfig.exitMs);

		return () => {
			clearTimeout(timer);
		};
	}, [phase, fadeConfig.exitMs]);

	useEffect(() => {
		if (resolvedDuration <= 0) {
			return;
		}

		const timer = setTimeout(() => {
			if (!fadeConfig.enabled) {
				onCloseRef.current();
				return;
			}
			setPhase("exit");
		}, resolvedDuration);

		return () => {
			clearTimeout(timer);
		};
	}, [resolvedDuration, fadeConfig.enabled]);

	let role: "status" | "alert" = "status";
	if (resolvedType === "error") {
		role = "alert";
	}

	let actionNode: ReactNode = null;
	if (actions !== undefined && actions.length > 0) {
		actionNode = (
			<div className="flex shrink-0 items-center gap-1">
				{actions.map((action, index) => {
					let actionVariant = action.variant;
					actionVariant ??= "text";
					const key = `${String(index)}-${action.label}`;

					return (
						<Button
							key={key}
							variant={actionVariant}
							size="sm"
							aria-label={action.label}
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					);
				})}
			</div>
		);
	}

	let visualOpacity = resolvedOpacity;
	if (fadeConfig.enabled) {
		if (phase === "enter" || phase === "exit") {
			visualOpacity = 0;
		}
	}

	let transitionMs = fadeConfig.enterMs;
	if (phase === "exit") {
		transitionMs = fadeConfig.exitMs;
	}

	const mergedStyle: CSSProperties = { ...style };
	mergedStyle.opacity = visualOpacity;
	if (fadeConfig.enabled) {
		mergedStyle.transition = `opacity ${transitionMs}ms ease`;
	}

	let layoutClass = toastVariants({ type: resolvedType, placement });
	if (placement === "floating") {
		layoutClass = cn(layoutClass, POSITION_CLASS[position]);
	}

	const node = (
		<div
			data-slot="toast"
			data-placement={placement}
			data-position={position}
			data-phase={phase}
			role={role}
			{...props}
			style={mergedStyle}
			className={cn(layoutClass, className)}
		>
			<p className="min-w-0 flex-1 font-medium">{message}</p>
			{actionNode}
			<Button
				variant="ghost"
				size="icon"
				aria-label="Close toast"
				onClick={dismiss}
			>
				<X className="size-4" aria-hidden="true" />
			</Button>
		</div>
	);

	if (placement === "floating") {
		return <Portal>{node}</Portal>;
	}

	return node;
}

interface ToastViewportProps extends ComponentProps<"div"> {
	children?: ReactNode;
	position?: ToastPosition;
}

/**
 * Fixed stack host for toasts. Portaled; pointer-events pass through except on each toast.
 */
function ToastViewport({
	className,
	children,
	position,
	...props
}: ToastViewportProps) {
	let resolvedPosition = position;
	resolvedPosition ??= DEFAULT_POSITION;

	return (
		<Portal>
			<ToastViewportContext.Provider
				value={{
					inViewport: true,
					position: resolvedPosition,
				}}
			>
				<div
					data-slot="toast-viewport"
					data-position={resolvedPosition}
					aria-live="polite"
					aria-relevant="additions"
					className={cn(
						"pointer-events-none fixed z-toast flex flex-col gap-2",
						POSITION_CLASS[resolvedPosition],
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</ToastViewportContext.Provider>
		</Portal>
	);
}

export type {
	ToastProps,
	ToastViewportProps,
	ToastType,
	ToastPlacement,
	ToastPosition,
	ToastAction,
	ToastFade,
	ToastFadeConfig,
};
export { Toast, ToastViewport, toastVariants };
