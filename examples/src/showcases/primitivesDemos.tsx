import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";

import { X } from "lucide-react";

import {
	ActionMenu,
	Alert,
	Badge,
	Button,
	Card,
	CircularProgress,
	ColorPicker,
	CommandPalette,
	ConfirmDialog,
	CopyButton,
	Drawer,
	EmptyState,
	ErrorState,
	Input,
	Loading,
	Modal,
	NumberInput,
	Popover,
	ProgressBar,
	ProgressGroup,
	QuotaMeter,
	Select,
	Skeleton,
	Slider,
	StatusBadge,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
	Toast,
	ToastViewport,
	Toggle,
	Tooltip,
	VisuallyHidden,
	Avatar,
	DeltaBadge,
	Separator,
	TxStatusBadge,
	type AlertType,
	type CommandPaletteItem,
	type DrawerSide,
	type ProgressTask,
	type ToastFade,
	type ToastPosition,
	type ToastType,
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	ContextMenu,
	ResizablePanel,
	SegmentedControl,
	type ResizablePanelOrientation,
} from "@wahidgroup/veneer";

import type { CommandItem, ProgressJob, QuotaSnapshot } from "../api/client.js";
import {
	addCommand,
	consumeQuota,
	getProgressJob,
	getQuota,
	listCommands,
	releaseQuota,
	removeCommand,
	resetCommands,
	resetProgressJob,
	resetQuota,
	startProgressJob,
	stopProgressJob,
} from "../api/client.js";
import { Canvas, DemoRow, DemoSectionHeader, RailPanel } from "./demoChrome.js";

const METER_SIZE_OPTIONS = [
	{ value: "sm", label: "sm" },
	{ value: "md", label: "md" },
	{ value: "lg", label: "lg" },
];

type MeterSize = "sm" | "md" | "lg";

function parseMeterSize(value: string): MeterSize {
	if (value === "sm") {
		return "sm";
	}
	if (value === "lg") {
		return "lg";
	}
	return "md";
}

interface DemoToast {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
	opacity: number;
	fade: ToastFade;
	withActions: boolean;
}

const TOAST_POSITIONS: { value: ToastPosition; label: string }[] = [
	{ value: "top-right", label: "Top right" },
	{ value: "top-left", label: "Top left" },
	{ value: "bottom-right", label: "Bottom right" },
	{ value: "bottom-left", label: "Bottom left" },
];

interface ToastDemoValue {
	pushToast: (type: ToastType, message: string) => void;
	toastPosition: ToastPosition;
	setToastPosition: (value: ToastPosition) => void;
	toastDuration: number;
	setToastDuration: (value: number) => void;
	toastOpacity: number;
	setToastOpacity: (value: number) => void;
	toastFade: boolean;
	setToastFade: (value: boolean) => void;
	toastEnterMs: number;
	setToastEnterMs: (value: number) => void;
	toastExitMs: number;
	setToastExitMs: (value: number) => void;
	toastActions: boolean;
	setToastActions: (value: boolean) => void;
	toasts: DemoToast[];
	dismissToast: (id: number) => void;
	lastAction: string;
	setLastAction: (value: string) => void;
}

const ToastDemoContext = createContext<ToastDemoValue | null>(null);

function useToastDemo(): ToastDemoValue {
	const value = useContext(ToastDemoContext);
	if (value === null) {
		throw new Error("ToastDemoProvider required");
	}

	return value;
}

function ToastDemoProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<DemoToast[]>([]);
	const [toastSeq, setToastSeq] = useState(0);
	const [toastPosition, setToastPosition] =
		useState<ToastPosition>("top-right");
	const [toastDuration, setToastDuration] = useState(4000);
	const [toastOpacity, setToastOpacity] = useState(0.95);
	const [toastFade, setToastFade] = useState(true);
	const [toastEnterMs, setToastEnterMs] = useState(200);
	const [toastExitMs, setToastExitMs] = useState(200);
	const [toastActions, setToastActions] = useState(false);
	const [lastAction, setLastAction] = useState("none");

	function pushToast(type: ToastType, message: string) {
		const id = toastSeq + 1;
		setToastSeq(id);

		let fade: ToastFade = false;
		if (toastFade) {
			fade = { enterMs: toastEnterMs, exitMs: toastExitMs };
		}

		setToasts((prev) => {
			return [
				...prev,
				{
					id,
					message,
					type,
					duration: toastDuration,
					opacity: toastOpacity,
					fade,
					withActions: toastActions,
				},
			];
		});
	}

	function dismissToast(id: number) {
		setToasts((prev) => {
			return prev.filter((toast) => {
				return toast.id !== id;
			});
		});
	}

	const value: ToastDemoValue = {
		pushToast,
		toastPosition,
		setToastPosition,
		toastDuration,
		setToastDuration,
		toastOpacity,
		setToastOpacity,
		toastFade,
		setToastFade,
		toastEnterMs,
		setToastEnterMs,
		toastExitMs,
		setToastExitMs,
		toastActions,
		setToastActions,
		toasts,
		dismissToast,
		lastAction,
		setLastAction,
	};

	return (
		<ToastDemoContext.Provider value={value}>
			{children}
		</ToastDemoContext.Provider>
	);
}

function ToastCanvas() {
	const demo = useToastDemo();

	return (
		<Canvas>
			<ToastViewport position={demo.toastPosition}>
				{demo.toasts.map((toast) => {
					let actions;
					if (toast.withActions) {
						actions = [
							{
								label: "Undo",
								onClick: () => {
									demo.setLastAction("toast-undo");
									demo.dismissToast(toast.id);
								},
							},
							{
								label: "Details",
								onClick: () => {
									demo.setLastAction("toast-details");
								},
							},
						];
					}

					return (
						<Toast
							key={toast.id}
							message={toast.message}
							type={toast.type}
							actions={actions}
							duration={toast.duration}
							opacity={toast.opacity}
							fade={toast.fade}
							onClose={() => {
								demo.dismissToast(toast.id);
							}}
						/>
					);
				})}
			</ToastViewport>
			<DemoRow label="Push">
				<Button
					variant="outlined"
					size="sm"
					onClick={() => {
						demo.pushToast("success", "Change set apply accepted");
					}}
				>
					Success
				</Button>
				<Button
					variant="outlined"
					size="sm"
					onClick={() => {
						demo.pushToast("error", "Stack update failed");
					}}
				>
					Error
				</Button>
				<Button
					variant="outlined"
					size="sm"
					onClick={() => {
						demo.pushToast("info", "Drift detection started");
					}}
				>
					Info
				</Button>
				<Button
					variant="outlined"
					size="sm"
					onClick={() => {
						demo.pushToast("warning", "Quota nearing limit");
					}}
				>
					Warning
				</Button>
			</DemoRow>
			<p className="text-sm text-muted-foreground">
				Last action: {demo.lastAction}
			</p>
		</Canvas>
	);
}

function ToastKnobs() {
	const demo = useToastDemo();

	return (
		<RailPanel
			title="Toast"
			description="Knobs feed the next push. Stack inherits viewport corner."
		>
			<DemoRow
				label="Position"
				description="Corner of the viewport where the toast stack appears."
			>
				<Select
					id="toast-position"
					options={TOAST_POSITIONS}
					value={demo.toastPosition}
					onChange={(value) => {
						const next = value;
						if (next === "top-right") {
							demo.setToastPosition("top-right");
							return;
						}
						if (next === "top-left") {
							demo.setToastPosition("top-left");
							return;
						}
						if (next === "bottom-right") {
							demo.setToastPosition("bottom-right");
							return;
						}
						if (next === "bottom-left") {
							demo.setToastPosition("bottom-left");
						}
					}}
					aria-label="Toast position"
				/>
			</DemoRow>
			<DemoRow
				label="Duration"
				description="Auto-dismiss delay in ms. Use 0 to keep the toast until closed."
			>
				<NumberInput
					id="toast-duration"
					min={0}
					step={500}
					value={demo.toastDuration}
					aria-label="Toast duration"
					onValueChange={(value) => {
						let next = 0;
						if (value !== undefined) {
							next = value;
						}

						demo.setToastDuration(next);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Opacity"
				description={`Panel opacity for the next toast (${demo.toastOpacity.toFixed(2)}).`}
			>
				<Slider
					id="toast-opacity"
					min={0.2}
					max={1}
					step={0.05}
					value={demo.toastOpacity}
					aria-label="Toast opacity"
					onValueChange={(value) => {
						demo.setToastOpacity(value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Fade"
				description="Animate enter and exit. Enter/exit ms apply when fade is on."
			>
				<Toggle
					checked={demo.toastFade}
					label="Fade enter/exit"
					onCheckedChange={demo.setToastFade}
				/>
				<NumberInput
					id="toast-enter-ms"
					min={0}
					step={50}
					disabled={!demo.toastFade}
					value={demo.toastEnterMs}
					aria-label="Enter fade ms"
					onValueChange={(value) => {
						let next = 0;
						if (value !== undefined) {
							next = value;
						}

						demo.setToastEnterMs(next);
					}}
				/>
				<NumberInput
					id="toast-exit-ms"
					min={0}
					step={50}
					disabled={!demo.toastFade}
					value={demo.toastExitMs}
					aria-label="Exit fade ms"
					onValueChange={(value) => {
						let next = 0;
						if (value !== undefined) {
							next = value;
						}

						demo.setToastExitMs(next);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Actions"
				description="Attach Undo and Details action buttons to the next toast."
			>
				<Toggle
					checked={demo.toastActions}
					label="Include Undo / Details"
					onCheckedChange={demo.setToastActions}
				/>
			</DemoRow>
		</RailPanel>
	);
}

type AlertDemoType = AlertType;

interface AlertDemoValue {
	type: AlertDemoType;
	setType: (value: AlertDemoType) => void;
	showTitle: boolean;
	setShowTitle: (value: boolean) => void;
}

const AlertDemoContext = createContext<AlertDemoValue | null>(null);

function useAlertDemo() {
	const value = useContext(AlertDemoContext);
	if (value === null) {
		throw new Error("AlertDemoProvider required");
	}

	return value;
}

function AlertDemoProvider({ children }: { children: ReactNode }) {
	const [type, setType] = useState<AlertDemoType>("info");
	const [showTitle, setShowTitle] = useState(true);

	return (
		<AlertDemoContext.Provider
			value={{ type, setType, showTitle, setShowTitle }}
		>
			{children}
		</AlertDemoContext.Provider>
	);
}

const ALERT_TYPE_OPTIONS = [
	{ value: "info", label: "Info" },
	{ value: "success", label: "Success" },
	{ value: "warning", label: "Warning" },
	{ value: "danger", label: "Danger" },
];

function AlertCanvas() {
	const demo = useAlertDemo();

	let title: string | undefined;
	if (demo.showTitle) {
		title = "Playground";
	}

	return (
		<Canvas>
			<DemoRow label="Playground">
				<Alert
					type={demo.type}
					title={title}
					className="w-full max-w-lg"
				>
					Controls in the rail change this notice type and title.
				</Alert>
			</DemoRow>
			<DemoRow label="Types">
				<div className="flex w-full max-w-lg flex-col gap-3">
					<Alert type="info" title="Info">
						Drift detection started for the selected stack.
					</Alert>
					<Alert type="success" title="Success">
						Change set apply accepted.
					</Alert>
					<Alert type="warning" title="Warning">
						Quota nearing the soft limit for this region.
					</Alert>
					<Alert type="danger" title="Danger">
						Stack update failed. Review events before retrying.
					</Alert>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function AlertKnobs() {
	const demo = useAlertDemo();

	return (
		<RailPanel
			title="Alert"
			description="Static inline notice for page or panel context. Prefer Toast for ephemeral feedback."
		>
			<DemoRow
				label="Type"
				description="Severity tone for the playground alert (info, success, warning, danger)."
			>
				<Select
					id="alert-type"
					options={ALERT_TYPE_OPTIONS}
					value={demo.type}
					aria-label="Alert type"
					onChange={(value) => {
						const next = value;
						if (next === "info") {
							demo.setType("info");
							return;
						}
						if (next === "success") {
							demo.setType("success");
							return;
						}
						if (next === "warning") {
							demo.setType("warning");
							return;
						}
						if (next === "danger") {
							demo.setType("danger");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Title"
				description="Show or hide the bold title above the alert body."
			>
				<Toggle
					label="Show title"
					checked={demo.showTitle}
					onCheckedChange={demo.setShowTitle}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function ButtonCanvas() {
	const demo = useButtonDemo();
	const skinnedStyle = buttonStyle(demo.colors, demo.metrics);

	let playgroundLabel: string | undefined;
	let playgroundChildren: ReactNode = "Action";
	if (demo.size === "icon") {
		playgroundLabel = "Action";
		playgroundChildren = <X className="size-4" aria-hidden />;
	}

	return (
		<Canvas>
			<DemoRow label="Playground (skinned)">
				<Button
					variant={demo.variant}
					size={demo.size}
					disabled={demo.disabled}
					style={skinnedStyle}
					aria-label={playgroundLabel}
				>
					{playgroundChildren}
				</Button>
			</DemoRow>
			<DemoRow label="Variants">
				<Button variant="filled">Filled</Button>
				<Button variant="outlined">Outlined</Button>
				<Button variant="text">Text</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="danger">Danger</Button>
			</DemoRow>
			<DemoRow label="Sizes">
				<Button size="sm">Small</Button>
				<Button size="md">Medium</Button>
				<Button variant="ghost" size="icon" aria-label="Icon ghost">
					<X className="size-4" aria-hidden />
				</Button>
				<Button variant="danger" size="icon" aria-label="Icon danger">
					<X className="size-4" aria-hidden />
				</Button>
			</DemoRow>
		</Canvas>
	);
}

type ButtonVariant =
	"filled" | "outlined" | "text" | "ghost" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonColorSlot = "bg" | "fg";

interface ButtonColorState {
	bg: string;
	fg: string;
}

interface ButtonSizeMetrics {
	height: number | "";
	px: number | "";
	fz: number | "";
}

const BUTTON_COLOR_DEFAULTS: ButtonColorState = {
	bg: "#7dd3fc",
	fg: "#0f172a",
};

const BUTTON_METRICS_DEFAULTS: ButtonSizeMetrics = {
	height: "",
	px: "",
	fz: "",
};

const BUTTON_SWATCHES = [
	"#7dd3fc",
	"#bae6fd",
	"#38bdf8",
	"#0f172a",
	"#22c55e",
	"#052e16",
	"#ef4444",
	"#ffffff",
	"#161616",
];

interface ButtonDemoValue {
	variant: ButtonVariant;
	setVariant: (value: ButtonVariant) => void;
	size: ButtonSize;
	setSize: (value: ButtonSize) => void;
	disabled: boolean;
	setDisabled: (value: boolean) => void;
	colors: ButtonColorState;
	slot: ButtonColorSlot;
	setSlot: (slot: ButtonColorSlot) => void;
	setColor: (slot: ButtonColorSlot, hex: string) => void;
	resetColors: () => void;
	metrics: ButtonSizeMetrics;
	setMetric: (
		key: keyof ButtonSizeMetrics,
		value: number | undefined,
	) => void;
	resetMetrics: () => void;
}

const ButtonDemoContext = createContext<ButtonDemoValue | null>(null);

function useButtonDemo() {
	const value = useContext(ButtonDemoContext);
	if (value === null) {
		throw new Error("ButtonDemoProvider required");
	}

	return value;
}

function ButtonDemoProvider({ children }: { children: ReactNode }) {
	const [variant, setVariant] = useState<ButtonVariant>("filled");
	const [size, setSize] = useState<ButtonSize>("md");
	const [disabled, setDisabled] = useState(false);
	const [colors, setColors] = useState<ButtonColorState>(
		BUTTON_COLOR_DEFAULTS,
	);
	const [slot, setSlot] = useState<ButtonColorSlot>("bg");
	const [metrics, setMetrics] = useState<ButtonSizeMetrics>(
		BUTTON_METRICS_DEFAULTS,
	);

	return (
		<ButtonDemoContext.Provider
			value={{
				variant,
				setVariant,
				size,
				setSize,
				disabled,
				setDisabled,
				colors,
				slot,
				setSlot,
				setColor: (nextSlot, hex) => {
					setColors((current) => {
						return { ...current, [nextSlot]: hex };
					});
				},
				resetColors: () => {
					setColors(BUTTON_COLOR_DEFAULTS);
				},
				metrics,
				setMetric: (key, value) => {
					setMetrics((current) => {
						if (value === undefined) {
							return { ...current, [key]: "" };
						}
						return { ...current, [key]: value };
					});
				},
				resetMetrics: () => {
					setMetrics(BUTTON_METRICS_DEFAULTS);
				},
			}}
		>
			{children}
		</ButtonDemoContext.Provider>
	);
}

function buttonStyle(
	colors: ButtonColorState,
	metrics: ButtonSizeMetrics,
): CSSProperties & {
	"--button-bg": string;
	"--button-fg": string;
} {
	const style: CSSProperties & {
		"--button-bg": string;
		"--button-fg": string;
		"--button-height"?: string;
		"--button-px"?: string;
		"--button-fz"?: string;
	} = {
		"--button-bg": colors.bg,
		"--button-fg": colors.fg,
	};

	if (metrics.height !== "") {
		style["--button-height"] = `${String(metrics.height)}px`;
	}
	if (metrics.px !== "") {
		style["--button-px"] = `${String(metrics.px)}px`;
	}
	if (metrics.fz !== "") {
		style["--button-fz"] = `${String(metrics.fz)}px`;
	}

	return style;
}

const BUTTON_VARIANT_OPTIONS = [
	{ value: "filled", label: "Filled" },
	{ value: "outlined", label: "Outlined" },
	{ value: "text", label: "Text" },
	{ value: "ghost", label: "Ghost" },
	{ value: "secondary", label: "Secondary" },
	{ value: "danger", label: "Danger" },
];

const BUTTON_SIZE_OPTIONS = [
	{ value: "sm", label: "Small" },
	{ value: "md", label: "Medium" },
	{ value: "icon", label: "Icon" },
];

function ButtonKnobs() {
	const demo = useButtonDemo();
	const slotColor = demo.colors[demo.slot];

	let slotLabel = "Background";
	if (demo.slot === "fg") {
		slotLabel = "Foreground";
	}

	return (
		<RailPanel
			title="Button"
			description="Playground: --button-bg/fg + optional --button-height/px/fz (Mantine-style). Empty size fields = size preset. Ghost/secondary/danger ignore color skin."
		>
			<DemoRow
				label="Variant"
				description="Visual style applied to the playground button."
			>
				<Select
					id="button-variant"
					options={BUTTON_VARIANT_OPTIONS}
					value={demo.variant}
					aria-label="Button variant"
					onChange={(value) => {
						const next = value;
						if (next === "filled") {
							demo.setVariant("filled");
							return;
						}
						if (next === "outlined") {
							demo.setVariant("outlined");
							return;
						}
						if (next === "text") {
							demo.setVariant("text");
							return;
						}
						if (next === "ghost") {
							demo.setVariant("ghost");
							return;
						}
						if (next === "secondary") {
							demo.setVariant("secondary");
							return;
						}
						if (next === "danger") {
							demo.setVariant("danger");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Size"
				description="Preset fallbacks. Icon is square; custom height sets both axes."
			>
				<Select
					id="button-size"
					options={BUTTON_SIZE_OPTIONS}
					value={demo.size}
					aria-label="Button size"
					onChange={(value) => {
						const next = value;
						if (next === "sm") {
							demo.setSize("sm");
							return;
						}
						if (next === "md") {
							demo.setSize("md");
							return;
						}
						if (next === "icon") {
							demo.setSize("icon");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Height"
				description="--button-height in px. Leave empty for size preset."
			>
				<NumberInput
					aria-label="Button height px"
					placeholder="preset"
					min={24}
					max={96}
					value={demo.metrics.height}
					onValueChange={(value) => {
						demo.setMetric("height", value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Padding X"
				description="--button-px. Ignored for icon size (p-0)."
			>
				<NumberInput
					aria-label="Button padding x px"
					placeholder="preset"
					min={0}
					max={64}
					value={demo.metrics.px}
					onValueChange={(value) => {
						demo.setMetric("px", value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Font size"
				description="--button-fz in px. Leave empty for size preset."
			>
				<NumberInput
					aria-label="Button font size px"
					placeholder="preset"
					min={10}
					max={32}
					value={demo.metrics.fz}
					onValueChange={(value) => {
						demo.setMetric("fz", value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Disabled"
				description="Blocks interaction and dims the playground button."
			>
				<Toggle
					label="Disabled"
					checked={demo.disabled}
					onCheckedChange={demo.setDisabled}
				/>
			</DemoRow>
			<DemoRow label="Color slot">
				<Select
					aria-label="Button color slot"
					options={[
						{ value: "bg", label: "Background" },
						{ value: "fg", label: "Foreground" },
					]}
					value={demo.slot}
					onChange={(value) => {
						if (value === "bg") {
							demo.setSlot("bg");
							return;
						}
						if (value === "fg") {
							demo.setSlot("fg");
						}
					}}
				/>
			</DemoRow>
			<DemoRow label={slotLabel}>
				<ColorPicker
					key={demo.slot}
					label={slotLabel}
					value={slotColor}
					swatches={BUTTON_SWATCHES}
					onValueChange={(hex) => {
						demo.setColor(demo.slot, hex);
					}}
				/>
			</DemoRow>
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => {
						demo.resetColors();
					}}
				>
					Reset colors
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => {
						demo.resetMetrics();
					}}
				>
					Reset size
				</Button>
			</div>
		</RailPanel>
	);
}

function CardCanvas() {
	return (
		<Canvas>
			<DemoRow label="Medium">
				<Card className="w-full max-w-md">
					<div className="text-sm font-semibold text-foreground">
						Stack settings
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Group related fields and summary content in a bordered
						panel.
					</p>
				</Card>
			</DemoRow>
			<DemoRow label="Small">
				<Card size="sm" className="w-full max-w-md">
					<div className="text-sm text-foreground">
						Compact panel for dense inventory chrome.
					</div>
				</Card>
			</DemoRow>
		</Canvas>
	);
}

function CardKnobs() {
	return (
		<RailPanel
			title="Card"
			description="Non-interactive panel chrome. Compose actions inside with Button. Card itself is not a click target."
		/>
	);
}

type BadgeVariant =
	"default" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeDemoValue {
	variant: BadgeVariant;
	setVariant: (value: BadgeVariant) => void;
	size: BadgeSize;
	setSize: (value: BadgeSize) => void;
}

const BadgeDemoContext = createContext<BadgeDemoValue | null>(null);

function useBadgeDemo() {
	const value = useContext(BadgeDemoContext);
	if (value === null) {
		throw new Error("BadgeDemoProvider required");
	}

	return value;
}

function BadgeDemoProvider({ children }: { children: ReactNode }) {
	const [variant, setVariant] = useState<BadgeVariant>("primary");
	const [size, setSize] = useState<BadgeSize>("md");

	return (
		<BadgeDemoContext.Provider
			value={{ variant, setVariant, size, setSize }}
		>
			{children}
		</BadgeDemoContext.Provider>
	);
}

const BADGE_VARIANT_OPTIONS = [
	{ value: "default", label: "Default" },
	{ value: "primary", label: "Primary" },
	{ value: "success", label: "Success" },
	{ value: "warning", label: "Warning" },
	{ value: "danger", label: "Danger" },
	{ value: "info", label: "Info" },
];

const BADGE_SIZE_OPTIONS = [
	{ value: "sm", label: "Small" },
	{ value: "md", label: "Medium" },
];

function BadgeCanvas() {
	const demo = useBadgeDemo();

	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="Badge"
					description="Tone chips for inventory tables and headers."
				/>
				<Canvas>
					<DemoRow label="Playground">
						<Badge variant={demo.variant} size={demo.size}>
							Status
						</Badge>
					</DemoRow>
					<DemoRow label="Variants">
						<Badge>Default</Badge>
						<Badge variant="primary">Primary</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="warning">Warning</Badge>
						<Badge variant="danger">Danger</Badge>
						<Badge variant="info">Info</Badge>
					</DemoRow>
					<DemoRow label="Sizes">
						<Badge size="sm">Small</Badge>
						<Badge size="md">Medium</Badge>
					</DemoRow>
				</Canvas>
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="StatusBadge"
					description="Maps inventory statuses onto Badge tone variants."
				/>
				<Canvas>
					<DemoRow label="Statuses">
						<StatusBadge status="running">Running</StatusBadge>
						<StatusBadge status="pending">Pending</StatusBadge>
						<StatusBadge status="success">Healthy</StatusBadge>
						<StatusBadge status="warning">Degraded</StatusBadge>
						<StatusBadge status="danger">Failed</StatusBadge>
						<StatusBadge status="drifted">Drifted</StatusBadge>
					</DemoRow>
				</Canvas>
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="DeltaBadge"
					description="Change chip with visible +/-/= prefix so meaning is not color-only."
				/>
				<Canvas>
					<DemoRow label="Directions">
						<DeltaBadge direction="up" value="12.4%" />
						<DeltaBadge direction="down" value="3.1%" />
						<DeltaBadge direction="flat" value="0.0%" />
					</DemoRow>
				</Canvas>
			</section>
			<section className="flex flex-col">
				<DemoSectionHeader
					title="TxStatusBadge"
					description="On-chain / mempool status chips for activity lists."
				/>
				<Canvas>
					<DemoRow label="Statuses">
						<TxStatusBadge status="unconfirmed">
							Unconfirmed
						</TxStatusBadge>
						<TxStatusBadge status="confirming" confirmations={2}>
							Confirming (2)
						</TxStatusBadge>
						<TxStatusBadge status="confirmed">
							Confirmed
						</TxStatusBadge>
						<TxStatusBadge status="failed">Failed</TxStatusBadge>
					</DemoRow>
				</Canvas>
			</section>
		</div>
	);
}

function BadgeKnobs() {
	const demo = useBadgeDemo();

	return (
		<RailPanel
			title="Badge"
			description="Family showcase: Badge, StatusBadge, DeltaBadge, TxStatusBadge. Knobs apply to Badge playground only."
		>
			<DemoRow
				label="Variant"
				description="Semantic color for the playground badge."
			>
				<Select
					id="badge-variant"
					options={BADGE_VARIANT_OPTIONS}
					value={demo.variant}
					aria-label="Badge variant"
					onChange={(value) => {
						const next = value;
						if (next === "default") {
							demo.setVariant("default");
							return;
						}
						if (next === "primary") {
							demo.setVariant("primary");
							return;
						}
						if (next === "success") {
							demo.setVariant("success");
							return;
						}
						if (next === "warning") {
							demo.setVariant("warning");
							return;
						}
						if (next === "danger") {
							demo.setVariant("danger");
							return;
						}
						if (next === "info") {
							demo.setVariant("info");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Size"
				description="Padding and type scale for the playground badge."
			>
				<Select
					id="badge-size"
					options={BADGE_SIZE_OPTIONS}
					value={demo.size}
					aria-label="Badge size"
					onChange={(value) => {
						const next = value;
						if (next === "sm") {
							demo.setSize("sm");
							return;
						}
						if (next === "md") {
							demo.setSize("md");
						}
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

type LoadingVariant = "spinner" | "skeleton";
type LoadingSize = "sm" | "md" | "lg";

interface LoadingDemoValue {
	variant: LoadingVariant;
	setVariant: (value: LoadingVariant) => void;
	size: LoadingSize;
	setSize: (value: LoadingSize) => void;
	lines: number;
	setLines: (value: number) => void;
	showText: boolean;
	setShowText: (value: boolean) => void;
}

const LoadingDemoContext = createContext<LoadingDemoValue | null>(null);

function useLoadingDemo() {
	const value = useContext(LoadingDemoContext);
	if (value === null) {
		throw new Error("LoadingDemoProvider required");
	}

	return value;
}

function LoadingDemoProvider({ children }: { children: ReactNode }) {
	const [variant, setVariant] = useState<LoadingVariant>("spinner");
	const [size, setSize] = useState<LoadingSize>("md");
	const [lines, setLines] = useState(3);
	const [showText, setShowText] = useState(true);

	return (
		<LoadingDemoContext.Provider
			value={{
				variant,
				setVariant,
				size,
				setSize,
				lines,
				setLines,
				showText,
				setShowText,
			}}
		>
			{children}
		</LoadingDemoContext.Provider>
	);
}

const LOADING_VARIANT_OPTIONS = [
	{ value: "spinner", label: "Spinner" },
	{ value: "skeleton", label: "Skeleton" },
];

const LOADING_SIZE_OPTIONS = [
	{ value: "sm", label: "Small" },
	{ value: "md", label: "Medium" },
	{ value: "lg", label: "Large" },
];

function LoadingCanvas() {
	const demo = useLoadingDemo();

	let text: string | undefined;
	if (demo.showText) {
		text = "Deploying stack…";
	}

	return (
		<Canvas>
			<DemoRow label="Playground">
				<Loading
					variant={demo.variant}
					size={demo.size}
					lines={demo.lines}
					text={text}
					className="w-full max-w-sm"
					aria-label="Loading playground"
				/>
			</DemoRow>
			<DemoRow label="Spinner">
				<Loading size="sm" aria-label="Loading small" />
				<Loading size="md" text="Deploying stack…" />
				<Loading size="lg" aria-label="Loading large" />
			</DemoRow>
			<DemoRow label="Skeleton lines">
				<Loading variant="skeleton" size="sm" lines={2} />
				<Loading
					variant="skeleton"
					size="md"
					lines={3}
					className="w-full max-w-sm"
				/>
			</DemoRow>
			<DemoRow label="Skeleton shapes">
				<div className="flex w-full max-w-md flex-col gap-3">
					<Skeleton shape="title" />
					<Skeleton />
					<Skeleton className="w-1/2" />
					<div className="flex items-center gap-3">
						<Skeleton shape="avatar" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton />
							<Skeleton className="w-2/3" />
						</div>
					</div>
					<Skeleton shape="block" />
				</div>
			</DemoRow>
		</Canvas>
	);
}

function LoadingKnobs() {
	const demo = useLoadingDemo();

	return (
		<RailPanel
			title="Loading"
			description="Spinner, stacked skeleton lines, and single-bone Skeleton shapes for custom layouts."
		>
			<DemoRow
				label="Variant"
				description="Spinner for indeterminate wait; skeleton for content placeholders."
			>
				<Select
					id="loading-variant"
					options={LOADING_VARIANT_OPTIONS}
					value={demo.variant}
					aria-label="Loading variant"
					onChange={(value) => {
						const next = value;
						if (next === "spinner") {
							demo.setVariant("spinner");
							return;
						}
						if (next === "skeleton") {
							demo.setVariant("skeleton");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Size"
				description="Scale of the spinner ring or skeleton bone height."
			>
				<Select
					id="loading-size"
					options={LOADING_SIZE_OPTIONS}
					value={demo.size}
					aria-label="Loading size"
					onChange={(value) => {
						const next = value;
						if (next === "sm") {
							demo.setSize("sm");
							return;
						}
						if (next === "md") {
							demo.setSize("md");
							return;
						}
						if (next === "lg") {
							demo.setSize("lg");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Skeleton lines"
				description="Number of bone rows when variant is skeleton."
			>
				<NumberInput
					id="loading-lines"
					min={1}
					max={8}
					value={demo.lines}
					disabled={demo.variant !== "skeleton"}
					aria-label="Skeleton lines"
					onValueChange={(value) => {
						let next = 3;
						if (value !== undefined) {
							next = value;
						}
						demo.setLines(next);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Status text"
				description="Optional caption beside the indicator (for example Deploying stack)."
			>
				<Toggle
					label="Show status text"
					checked={demo.showText}
					onCheckedChange={demo.setShowText}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function EmptyStateCanvas() {
	return (
		<Canvas>
			<DemoRow label="Page / first-run">
				<EmptyState
					title="No stacks yet"
					action={<Button type="button">Create stack</Button>}
					className="w-full max-w-lg rounded-md border border-border"
				>
					Deploy your first stack to this environment.
				</EmptyState>
			</DemoRow>
			<DemoRow label="Compact (table cell)">
				<EmptyState
					size="sm"
					title="No results"
					icon={null}
					className="w-full max-w-lg rounded-md border border-border"
				>
					Try clearing filters or widening the search.
				</EmptyState>
			</DemoRow>
		</Canvas>
	);
}

function EmptyStateKnobs() {
	return (
		<RailPanel
			title="EmptyState"
			description="Settled empty / first-run chrome. Busy waits use Loading; wire size sm into DataTable empty."
		>
			<DemoRow label="Slots">
				<span className="text-sm text-muted-foreground">
					title · children · icon (null hides) · action (compose
					Button)
				</span>
			</DemoRow>
		</RailPanel>
	);
}

function ErrorStateCanvas() {
	return (
		<Canvas>
			<DemoRow label="Empty vs error">
				<div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
					<EmptyState
						title="No stacks yet"
						action={<Button type="button">Create stack</Button>}
						className="rounded-md border border-border"
					>
						Deploy your first stack to this environment.
					</EmptyState>
					<ErrorState
						action={<Button type="button">Retry</Button>}
						className="rounded-md border border-border"
					>
						The inventory request failed. Try again.
					</ErrorState>
				</div>
			</DemoRow>
			<DemoRow label="Forbidden">
				<ErrorState
					kind="forbidden"
					action={<Button type="button">Request access</Button>}
					className="w-full max-w-lg rounded-md border border-border"
				>
					You need permission to view this stack.
				</ErrorState>
			</DemoRow>
		</Canvas>
	);
}

function ErrorStateKnobs() {
	return (
		<RailPanel
			title="ErrorState"
			description="Failure / forbidden chrome. Soft titles by kind. Not EmptyState."
		>
			<DemoRow label="kind">
				<span className="text-sm text-muted-foreground">
					error (Unable to load) · forbidden (Access denied)
				</span>
			</DemoRow>
		</RailPanel>
	);
}

function CopyButtonCanvas() {
	return (
		<Canvas>
			<DemoRow label="Icon">
				<CopyButton value="arn:aws:cloudformation:us-east-1:123:stack/prod" />
				<span className="font-mono text-xs text-muted-foreground">
					arn:aws:cloudformation:us-east-1:123:stack/prod
				</span>
			</DemoRow>
			<DemoRow label="Labeled">
				<CopyButton
					value="stack-abc"
					size="sm"
					variant="outlined"
					label="Copy ID"
					copiedLabel="Copied"
				/>
			</DemoRow>
		</Canvas>
	);
}

function CopyButtonKnobs() {
	return (
		<RailPanel
			title="CopyButton"
			description="Clipboard write with brief copied state. Defaults to ghost icon Button."
		/>
	);
}

function AvatarCanvas() {
	return (
		<Canvas>
			<DemoRow label="Fallback initials">
				<Avatar alt="" fallback="WG" size="sm" />
				<Avatar alt="Wahid Group" fallback="WG" size="md" />
				<Avatar alt="" fallback="WG" size="lg" />
			</DemoRow>
		</Canvas>
	);
}

function AvatarKnobs() {
	return (
		<RailPanel
			title="Avatar"
			description="Identity chrome with image or initials fallback. Pass alt='' when the name is adjacent."
		/>
	);
}

function SeparatorCanvas() {
	return (
		<Canvas>
			<DemoRow label="Horizontal">
				<div className="w-full max-w-md space-y-3">
					<p className="text-sm text-foreground">Above</p>
					<Separator />
					<p className="text-sm text-foreground">Below</p>
				</div>
			</DemoRow>
			<DemoRow label="Vertical">
				<div className="flex h-8 items-center gap-3">
					<span className="text-sm">Start</span>
					<Separator orientation="vertical" />
					<span className="text-sm">End</span>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function SeparatorKnobs() {
	return (
		<RailPanel
			title="Separator"
			description="Native hr thematic break. Vertical sets aria-orientation."
		/>
	);
}

function TabsCanvas() {
	return (
		<Canvas>
			<Tabs defaultValue="overview" className="max-w-md">
				<TabsList aria-label="Demo tabs">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="logs" disabled>
						Logs
					</TabsTrigger>
				</TabsList>
				<TabsPanel
					value="overview"
					className="pt-4 text-sm text-foreground"
				>
					Overview panel body.
				</TabsPanel>
				<TabsPanel
					value="details"
					className="pt-4 text-sm text-foreground"
				>
					Details panel body.
				</TabsPanel>
				<TabsPanel
					value="logs"
					className="pt-4 text-sm text-foreground"
				>
					Logs panel body.
				</TabsPanel>
			</Tabs>
		</Canvas>
	);
}

function TabsKnobs() {
	return (
		<RailPanel
			title="Tabs"
			description="Underline tablist + panels. Arrow keys move selection."
		/>
	);
}

interface ModalDemoValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	closeOnBackdropClick: boolean;
	setCloseOnBackdropClick: (value: boolean) => void;
	showCloseButton: boolean;
	setShowCloseButton: (value: boolean) => void;
}

const ModalDemoContext = createContext<ModalDemoValue | null>(null);

function useModalDemo() {
	const value = useContext(ModalDemoContext);
	if (value === null) {
		throw new Error("ModalDemoProvider required");
	}

	return value;
}

function ModalDemoProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
	const [showCloseButton, setShowCloseButton] = useState(true);

	return (
		<ModalDemoContext.Provider
			value={{
				open,
				setOpen,
				closeOnBackdropClick,
				setCloseOnBackdropClick,
				showCloseButton,
				setShowCloseButton,
			}}
		>
			{children}
		</ModalDemoContext.Provider>
	);
}

function ModalCanvas() {
	const demo = useModalDemo();

	return (
		<Canvas>
			<Button
				variant="outlined"
				onClick={() => {
					demo.setOpen(true);
				}}
			>
				Open modal
			</Button>
			<Modal
				open={demo.open}
				title="Confirm apply"
				onOpenChange={demo.setOpen}
				closeOnBackdropClick={demo.closeOnBackdropClick}
				showCloseButton={demo.showCloseButton}
			>
				<p className="text-muted-foreground">
					Apply this change set to the selected stack? This may update
					resources in place.
				</p>
				<div className="mt-4 flex justify-end gap-2">
					<Button
						variant="outlined"
						onClick={() => {
							demo.setOpen(false);
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							demo.setOpen(false);
						}}
					>
						Apply
					</Button>
				</div>
			</Modal>
		</Canvas>
	);
}

function ModalKnobs() {
	const demo = useModalDemo();

	return (
		<RailPanel
			title="Modal"
			description="Dialog with backdrop, Esc, focus trap, and scroll lock."
		>
			<DemoRow
				label="Close on backdrop click"
				description="When on, clicking the dimmed overlay dismisses the modal."
			>
				<Toggle
					label="Enabled"
					checked={demo.closeOnBackdropClick}
					onCheckedChange={demo.setCloseOnBackdropClick}
				/>
			</DemoRow>
			<DemoRow
				label="Show close button"
				description="Shows the X control in the modal header."
			>
				<Toggle
					label="Enabled"
					checked={demo.showCloseButton}
					onCheckedChange={demo.setShowCloseButton}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface DrawerDemoValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	side: DrawerSide;
	setSide: (value: DrawerSide) => void;
	closeOnBackdropClick: boolean;
	setCloseOnBackdropClick: (value: boolean) => void;
	showCloseButton: boolean;
	setShowCloseButton: (value: boolean) => void;
	selectedId: string | null;
	setSelectedId: (value: string | null) => void;
}

const DrawerDemoContext = createContext<DrawerDemoValue | null>(null);

function useDrawerDemo() {
	const value = useContext(DrawerDemoContext);
	if (value === null) {
		throw new Error("DrawerDemoProvider required");
	}

	return value;
}

function DrawerDemoProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [side, setSide] = useState<DrawerSide>("right");
	const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
	const [showCloseButton, setShowCloseButton] = useState(true);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	return (
		<DrawerDemoContext.Provider
			value={{
				open,
				setOpen,
				side,
				setSide,
				closeOnBackdropClick,
				setCloseOnBackdropClick,
				showCloseButton,
				setShowCloseButton,
				selectedId,
				setSelectedId,
			}}
		>
			{children}
		</DrawerDemoContext.Provider>
	);
}

const DRAWER_ROWS = [
	{ id: "i-0a1b2c3d4e5f67890", label: "web-1 · running" },
	{ id: "i-09f8e7d6c5b4a3210", label: "web-2 · stopped" },
	{ id: "i-0123456789abcdef0", label: "worker-1 · running" },
] as const;

function DrawerCanvas() {
	const demo = useDrawerDemo();

	let drawerTitle = "Instance detail";
	if (demo.selectedId !== null) {
		drawerTitle = demo.selectedId;
	}

	let selectedDetail: ReactNode = null;
	if (demo.selectedId !== null) {
		selectedDetail = (
			<p className="mt-3 font-mono text-xs">{demo.selectedId}</p>
		);
	}

	return (
		<Canvas>
			<DemoRow label="Inventory">
				<ul className="w-full max-w-md divide-y divide-border rounded-md border border-border">
					{DRAWER_ROWS.map((row) => {
						return (
							<li key={row.id}>
								<Button
									type="button"
									variant="ghost"
									className="flex h-auto w-full justify-between gap-3 rounded-none px-3 py-2 text-left"
									onClick={() => {
										demo.setSelectedId(row.id);
										demo.setOpen(true);
									}}
								>
									<span className="font-medium text-foreground">
										{row.label}
									</span>
									<span className="font-mono text-xs text-muted-foreground">
										{row.id}
									</span>
								</Button>
							</li>
						);
					})}
				</ul>
			</DemoRow>
			<Drawer
				open={demo.open}
				title={drawerTitle}
				side={demo.side}
				onOpenChange={(next) => {
					demo.setOpen(next);
					if (!next) {
						demo.setSelectedId(null);
					}
				}}
				closeOnBackdropClick={demo.closeOnBackdropClick}
				showCloseButton={demo.showCloseButton}
			>
				<p className="text-muted-foreground">
					Side detail without leaving the list. Esc always dismisses;
					backdrop and header X follow the knobs.
				</p>
				{selectedDetail}
				<div className="mt-4 flex justify-end">
					<Button
						variant="outlined"
						onClick={() => {
							demo.setOpen(false);
							demo.setSelectedId(null);
						}}
					>
						Close
					</Button>
				</div>
			</Drawer>
		</Canvas>
	);
}

function DrawerKnobs() {
	const demo = useDrawerDemo();

	return (
		<RailPanel
			title="Drawer"
			description="Edge sheet dialog (APG modal). Esc always closes. Open from a list row; side top|right|bottom|left."
		>
			<DemoRow label="Side" description="Which edge the sheet docks to.">
				<Select
					aria-label="Drawer side"
					value={demo.side}
					onChange={(value) => {
						const next = value;
						if (next === "left") {
							demo.setSide("left");
							return;
						}
						if (next === "right") {
							demo.setSide("right");
							return;
						}
						if (next === "top") {
							demo.setSide("top");
							return;
						}
						if (next === "bottom") {
							demo.setSide("bottom");
						}
					}}
					options={[
						{ value: "right", label: "Right" },
						{ value: "left", label: "Left" },
						{ value: "top", label: "Top" },
						{ value: "bottom", label: "Bottom" },
					]}
				/>
			</DemoRow>
			<DemoRow
				label="Close on backdrop click"
				description="When on, clicking the dimmed overlay dismisses the drawer. Esc and the in-body Close still work when off."
			>
				<Toggle
					label="Enabled"
					checked={demo.closeOnBackdropClick}
					onCheckedChange={demo.setCloseOnBackdropClick}
				/>
			</DemoRow>
			<DemoRow
				label="Show close button"
				description="Shows the X control in the drawer header. Esc and the in-body Close still work when off."
			>
				<Toggle
					label="Enabled"
					checked={demo.showCloseButton}
					onCheckedChange={demo.setShowCloseButton}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface ConfirmDemoValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	variant: "danger" | "filled";
	setVariant: (value: "danger" | "filled") => void;
	requirePhrase: boolean;
	setRequirePhrase: (value: boolean) => void;
	closeOnBackdropClick: boolean;
	setCloseOnBackdropClick: (value: boolean) => void;
}

const ConfirmDemoContext = createContext<ConfirmDemoValue | null>(null);

function useConfirmDemo() {
	const value = useContext(ConfirmDemoContext);
	if (value === null) {
		throw new Error("ConfirmDemoProvider required");
	}

	return value;
}

function ConfirmDemoProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [variant, setVariant] = useState<"danger" | "filled">("danger");
	const [requirePhrase, setRequirePhrase] = useState(true);
	const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);

	return (
		<ConfirmDemoContext.Provider
			value={{
				open,
				setOpen,
				variant,
				setVariant,
				requirePhrase,
				setRequirePhrase,
				closeOnBackdropClick,
				setCloseOnBackdropClick,
			}}
		>
			{children}
		</ConfirmDemoContext.Provider>
	);
}

const CONFIRM_VARIANT_OPTIONS = [
	{ value: "danger", label: "Danger" },
	{ value: "filled", label: "Filled" },
];

function ConfirmCanvas() {
	const demo = useConfirmDemo();

	let confirmPhrase: string | undefined;
	if (demo.requirePhrase) {
		confirmPhrase = "prod-api";
	}

	return (
		<Canvas>
			<Button
				variant="danger"
				onClick={() => {
					demo.setOpen(true);
				}}
			>
				Destroy stack
			</Button>
			<ConfirmDialog
				open={demo.open}
				title="Destroy stack"
				description="This permanently deletes prod-api and its resources."
				confirmPhrase={confirmPhrase}
				confirmLabel="Destroy"
				variant={demo.variant}
				closeOnBackdropClick={demo.closeOnBackdropClick}
				onOpenChange={demo.setOpen}
				onConfirm={() => {
					demo.setOpen(false);
				}}
			/>
		</Canvas>
	);
}

function ConfirmKnobs() {
	const demo = useConfirmDemo();

	return (
		<RailPanel
			title="ConfirmDialog"
			description="Modal confirm with optional typed phrase for destroy."
		>
			<DemoRow
				label="Confirm tone"
				description="Danger for destructive confirms; filled for neutral confirms."
			>
				<Select
					id="confirm-variant"
					options={CONFIRM_VARIANT_OPTIONS}
					value={demo.variant}
					aria-label="Confirm tone"
					onChange={(value) => {
						const next = value;
						if (next === "danger") {
							demo.setVariant("danger");
							return;
						}
						if (next === "filled") {
							demo.setVariant("filled");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Require typed phrase"
				description="Confirm stays disabled until the user types prod-api."
			>
				<Toggle
					label="Enabled"
					checked={demo.requirePhrase}
					onCheckedChange={demo.setRequirePhrase}
				/>
			</DemoRow>
			<DemoRow
				label="Close on backdrop click"
				description="When on, clicking the dimmed overlay dismisses the dialog."
			>
				<Toggle
					label="Enabled"
					checked={demo.closeOnBackdropClick}
					onCheckedChange={demo.setCloseOnBackdropClick}
				/>
			</DemoRow>
		</RailPanel>
	);
}

type TooltipSide = "top" | "bottom";

interface TooltipDemoValue {
	side: TooltipSide;
	setSide: (value: TooltipSide) => void;
	delayMs: number;
	setDelayMs: (value: number) => void;
	disabled: boolean;
	setDisabled: (value: boolean) => void;
}

const TooltipDemoContext = createContext<TooltipDemoValue | null>(null);

function useTooltipDemo() {
	const value = useContext(TooltipDemoContext);
	if (value === null) {
		throw new Error("TooltipDemoProvider required");
	}

	return value;
}

function TooltipDemoProvider({ children }: { children: ReactNode }) {
	const [side, setSide] = useState<TooltipSide>("top");
	const [delayMs, setDelayMs] = useState(200);
	const [disabled, setDisabled] = useState(false);

	return (
		<TooltipDemoContext.Provider
			value={{
				side,
				setSide,
				delayMs,
				setDelayMs,
				disabled,
				setDisabled,
			}}
		>
			{children}
		</TooltipDemoContext.Provider>
	);
}

const TOOLTIP_SIDE_OPTIONS = [
	{ value: "top", label: "Top" },
	{ value: "bottom", label: "Bottom" },
];

function TooltipCanvas() {
	const demo = useTooltipDemo();

	return (
		<Canvas>
			<DemoRow label="Playground">
				<Tooltip
					content="arn:aws:cloudformation:us-east-1:123:stack/prod-api"
					side={demo.side}
					delayMs={demo.delayMs}
					disabled={demo.disabled}
				>
					<Button variant="outlined">Stack ARN</Button>
				</Tooltip>
			</DemoRow>
			<DemoRow label="Disabled trigger">
				<Tooltip content="Disabled until plan finishes" side="bottom">
					<Button disabled>Apply</Button>
				</Tooltip>
			</DemoRow>
		</Canvas>
	);
}

function TooltipKnobs() {
	const demo = useTooltipDemo();

	return (
		<RailPanel
			title="Tooltip"
			description="Hover or focus to reveal truncated IDs and hints."
		>
			<DemoRow
				label="Placement"
				description="Preferred side relative to the trigger (flips if needed)."
			>
				<Select
					id="tooltip-side"
					options={TOOLTIP_SIDE_OPTIONS}
					value={demo.side}
					aria-label="Tooltip side"
					onChange={(value) => {
						const next = value;
						if (next === "top") {
							demo.setSide("top");
							return;
						}
						if (next === "bottom") {
							demo.setSide("bottom");
						}
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Delay"
				description="Milliseconds to wait before showing on hover or focus."
			>
				<NumberInput
					id="tooltip-delay"
					min={0}
					step={50}
					value={demo.delayMs}
					aria-label="Tooltip delay"
					onValueChange={(value) => {
						let next = 0;
						if (value !== undefined) {
							next = value;
						}
						demo.setDelayMs(next);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Disabled"
				description="When on, the playground tooltip never opens."
			>
				<Toggle
					label="Tooltip disabled"
					checked={demo.disabled}
					onCheckedChange={demo.setDisabled}
				/>
			</DemoRow>
		</RailPanel>
	);
}

const ActionMenuDemoContext = createContext<{
	lastAction: string;
	setLastAction: (value: string) => void;
} | null>(null);

function useActionMenuDemo() {
	const value = useContext(ActionMenuDemoContext);
	if (value === null) {
		throw new Error("ActionMenuDemoProvider required");
	}

	return value;
}

function ActionMenuDemoProvider({ children }: { children: ReactNode }) {
	const [lastAction, setLastAction] = useState("none");

	return (
		<ActionMenuDemoContext.Provider value={{ lastAction, setLastAction }}>
			{children}
		</ActionMenuDemoContext.Provider>
	);
}

function ActionMenuCanvas() {
	const demo = useActionMenuDemo();

	return (
		<Canvas>
			<DemoRow label="Open">
				<ActionMenu
					label="Stack"
					items={[
						{
							key: "view",
							label: "View events",
							onSelect: () => {
								demo.setLastAction("view");
							},
						},
						{
							key: "update",
							label: "Update",
							onSelect: () => {
								demo.setLastAction("update");
							},
						},
						{ key: "div-1", type: "divider" },
						{
							key: "destroy",
							label: "Destroy",
							variant: "danger",
							onSelect: () => {
								demo.setLastAction("destroy");
							},
						},
					]}
				/>
				<span className="text-sm text-muted-foreground">
					Last: {demo.lastAction}
				</span>
			</DemoRow>
		</Canvas>
	);
}

function ActionMenuKnobs() {
	return (
		<RailPanel
			title="ActionMenu"
			description="Portaled row actions with keyboard menu navigation."
		/>
	);
}

const INITIAL_PROGRESS_TASKS: ProgressTask[] = [
	{
		id: "plan",
		label: "terraform plan",
		value: 0,
		status: "pending",
	},
	{
		id: "apply",
		label: "terraform apply",
		value: 0,
		status: "pending",
	},
	{
		id: "health",
		label: "health checks",
		value: 0,
		status: "pending",
	},
];

interface ProgressJobDemoValue {
	job: ProgressJob;
	size: MeterSize;
	setSize: (value: MeterSize) => void;
	indeterminate: boolean;
	setIndeterminate: (value: boolean) => void;
	showLabel: boolean;
	setShowLabel: (value: boolean) => void;
	busy: boolean;
	startJob: () => Promise<void>;
	stopJob: () => Promise<void>;
	resetJob: () => Promise<void>;
}

const ProgressJobDemoContext = createContext<ProgressJobDemoValue | null>(null);

function useProgressJobDemo() {
	const value = useContext(ProgressJobDemoContext);
	if (value === null) {
		throw new Error("ProgressJobDemoProvider required");
	}

	return value;
}

function ProgressJobDemoProvider({ children }: { children: ReactNode }) {
	const [job, setJob] = useState<ProgressJob>({
		value: 0,
		max: 100,
		streaming: false,
		label: "Deploy job",
	});
	const [size, setSize] = useState<MeterSize>("md");
	const [indeterminate, setIndeterminate] = useState(false);
	const [showLabel, setShowLabel] = useState(true);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		void resetProgressJob()
			.then((next) => {
				setJob(next);
			})
			.catch(() => {
				void getProgressJob()
					.then((next) => {
						setJob(next);
					})
					.catch(() => {
						/* keep seed */
					});
			});
	}, []);

	useEffect(() => {
		if (!job.streaming) {
			return;
		}

		const timer = window.setInterval(() => {
			void getProgressJob()
				.then((next) => {
					setJob(next);
				})
				.catch(() => {
					/* ignore poll errors */
				});
		}, 300);

		return () => {
			window.clearInterval(timer);
		};
	}, [job.streaming]);

	const startJob = async () => {
		setBusy(true);
		try {
			const next = await startProgressJob();
			setJob(next);
		} finally {
			setBusy(false);
		}
	};

	const stopJob = async () => {
		setBusy(true);
		try {
			const next = await stopProgressJob();
			setJob(next);
		} finally {
			setBusy(false);
		}
	};

	const resetJob = async () => {
		setBusy(true);
		try {
			const next = await resetProgressJob();
			setJob(next);
		} finally {
			setBusy(false);
		}
	};

	return (
		<ProgressJobDemoContext.Provider
			value={{
				job,
				size,
				setSize,
				indeterminate,
				setIndeterminate,
				showLabel,
				setShowLabel,
				busy,
				startJob,
				stopJob,
				resetJob,
			}}
		>
			{children}
		</ProgressJobDemoContext.Provider>
	);
}

function ProgressJobControls() {
	const demo = useProgressJobDemo();

	return (
		<div className="flex flex-wrap gap-2">
			<Button
				type="button"
				variant="filled"
				size="sm"
				disabled={demo.busy || demo.job.streaming}
				onClick={() => {
					void demo.startJob();
				}}
			>
				Start
			</Button>
			<Button
				type="button"
				variant="outlined"
				size="sm"
				disabled={demo.busy || !demo.job.streaming}
				onClick={() => {
					void demo.stopJob();
				}}
			>
				Stop
			</Button>
			<Button
				type="button"
				variant="outlined"
				size="sm"
				disabled={demo.busy}
				onClick={() => {
					void demo.resetJob();
				}}
			>
				Reset
			</Button>
		</div>
	);
}

function ProgressJobKnobsFields({
	includeLabel = false,
}: {
	includeLabel?: boolean;
}) {
	const demo = useProgressJobDemo();

	let labelRow: ReactNode = null;
	if (includeLabel) {
		labelRow = (
			<DemoRow
				label="Label"
				description="Optional visible label above ProgressBar."
			>
				<Toggle
					checked={demo.showLabel}
					label="Show label"
					onCheckedChange={demo.setShowLabel}
				/>
			</DemoRow>
		);
	}

	return (
		<>
			<DemoRow
				label="Size"
				description="Track / ring size variant (sm | md | lg)."
			>
				<Select
					id="progress-job-size"
					options={METER_SIZE_OPTIONS}
					value={demo.size}
					onChange={(value) => {
						demo.setSize(parseMeterSize(value));
					}}
					aria-label="Size"
				/>
			</DemoRow>
			<DemoRow
				label="Indeterminate"
				description="Omit value so the control shows busy / unknown fraction."
			>
				<Toggle
					checked={demo.indeterminate}
					label="Force indeterminate"
					onCheckedChange={demo.setIndeterminate}
				/>
			</DemoRow>
			{labelRow}
		</>
	);
}

function ProgressBarCanvas() {
	const demo = useProgressJobDemo();
	const [tasks, setTasks] = useState<ProgressTask[]>(INITIAL_PROGRESS_TASKS);
	const [running, setRunning] = useState(false);

	useEffect(() => {
		if (!running) {
			return;
		}

		const timer = window.setInterval(() => {
			setTasks((prev) => {
				return prev.map((task, index) => {
					if (task.status === "complete" || task.status === "error") {
						return task;
					}

					let value = task.value;
					value ??= 0;
					const step = 4 + index * 3;
					value += step;
					if (value >= 100) {
						return {
							...task,
							value: 100,
							status: "complete" as const,
						};
					}
					return {
						...task,
						value,
						status: "running" as const,
					};
				});
			});
		}, 200);

		return () => {
			window.clearInterval(timer);
		};
	}, [running]);

	useEffect(() => {
		if (!running) {
			return;
		}
		const allDone = tasks.every((task) => {
			return task.status === "complete" || task.status === "error";
		});
		if (allDone) {
			setRunning(false);
		}
	}, [tasks, running]);

	let apiValue: number | undefined = demo.job.value;
	if (demo.indeterminate) {
		apiValue = undefined;
	}

	let apiLabel: ReactNode = undefined;
	if (demo.showLabel) {
		if (demo.indeterminate) {
			apiLabel = `${demo.job.label}…`;
		} else {
			apiLabel = `${demo.job.label}… ${String(demo.job.value)}%`;
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="API playground"
					description="Nest deploy job drives ProgressBar and CircularProgress. Knobs set size / indeterminate / bar label."
					apiDriven
				/>
				<Canvas>
					<div className="flex w-full max-w-md flex-col gap-4">
						<ProgressBar
							aria-label={demo.job.label}
							value={apiValue}
							max={demo.job.max}
							size={demo.size}
							label={apiLabel}
						/>
						<div className="flex items-center gap-4">
							<CircularProgress
								aria-label={demo.job.label}
								value={apiValue}
								max={demo.job.max}
								size={demo.size}
							/>
							<p className="text-sm text-muted-foreground">
								value={String(demo.job.value)} /{" "}
								{String(demo.job.max)} · streaming=
								{String(demo.job.streaming)}
							</p>
						</div>
						<ProgressJobControls />
					</div>
				</Canvas>
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="ProgressBar"
					description="Fixed determinate / indeterminate bars for visual reference."
				/>
				<Canvas>
					<DemoRow label="Determinate">
						<div className="flex w-full max-w-md flex-col gap-4">
							<ProgressBar
								aria-label="Deploy progress"
								value={35}
								label="Applying stack… 35%"
							/>
							<ProgressBar
								aria-label="Upload progress"
								value={80}
								size="sm"
							/>
							<ProgressBar
								aria-label="Migration progress"
								value={100}
								size="lg"
								label="Complete"
							/>
						</div>
					</DemoRow>
					<DemoRow label="Indeterminate">
						<div className="w-full max-w-md">
							<ProgressBar
								aria-label="Syncing"
								label="Waiting for plan…"
							/>
						</div>
					</DemoRow>
				</Canvas>
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="CircularProgress"
					description="Compact progressbar ring. Fixed size ladder + indeterminate pulse."
				/>
				<Canvas>
					<DemoRow label="Determinate">
						<div className="flex flex-wrap items-center gap-6">
							<CircularProgress
								aria-label="Upload"
								value={35}
								size="sm"
							/>
							<CircularProgress aria-label="Sync" value={70} />
							<CircularProgress
								aria-label="Apply"
								value={100}
								size="lg"
							/>
						</div>
					</DemoRow>
					<DemoRow label="Indeterminate">
						<CircularProgress aria-label="Working" />
					</DemoRow>
				</Canvas>
			</section>
			<section className="flex flex-col">
				<DemoSectionHeader
					title="ProgressGroup"
					description="Local staggered lanes. Overall fraction is the mean of task values."
				/>
				<Canvas>
					<div className="flex w-full max-w-md flex-col gap-3">
						<ProgressGroup
							aria-label="Stack deploy"
							label="Overall deploy"
							tasks={tasks}
						/>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="filled"
								size="sm"
								disabled={running}
								onClick={() => {
									setTasks([
										{
											id: "plan",
											label: "terraform plan",
											value: 0,
											status: "running",
										},
										{
											id: "apply",
											label: "terraform apply",
											value: 0,
											status: "running",
										},
										{
											id: "health",
											label: "health checks",
											value: 0,
											status: "running",
										},
									]);
									setRunning(true);
								}}
							>
								Start group
							</Button>
							<Button
								variant="outlined"
								size="sm"
								onClick={() => {
									setRunning(false);
									setTasks(INITIAL_PROGRESS_TASKS);
								}}
							>
								Reset group
							</Button>
						</div>
					</div>
				</Canvas>
			</section>
		</div>
	);
}

function ProgressBarKnobs() {
	return (
		<RailPanel
			title="Progress"
			description="ProgressBar, CircularProgress, and ProgressGroup. Nest job + size/indeterminate knobs drive the shared playground; label applies to the bar only."
		>
			<ProgressJobKnobsFields includeLabel />
		</RailPanel>
	);
}

interface QuotaMeterDemoValue {
	quota: QuotaSnapshot;
	size: MeterSize;
	setSize: (value: MeterSize) => void;
	showLabel: boolean;
	setShowLabel: (value: boolean) => void;
	showValueText: boolean;
	setShowValueText: (value: boolean) => void;
	busy: boolean;
	consume: (amount: number) => Promise<void>;
	release: (amount: number) => Promise<void>;
	reset: () => Promise<void>;
}

const QuotaMeterDemoContext = createContext<QuotaMeterDemoValue | null>(null);

function useQuotaMeterDemo() {
	const value = useContext(QuotaMeterDemoContext);
	if (value === null) {
		throw new Error("QuotaMeterDemoProvider required");
	}

	return value;
}

function QuotaMeterDemoProvider({ children }: { children: ReactNode }) {
	const [quota, setQuota] = useState<QuotaSnapshot>({
		used: 42,
		max: 100,
		label: "Stacks",
	});
	const [size, setSize] = useState<MeterSize>("md");
	const [showLabel, setShowLabel] = useState(true);
	const [showValueText, setShowValueText] = useState(true);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		void getQuota()
			.then((next) => {
				setQuota(next);
			})
			.catch(() => {
				/* keep seed */
			});
	}, []);

	const consume = async (amount: number) => {
		setBusy(true);
		try {
			const next = await consumeQuota(amount);
			setQuota(next);
		} finally {
			setBusy(false);
		}
	};

	const release = async (amount: number) => {
		setBusy(true);
		try {
			const next = await releaseQuota(amount);
			setQuota(next);
		} finally {
			setBusy(false);
		}
	};

	const reset = async () => {
		setBusy(true);
		try {
			const next = await resetQuota();
			setQuota(next);
		} finally {
			setBusy(false);
		}
	};

	return (
		<QuotaMeterDemoContext.Provider
			value={{
				quota,
				size,
				setSize,
				showLabel,
				setShowLabel,
				showValueText,
				setShowValueText,
				busy,
				consume,
				release,
				reset,
			}}
		>
			{children}
		</QuotaMeterDemoContext.Provider>
	);
}

function QuotaMeterControls() {
	const demo = useQuotaMeterDemo();

	return (
		<div className="flex flex-wrap gap-2">
			<Button
				type="button"
				variant="filled"
				size="sm"
				disabled={demo.busy}
				onClick={() => {
					void demo.consume(10);
				}}
			>
				+10
			</Button>
			<Button
				type="button"
				variant="outlined"
				size="sm"
				disabled={demo.busy}
				onClick={() => {
					void demo.release(10);
				}}
			>
				−10
			</Button>
			<Button
				type="button"
				variant="outlined"
				size="sm"
				disabled={demo.busy}
				onClick={() => {
					void demo.reset();
				}}
			>
				Reset
			</Button>
		</div>
	);
}

function QuotaMeterCanvas() {
	const demo = useQuotaMeterDemo();

	let label: ReactNode = undefined;
	if (demo.showLabel) {
		label = demo.quota.label;
	}

	let valueText: string | undefined;
	if (demo.showValueText) {
		valueText = `${String(demo.quota.used)} / ${String(demo.quota.max)}`;
	}

	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="API playground"
					description="Nest soft-limit quota. Consume / release / reset mutate used."
					apiDriven
				/>
				<Canvas>
					<div className="flex w-full max-w-md flex-col gap-3">
						<QuotaMeter
							aria-label={demo.quota.label}
							value={demo.quota.used}
							max={demo.quota.max}
							size={demo.size}
							label={label}
							valueText={valueText}
						/>
						<QuotaMeterControls />
						<p className="text-sm text-muted-foreground">
							used={String(demo.quota.used)} /{" "}
							{String(demo.quota.max)}
						</p>
					</div>
				</Canvas>
			</section>
			<section className="flex flex-col">
				<DemoSectionHeader
					title="Static samples"
					description="Fixed soft-limit gauges for visual reference."
				/>
				<Canvas>
					<div className="flex w-full max-w-md flex-col gap-6">
						<QuotaMeter
							aria-label="Stack quota"
							value={42}
							max={100}
							label="Stacks"
							valueText="42 / 100"
						/>
						<QuotaMeter
							aria-label="API quota"
							value={90}
							max={100}
							size="sm"
							label="API calls"
							valueText="90%"
						/>
					</div>
				</Canvas>
			</section>
		</div>
	);
}

function QuotaMeterKnobs() {
	const demo = useQuotaMeterDemo();

	return (
		<RailPanel
			title="QuotaMeter"
			description="role=meter soft limits. Use ProgressBar / CircularProgress for tasks."
		>
			<DemoRow label="Size" description="Track thickness (sm | md | lg).">
				<Select
					id="quota-meter-size"
					options={METER_SIZE_OPTIONS}
					value={demo.size}
					onChange={(value) => {
						demo.setSize(parseMeterSize(value));
					}}
					aria-label="Size"
				/>
			</DemoRow>
			<DemoRow
				label="Label"
				description="Optional caption above the meter track."
			>
				<Toggle
					checked={demo.showLabel}
					label="Show label"
					onCheckedChange={demo.setShowLabel}
				/>
			</DemoRow>
			<DemoRow
				label="valueText"
				description="Visible fraction + aria-valuetext when set."
			>
				<Toggle
					checked={demo.showValueText}
					label="Show valueText"
					onCheckedChange={demo.setShowValueText}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function VisuallyHiddenCanvas() {
	return (
		<Canvas>
			<DemoRow label="Accessible name enrichment">
				<Button type="button">
					Destroy
					<VisuallyHidden> stack prod-api</VisuallyHidden>
				</Button>
			</DemoRow>
		</Canvas>
	);
}

function VisuallyHiddenKnobs() {
	return (
		<RailPanel
			title="VisuallyHidden"
			description="Clip-path hide. Keeps text in the accessibility tree."
		/>
	);
}

function PopoverCanvas() {
	const demo = usePopoverDemo();

	let title: string | undefined;
	if (demo.showTitle) {
		title = demo.title;
	}

	return (
		<Canvas>
			<DemoRow label="Interactive panel">
				<Popover
					trigger="Region help"
					title={title}
					open={demo.open}
					onOpenChange={demo.setOpen}
				>
					<p className="text-muted-foreground">
						Pick the region closest to your users. Changing region
						does not move existing stacks.
					</p>
					<div className="mt-3">
						<Button type="button" size="sm" variant="secondary">
							Open docs
						</Button>
					</div>
				</Popover>
			</DemoRow>
			<p className="text-sm text-muted-foreground">
				open={String(demo.open)}
			</p>
		</Canvas>
	);
}

function PopoverKnobs() {
	const demo = usePopoverDemo();

	return (
		<RailPanel
			title="Popover"
			description="Non-modal dialog. Esc and outside press dismiss. No focus trap."
		>
			<DemoRow
				label="Open"
				description="Controlled open. Trigger / Esc / outside also toggle."
			>
				<Toggle
					checked={demo.open}
					label="Open"
					onCheckedChange={demo.setOpen}
				/>
			</DemoRow>
			<DemoRow
				label="Title"
				description="Optional dialog heading (aria-labelledby)."
			>
				<Toggle
					checked={demo.showTitle}
					label="Show title"
					onCheckedChange={demo.setShowTitle}
				/>
				<Input
					id="popover-title"
					value={demo.title}
					disabled={!demo.showTitle}
					aria-label="Popover title"
					onChange={(event) => {
						demo.setTitle(event.target.value);
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface PopoverDemoValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	title: string;
	setTitle: (value: string) => void;
	showTitle: boolean;
	setShowTitle: (value: boolean) => void;
}

const PopoverDemoContext = createContext<PopoverDemoValue | null>(null);

function usePopoverDemo() {
	const value = useContext(PopoverDemoContext);
	if (value === null) {
		throw new Error("PopoverDemoProvider required");
	}

	return value;
}

function PopoverDemoProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("Regions");
	const [showTitle, setShowTitle] = useState(true);

	return (
		<PopoverDemoContext.Provider
			value={{
				open,
				setOpen,
				title,
				setTitle,
				showTitle,
				setShowTitle,
			}}
		>
			{children}
		</PopoverDemoContext.Provider>
	);
}

interface CommandPaletteDemoValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	items: CommandItem[];
	lastId: string;
	setLastId: (id: string) => void;
	placeholder: string;
	setPlaceholder: (value: string) => void;
	title: string;
	setTitle: (value: string) => void;
	emptyText: string;
	setEmptyText: (value: string) => void;
	busy: boolean;
	addItem: () => Promise<void>;
	removeSelected: () => Promise<void>;
	resetItems: () => Promise<void>;
}

const CommandPaletteDemoContext = createContext<CommandPaletteDemoValue | null>(
	null,
);

function useCommandPaletteDemo() {
	const value = useContext(CommandPaletteDemoContext);
	if (value === null) {
		throw new Error("CommandPaletteDemoProvider required");
	}

	return value;
}

function CommandPaletteDemoProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState<CommandItem[]>([]);
	const [lastId, setLastId] = useState("");
	const [placeholder, setPlaceholder] = useState("Type a command...");
	const [title, setTitle] = useState("Command palette");
	const [emptyText, setEmptyText] = useState("No matching commands");
	const [busy, setBusy] = useState(false);
	const customSeqRef = useRef(1);

	async function refreshItems() {
		const result = await listCommands();
		setItems(result.items);
	}

	useEffect(() => {
		void refreshItems().catch(() => {
			/* keep empty until API ready */
		});
	}, []);

	const addItem = async () => {
		setBusy(true);
		const seq = customSeqRef.current;
		customSeqRef.current = seq + 1;
		const id = `custom-${String(seq)}`;
		try {
			await addCommand({
				id,
				label: `Custom command ${String(seq)}`,
				group: "Actions",
				keywords: ["demo"],
			});
			await refreshItems();
		} finally {
			setBusy(false);
		}
	};

	const removeSelected = async () => {
		if (lastId.length === 0) {
			return;
		}

		setBusy(true);
		try {
			await removeCommand(lastId);
			setLastId("");
			await refreshItems();
		} finally {
			setBusy(false);
		}
	};

	const resetItems = async () => {
		setBusy(true);
		try {
			await resetCommands();
			setLastId("");
			customSeqRef.current = 1;
			await refreshItems();
		} finally {
			setBusy(false);
		}
	};

	return (
		<CommandPaletteDemoContext.Provider
			value={{
				open,
				setOpen,
				items,
				lastId,
				setLastId,
				placeholder,
				setPlaceholder,
				title,
				setTitle,
				emptyText,
				setEmptyText,
				busy,
				addItem,
				removeSelected,
				resetItems,
			}}
		>
			{children}
		</CommandPaletteDemoContext.Provider>
	);
}

function CommandPaletteCanvas() {
	const demo = useCommandPaletteDemo();

	let lastLabel = "None yet";
	if (demo.lastId.length > 0) {
		lastLabel = demo.lastId;
	}

	const paletteItems: CommandPaletteItem[] = demo.items.map((item) => {
		const next: CommandPaletteItem = {
			id: item.id,
			label: item.label,
		};
		if (item.group !== undefined) {
			next.group = item.group;
		}
		if (item.keywords !== undefined) {
			next.keywords = item.keywords;
		}
		if (item.disabled !== undefined) {
			next.disabled = item.disabled;
		}

		return next;
	});

	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col">
				<DemoSectionHeader
					title="API playground"
					description="Nest /v1/commands catalog. Palette filters locally; Add / Remove / Reset mutate the list."
					apiDriven
				/>
				<Canvas>
					<DemoRow label="Open palette">
						<Button
							type="button"
							onClick={() => {
								demo.setOpen(true);
							}}
						>
							Open command palette
						</Button>
					</DemoRow>
					<DemoRow label="Catalog">
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="filled"
								size="sm"
								disabled={demo.busy}
								onClick={() => {
									void demo.addItem();
								}}
							>
								Add
							</Button>
							<Button
								type="button"
								variant="outlined"
								size="sm"
								disabled={demo.busy || demo.lastId.length === 0}
								onClick={() => {
									void demo.removeSelected();
								}}
							>
								Remove last
							</Button>
							<Button
								type="button"
								variant="outlined"
								size="sm"
								disabled={demo.busy}
								onClick={() => {
									void demo.resetItems();
								}}
							>
								Reset
							</Button>
						</div>
					</DemoRow>
					<DemoRow label="Last selection">{lastLabel}</DemoRow>
					<p className="text-sm text-muted-foreground">
						{String(demo.items.length)} commands loaded
					</p>
					<CommandPalette
						open={demo.open}
						onOpenChange={demo.setOpen}
						items={paletteItems}
						placeholder={demo.placeholder}
						title={demo.title}
						emptyText={demo.emptyText}
						onSelect={(item) => {
							demo.setLastId(item.id);
						}}
					/>
				</Canvas>
			</section>
		</div>
	);
}

function CommandPaletteKnobs() {
	const demo = useCommandPaletteDemo();

	return (
		<RailPanel
			title="CommandPalette"
			description="App should bind Cmd/K to open. Knobs set chrome strings; Nest owns the item catalog."
		>
			<DemoRow
				label="Title"
				description="Modal dialog title (aria-labelledby)."
			>
				<Input
					id="palette-title"
					value={demo.title}
					aria-label="Palette title"
					onChange={(event) => {
						demo.setTitle(event.target.value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="Placeholder"
				description="Search field placeholder text."
			>
				<Input
					id="palette-placeholder"
					value={demo.placeholder}
					aria-label="Palette placeholder"
					onChange={(event) => {
						demo.setPlaceholder(event.target.value);
					}}
				/>
			</DemoRow>
			<DemoRow
				label="emptyText"
				description="Shown when the local filter matches nothing."
			>
				<Input
					id="palette-empty"
					value={demo.emptyText}
					aria-label="Palette empty text"
					onChange={(event) => {
						demo.setEmptyText(event.target.value);
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function AccordionCanvas() {
	return (
		<Canvas>
			<DemoRow label="Single accordion">
				<Accordion
					type="single"
					defaultValue="fees"
					className="w-full max-w-lg"
				>
					<AccordionItem value="fees">
						<AccordionTrigger>Network fees</AccordionTrigger>
						<AccordionContent>
							Economy, normal, and priority presets map to sat/vB.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="privacy">
						<AccordionTrigger>Privacy</AccordionTrigger>
						<AccordionContent>
							Address reuse warnings and coin control stay in-app.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</DemoRow>
			<DemoRow label="Collapsible atom">
				<Collapsible
					defaultOpen
					className="w-full max-w-lg rounded-md border border-border p-3"
				>
					<CollapsibleTrigger>Advanced</CollapsibleTrigger>
					<CollapsibleContent>
						<p className="pt-2 text-sm text-muted-foreground">
							Nested disclosure without accordion keyboard group.
						</p>
					</CollapsibleContent>
				</Collapsible>
			</DemoRow>
		</Canvas>
	);
}

function AccordionKnobs() {
	return (
		<RailPanel
			title="Accordion"
			description="APG accordion + Collapsible atom. Heading wraps trigger."
		/>
	);
}

function ResizablePanelDemoProvider({ children }: { children: ReactNode }) {
	const [orientation, setOrientation] =
		useState<ResizablePanelOrientation>("horizontal");

	return (
		<ResizablePanelDemoContext.Provider
			value={{ orientation, setOrientation }}
		>
			{children}
		</ResizablePanelDemoContext.Provider>
	);
}

const ResizablePanelDemoContext = createContext<{
	orientation: ResizablePanelOrientation;
	setOrientation: (value: ResizablePanelOrientation) => void;
} | null>(null);

function useResizablePanelDemo() {
	const value = useContext(ResizablePanelDemoContext);
	if (value === null) {
		throw new Error("ResizablePanelDemoProvider required");
	}

	return value;
}

function ResizablePanelCanvas() {
	const demo = useResizablePanelDemo();

	let startLabel: string;
	let endLabel: string;
	if (demo.orientation === "vertical") {
		startLabel = "Top";
		endLabel = "Bottom";
	} else {
		startLabel = "Left";
		endLabel = "Right";
	}

	return (
		<Canvas>
			<div className="flex w-full max-w-3xl flex-col gap-2">
				<div className="text-sm font-medium text-foreground">
					{demo.orientation} split: drag the handle or focus it and
					use arrow keys
				</div>
				<div className="h-72 w-full overflow-hidden rounded-md border border-border">
					<ResizablePanel
						key={demo.orientation}
						orientation={demo.orientation}
						defaultSize={40}
						minSize={20}
						maxSize={80}
						start={
							<div className="flex h-full min-h-24 items-start bg-muted/40 p-3 text-sm">
								{startLabel}
							</div>
						}
						end={
							<div className="flex h-full min-h-24 items-start p-3 text-sm">
								{endLabel}
							</div>
						}
					/>
				</div>
			</div>
		</Canvas>
	);
}

function ResizablePanelKnobs() {
	const demo = useResizablePanelDemo();

	return (
		<RailPanel
			title="ResizablePanel"
			description="Drag the separator or focus it and use arrows. Toggle orientation below."
		>
			<DemoRow label="Orientation">
				<SegmentedControl
					aria-label="Split orientation"
					options={[
						{ value: "horizontal", label: "Horizontal" },
						{ value: "vertical", label: "Vertical" },
					]}
					value={demo.orientation}
					onValueChange={(value) => {
						if (value === "horizontal") {
							demo.setOrientation("horizontal");
							return;
						}
						if (value === "vertical") {
							demo.setOrientation("vertical");
						}
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function ContextMenuCanvas() {
	return (
		<Canvas>
			<DemoRow label="Right-click target">
				<ContextMenu
					items={[
						{
							key: "copy",
							label: "Copy address",
							onSelect: () => {
								/* intentional no-op */
							},
						},
						{
							key: "explorer",
							label: "Open explorer",
							onSelect: () => {
								/* intentional no-op */
							},
						},
						{ key: "div", type: "divider" },
						{
							key: "hide",
							label: "Hide",
							variant: "danger",
							onSelect: () => {
								/* intentional no-op */
							},
						},
					]}
				>
					<div className="rounded-md border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
						Right-click here
					</div>
				</ContextMenu>
			</DemoRow>
		</Canvas>
	);
}

function ContextMenuKnobs() {
	return (
		<RailPanel
			title="ContextMenu"
			description="APG menu on contextmenu. Esc and outside click dismiss."
		/>
	);
}

export {
	ActionMenuCanvas,
	ActionMenuDemoProvider,
	ActionMenuKnobs,
	AlertCanvas,
	AlertDemoProvider,
	AlertKnobs,
	BadgeCanvas,
	BadgeDemoProvider,
	BadgeKnobs,
	ButtonCanvas,
	ButtonDemoProvider,
	ButtonKnobs,
	CardCanvas,
	CardKnobs,
	ProgressJobDemoProvider,
	CommandPaletteCanvas,
	CommandPaletteDemoProvider,
	CommandPaletteKnobs,
	ConfirmCanvas,
	ConfirmDemoProvider,
	ConfirmKnobs,
	EmptyStateCanvas,
	EmptyStateKnobs,
	ErrorStateCanvas,
	ErrorStateKnobs,
	CopyButtonCanvas,
	CopyButtonKnobs,
	AvatarCanvas,
	AvatarKnobs,
	SeparatorCanvas,
	SeparatorKnobs,
	LoadingCanvas,
	LoadingDemoProvider,
	LoadingKnobs,
	ProgressBarCanvas,
	ProgressBarKnobs,
	QuotaMeterCanvas,
	QuotaMeterDemoProvider,
	QuotaMeterKnobs,
	ModalCanvas,
	ModalDemoProvider,
	ModalKnobs,
	DrawerCanvas,
	DrawerDemoProvider,
	DrawerKnobs,
	PopoverCanvas,
	PopoverDemoProvider,
	PopoverKnobs,
	TabsCanvas,
	TabsKnobs,
	ToastCanvas,
	ToastDemoProvider,
	ToastKnobs,
	TooltipCanvas,
	TooltipDemoProvider,
	TooltipKnobs,
	VisuallyHiddenCanvas,
	VisuallyHiddenKnobs,
	AccordionCanvas,
	AccordionKnobs,
	ResizablePanelCanvas,
	ResizablePanelDemoProvider,
	ResizablePanelKnobs,
	ContextMenuCanvas,
	ContextMenuKnobs,
};
