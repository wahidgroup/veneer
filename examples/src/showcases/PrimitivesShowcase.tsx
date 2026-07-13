import { useState } from "react";

import {
	ActionMenu,
	Badge,
	Button,
	ConfirmDialog,
	Label,
	Loading,
	Modal,
	NumberInput,
	Select,
	Slider,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
	Toast,
	ToastViewport,
	Toggle,
	Tooltip,
} from "@wahidgroup/veneer";
import type { ToastFade, ToastPosition, ToastType } from "@wahidgroup/veneer";

import { DemoRow, ShowcaseSection } from "./ShowcaseSection.js";

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

/**
 * Primitives: Button, Badge, Loading, Tabs, Modal, ConfirmDialog, Tooltip, ActionMenu, Toast.
 */
function PrimitivesShowcase() {
	const [modalOpen, setModalOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [lastAction, setLastAction] = useState("none");
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

	return (
		<div className="flex flex-col">
			<ToastViewport position={toastPosition}>
				{toasts.map((toast) => {
					let actions;
					if (toast.withActions) {
						actions = [
							{
								label: "Undo",
								onClick: () => {
									setLastAction("toast-undo");
									dismissToast(toast.id);
								},
							},
							{
								label: "Details",
								onClick: () => {
									setLastAction("toast-details");
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
								dismissToast(toast.id);
							}}
						/>
					);
				})}
			</ToastViewport>

			<ShowcaseSection
				title="Toast"
				description="Knobs feed the next push. Stack inherits viewport corner."
			>
				<DemoRow label="Position">
					<div className="flex w-full max-w-xs flex-col gap-1.5">
						<Label htmlFor="toast-position">Corner</Label>
						<Select
							id="toast-position"
							options={TOAST_POSITIONS}
							value={toastPosition}
							onChange={(event) => {
								const next = event.target.value;
								if (next === "top-right") {
									setToastPosition("top-right");
									return;
								}
								if (next === "top-left") {
									setToastPosition("top-left");
									return;
								}
								if (next === "bottom-right") {
									setToastPosition("bottom-right");
									return;
								}
								if (next === "bottom-left") {
									setToastPosition("bottom-left");
								}
							}}
						/>
					</div>
				</DemoRow>
				<DemoRow label="Timing">
					<div className="flex w-full max-w-xs flex-col gap-1.5">
						<Label htmlFor="toast-duration">
							Duration ms (0 = sticky)
						</Label>
						<NumberInput
							id="toast-duration"
							min={0}
							step={500}
							value={toastDuration}
							onValueChange={(value) => {
								let next = 0;
								if (value !== undefined) {
									next = value;
								}
								setToastDuration(next);
							}}
						/>
					</div>
				</DemoRow>
				<DemoRow label="Opacity">
					<div className="flex w-full max-w-sm flex-col gap-1.5">
						<Label htmlFor="toast-opacity">
							Opacity {toastOpacity.toFixed(2)}
						</Label>
						<Slider
							id="toast-opacity"
							min={0.2}
							max={1}
							step={0.05}
							value={toastOpacity}
							onValueChange={(value) => {
								setToastOpacity(value);
							}}
						/>
					</div>
				</DemoRow>
				<DemoRow label="Fade">
					<Toggle
						checked={toastFade}
						label="Fade enter/exit"
						onCheckedChange={setToastFade}
					/>
					<div className="flex w-full max-w-xs flex-col gap-1.5">
						<Label htmlFor="toast-enter-ms">Enter ms</Label>
						<NumberInput
							id="toast-enter-ms"
							min={0}
							step={50}
							disabled={!toastFade}
							value={toastEnterMs}
							onValueChange={(value) => {
								let next = 0;
								if (value !== undefined) {
									next = value;
								}
								setToastEnterMs(next);
							}}
						/>
					</div>
					<div className="flex w-full max-w-xs flex-col gap-1.5">
						<Label htmlFor="toast-exit-ms">Exit ms</Label>
						<NumberInput
							id="toast-exit-ms"
							min={0}
							step={50}
							disabled={!toastFade}
							value={toastExitMs}
							onValueChange={(value) => {
								let next = 0;
								if (value !== undefined) {
									next = value;
								}
								setToastExitMs(next);
							}}
						/>
					</div>
				</DemoRow>
				<DemoRow label="Actions">
					<Toggle
						checked={toastActions}
						label="Include Undo / Details"
						onCheckedChange={setToastActions}
					/>
				</DemoRow>
				<DemoRow label="Push">
					<Button
						variant="outlined"
						size="sm"
						onClick={() => {
							pushToast("success", "Change set apply accepted");
						}}
					>
						Success
					</Button>
					<Button
						variant="outlined"
						size="sm"
						onClick={() => {
							pushToast("error", "Stack update failed");
						}}
					>
						Error
					</Button>
					<Button
						variant="outlined"
						size="sm"
						onClick={() => {
							pushToast("info", "Drift detection started");
						}}
					>
						Info
					</Button>
					<Button
						variant="outlined"
						size="sm"
						onClick={() => {
							pushToast("warning", "Quota nearing limit");
						}}
					>
						Warning
					</Button>
				</DemoRow>
			</ShowcaseSection>

			<ShowcaseSection
				title="ActionMenu"
				description="Portaled row actions with keyboard menu navigation."
			>
				<DemoRow label="Open">
					<ActionMenu
						label="Stack"
						items={[
							{
								key: "view",
								label: "View events",
								onSelect: () => {
									setLastAction("view");
								},
							},
							{
								key: "update",
								label: "Update",
								onSelect: () => {
									setLastAction("update");
								},
							},
							{ key: "div-1", type: "divider" },
							{
								key: "destroy",
								label: "Destroy",
								variant: "danger",
								onSelect: () => {
									setLastAction("destroy");
								},
							},
						]}
					/>
					<span className="text-sm text-muted-foreground">
						Last: {lastAction}
					</span>
				</DemoRow>
			</ShowcaseSection>

			<ShowcaseSection
				title="Tooltip"
				description="Hover or focus to reveal truncated IDs and hints."
			>
				<DemoRow label="Hover">
					<Tooltip content="arn:aws:cloudformation:us-east-1:123:stack/prod-api">
						<Button variant="outlined">Stack ARN</Button>
					</Tooltip>
					<Tooltip
						content="Disabled until plan finishes"
						side="bottom"
					>
						<Button disabled>Apply</Button>
					</Tooltip>
				</DemoRow>
			</ShowcaseSection>

			<ShowcaseSection
				title="ConfirmDialog"
				description="Modal confirm with optional typed phrase for destroy."
			>
				<DemoRow label="Open">
					<Button
						variant="danger"
						onClick={() => {
							setConfirmOpen(true);
						}}
					>
						Destroy stack
					</Button>
				</DemoRow>
				<ConfirmDialog
					open={confirmOpen}
					title="Destroy stack"
					description="This permanently deletes prod-api and its resources."
					confirmPhrase="prod-api"
					confirmLabel="Destroy"
					variant="danger"
					onOpenChange={setConfirmOpen}
					onConfirm={() => {
						setConfirmOpen(false);
					}}
				/>
			</ShowcaseSection>

			<ShowcaseSection
				title="Modal"
				description="Dialog with backdrop, Esc, focus trap, and scroll lock."
			>
				<DemoRow label="Open">
					<Button
						variant="outlined"
						onClick={() => {
							setModalOpen(true);
						}}
					>
						Open modal
					</Button>
				</DemoRow>
				<Modal
					open={modalOpen}
					title="Confirm apply"
					onOpenChange={setModalOpen}
				>
					<p className="text-muted-foreground">
						Apply this change set to the selected stack? This may
						update resources in place.
					</p>
					<div className="mt-4 flex justify-end gap-2">
						<Button
							variant="outlined"
							onClick={() => {
								setModalOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setModalOpen(false);
							}}
						>
							Apply
						</Button>
					</div>
				</Modal>
			</ShowcaseSection>

			<ShowcaseSection
				title="Tabs"
				description="Underline tablist + panels. Arrow keys move selection."
			>
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
			</ShowcaseSection>

			<ShowcaseSection
				title="Button"
				description="Primary actions for consoles and forms. Prefer filled for the main CTA."
			>
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
						×
					</Button>
					<Button
						variant="danger"
						size="icon"
						aria-label="Icon danger"
					>
						×
					</Button>
				</DemoRow>
				<DemoRow label="Disabled">
					<Button disabled>Disabled</Button>
					<Button variant="danger" disabled>
						Danger disabled
					</Button>
				</DemoRow>
			</ShowcaseSection>

			<ShowcaseSection
				title="Badge"
				description="Status and metadata chips for inventory tables and headers."
			>
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
			</ShowcaseSection>

			<ShowcaseSection
				title="Loading"
				description="Spinner or skeleton bones for busy page sections."
			>
				<DemoRow label="Spinner">
					<Loading size="sm" aria-label="Loading small" />
					<Loading size="md" text="Deploying stack…" />
					<Loading size="lg" aria-label="Loading large" />
				</DemoRow>
				<DemoRow label="Skeleton">
					<Loading variant="skeleton" size="sm" lines={2} />
					<Loading
						variant="skeleton"
						size="md"
						lines={3}
						className="w-full max-w-sm"
					/>
					<Loading
						variant="skeleton"
						size="lg"
						lines={4}
						text="Fetching events…"
						className="w-full max-w-sm"
					/>
				</DemoRow>
			</ShowcaseSection>
		</div>
	);
}

export { PrimitivesShowcase };
