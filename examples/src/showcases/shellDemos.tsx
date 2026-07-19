import {
	createContext,
	useContext,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";

import {
	Button,
	ColorPicker,
	Select,
	SegmentedControl,
	SkipLink,
	Stepper,
	StepperActions,
	ToolbarSelect,
	TopNav,
} from "@wahidgroup/veneer";

import { useShellChrome } from "../shellChromeContext.js";
import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

function AppShellCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				This examples app is the live AppShell: TopNav header, sticky
				SideNav and Controls rail, and page-level scroll for main.
				Toggle the menu to collapse the left nav; use the panel control
				to collapse the rail. Rail position End|Bottom docks the knobs
				pane (comfort pushes layout; compact still overlays).
			</p>
		</Canvas>
	);
}

function AppShellKnobs() {
	const shell = useShellChrome();

	return (
		<RailPanel
			title="AppShell"
			description="Live AppShell with sticky side panes and document scroll. Header, sidebar, main, and controls rail."
		>
			<DemoRow
				label="Rail position"
				description="End docks beside main. Bottom docks under main and pushes content in comfort viewports."
			>
				<Select
					aria-label="Rail position"
					value={shell.railPosition}
					onChange={(value) => {
						const next = value;
						if (next === "end") {
							shell.setRailPosition("end");
							return;
						}
						if (next === "bottom") {
							shell.setRailPosition("bottom");
						}
					}}
					options={[
						{ value: "end", label: "End" },
						{ value: "bottom", label: "Bottom" },
					]}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function TopNavCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				TopNav brand is @wahidgroup/veneer. Menu button toggles SideNav
				collapse. End slot holds the theme Moon/Sun control.
			</p>
		</Canvas>
	);
}

function TopNavKnobs() {
	return (
		<RailPanel
			title="TopNav"
			description="Brand, optional menu toggle, start/center/end slots. Theme control sits in end."
		/>
	);
}

function SideNavCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				Left SideNav switches categories (Primitives, Forms, Combobox,
				Shell). Active item uses aria-current. Collapsed mode keeps
				aria-label from the item label.
			</p>
		</Canvas>
	);
}

function SideNavKnobs() {
	return (
		<RailPanel
			title="SideNav"
			description="Left category list. Collapse via TopNav menu for icon rail."
		/>
	);
}

function SkipLinkCanvas() {
	return (
		<Canvas>
			<DemoRow label="Focus to reveal">
				<div className="relative w-full max-w-md rounded-md border border-border p-4">
					<SkipLink href="#skip-demo-main" />
					<p className="mb-3 text-sm text-muted-foreground">
						Tab into this panel. SkipLink appears on focus, then
						activates focus on the main landmark below.
					</p>
					<a
						href="#skip-demo-main"
						className="mr-3 text-sm text-primary underline"
					>
						Nav link
					</a>
					<main
						id="skip-demo-main"
						tabIndex={-1}
						className="mt-3 rounded-md border border-border bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Main content receives focus after skip.
					</main>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function SkipLinkKnobs() {
	return (
		<RailPanel
			title="SkipLink"
			description="Bypass link to main (G1). Place first in the page. AppShell main defaults to id=main and tabindex=-1."
		/>
	);
}

function BreadcrumbsCanvas() {
	return (
		<Canvas>
			<p className="max-w-xl text-sm text-muted-foreground">
				Breadcrumbs above the component tabs track Examples, the active
				category, and the active component. Last crumb is plain text.
			</p>
		</Canvas>
	);
}

function BreadcrumbsKnobs() {
	return (
		<RailPanel
			title="Breadcrumbs"
			description="Trail above component tabs: Examples > category > component."
		/>
	);
}

function ToolbarSelectCanvas() {
	const [account, setAccount] = useState("acct-prod");
	const [region, setRegion] = useState("us-east-1");

	return (
		<Canvas>
			<DemoRow label="TopNav start compose">
				<TopNav
					brand={
						<span className="text-sm font-semibold">console</span>
					}
					start={
						<div className="flex items-center gap-1">
							<ToolbarSelect
								aria-label="Account"
								value={account}
								onChange={setAccount}
								options={[
									{
										value: "acct-prod",
										label: "Prod",
										description: "111122223333",
									},
									{
										value: "acct-stage",
										label: "Staging",
										description: "444455556666",
									},
								]}
							/>
							<ToolbarSelect
								aria-label="Region"
								value={region}
								onChange={setRegion}
								options={[
									{
										value: "us-east-1",
										label: "N. Virginia",
										description: "us-east-1",
									},
									{
										value: "eu-west-1",
										label: "Ireland",
										description: "eu-west-1",
									},
									{
										value: "ap-southeast-1",
										label: "Singapore",
										description: "ap-southeast-1",
									},
								]}
							/>
						</div>
					}
					className="w-full max-w-2xl rounded-md border border-border"
				/>
			</DemoRow>
		</Canvas>
	);
}

function ToolbarSelectKnobs() {
	return (
		<RailPanel
			title="ToolbarSelect"
			description="Ghost chrome listbox. Compose two for account + region in TopNav start, not a domain AccountRegionSwitcher."
		/>
	);
}

type SegmentColorSlot =
	"trackBg" | "activeBg" | "activeFg" | "inactiveFg" | "activeRing";

interface SegmentColorState {
	trackBg: string;
	activeBg: string;
	activeFg: string;
	inactiveFg: string;
	activeRing: string;
}

const SEGMENT_COLOR_DEFAULTS: SegmentColorState = {
	trackBg: "#252525",
	activeBg: "#161616",
	activeFg: "#d4d4d4",
	inactiveFg: "#8b8b8b",
	activeRing: "#404040",
};

const SEGMENT_SWATCHES = [
	"#161616",
	"#252525",
	"#404040",
	"#8b8b8b",
	"#d4d4d4",
	"#ffffff",
	"#7dd3fc",
	"#003b5c",
	"#22c55e",
	"#ef4444",
];

const SegmentedControlDemoContext = createContext<{
	colors: SegmentColorState;
	slot: SegmentColorSlot;
	setSlot: (slot: SegmentColorSlot) => void;
	setColor: (slot: SegmentColorSlot, hex: string) => void;
	resetColors: () => void;
} | null>(null);

function useSegmentedControlDemo() {
	const value = useContext(SegmentedControlDemoContext);
	if (value === null) {
		throw new Error("SegmentedControlDemoProvider required");
	}

	return value;
}

function SegmentedControlDemoProvider({ children }: { children: ReactNode }) {
	const [colors, setColors] = useState<SegmentColorState>(
		SEGMENT_COLOR_DEFAULTS,
	);
	const [slot, setSlot] = useState<SegmentColorSlot>("activeBg");

	return (
		<SegmentedControlDemoContext.Provider
			value={{
				colors,
				slot,
				setSlot,
				setColor: (nextSlot, hex) => {
					setColors((current) => {
						return { ...current, [nextSlot]: hex };
					});
				},
				resetColors: () => {
					setColors(SEGMENT_COLOR_DEFAULTS);
				},
			}}
		>
			{children}
		</SegmentedControlDemoContext.Provider>
	);
}

function segmentStyle(colors: SegmentColorState): CSSProperties & {
	"--segment-track-bg": string;
	"--segment-active-bg": string;
	"--segment-active-fg": string;
	"--segment-inactive-fg": string;
	"--segment-active-ring": string;
} {
	return {
		"--segment-track-bg": colors.trackBg,
		"--segment-active-bg": colors.activeBg,
		"--segment-active-fg": colors.activeFg,
		"--segment-inactive-fg": colors.inactiveFg,
		"--segment-active-ring": colors.activeRing,
	};
}

function SegmentedControlCanvas() {
	const demo = useSegmentedControlDemo();
	const [unit, setUnit] = useState("btc");
	const skinnedStyle = segmentStyle(demo.colors);

	return (
		<Canvas>
			<DemoRow label="Unit switch (skinned)">
				<SegmentedControl
					aria-label="Display unit"
					style={skinnedStyle}
					options={[
						{ value: "btc", label: "BTC" },
						{ value: "sats", label: "sats" },
					]}
					value={unit}
					onValueChange={setUnit}
				/>
			</DemoRow>
			<DemoRow label="View mode (sm, default tokens)">
				<SegmentedControl
					aria-label="View"
					size="sm"
					options={[
						{ value: "list", label: "List" },
						{ value: "grid", label: "Grid" },
						{ value: "map", label: "Map" },
					]}
					defaultValue="list"
					onValueChange={() => {
						/* intentional no-op */
					}}
				/>
			</DemoRow>
		</Canvas>
	);
}

function SegmentedControlKnobs() {
	const demo = useSegmentedControlDemo();
	const slotColor = demo.colors[demo.slot];

	let slotLabel = "Active background";
	if (demo.slot === "trackBg") {
		slotLabel = "Track background";
	} else if (demo.slot === "activeFg") {
		slotLabel = "Active foreground";
	} else if (demo.slot === "inactiveFg") {
		slotLabel = "Inactive foreground";
	} else if (demo.slot === "activeRing") {
		slotLabel = "Active ring";
	}

	return (
		<RailPanel
			title="SegmentedControl"
			description="--segment-* CSS vars on Unit switch only. View mode keeps token defaults."
		>
			<DemoRow label="Color slot">
				<Select
					aria-label="Segment color slot"
					options={[
						{ value: "trackBg", label: "Track bg" },
						{ value: "activeBg", label: "Active bg" },
						{ value: "activeFg", label: "Active fg" },
						{ value: "inactiveFg", label: "Inactive fg" },
						{ value: "activeRing", label: "Active ring" },
					]}
					value={demo.slot}
					onChange={(value) => {
						if (value === "trackBg") {
							demo.setSlot("trackBg");
							return;
						}
						if (value === "activeBg") {
							demo.setSlot("activeBg");
							return;
						}
						if (value === "activeFg") {
							demo.setSlot("activeFg");
							return;
						}
						if (value === "inactiveFg") {
							demo.setSlot("inactiveFg");
							return;
						}
						if (value === "activeRing") {
							demo.setSlot("activeRing");
						}
					}}
				/>
			</DemoRow>
			<DemoRow label={slotLabel}>
				<ColorPicker
					key={demo.slot}
					label={slotLabel}
					value={slotColor}
					swatches={SEGMENT_SWATCHES}
					onValueChange={(hex) => {
						demo.setColor(demo.slot, hex);
					}}
				/>
			</DemoRow>
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
		</RailPanel>
	);
}

function StepperCanvas() {
	const steps = [
		{ id: "details", label: "Details" },
		{ id: "review", label: "Review" },
		{ id: "confirm", label: "Confirm" },
	];
	const [step, setStep] = useState("details");

	function goNext() {
		const index = steps.findIndex((item) => {
			return item.id === step;
		});

		const next = steps[index + 1];
		if (next !== undefined) {
			setStep(next.id);
		}
	}

	function goBack() {
		const index = steps.findIndex((item) => {
			return item.id === step;
		});

		const prev = steps[index - 1];
		if (prev !== undefined) {
			setStep(prev.id);
		}
	}

	return (
		<Canvas>
			<DemoRow label="Checkout steps">
				<div className="w-full max-w-lg">
					<Stepper steps={steps} value={step} onValueChange={setStep}>
						<StepperActions onNext={goNext} onBack={goBack} />
					</Stepper>
				</div>
			</DemoRow>
		</Canvas>
	);
}

function StepperKnobs() {
	return (
		<RailPanel
			title="Stepper"
			description="Linear form wizard. Not Workflow (ops deploy track)."
		/>
	);
}

export {
	AppShellCanvas,
	AppShellKnobs,
	BreadcrumbsCanvas,
	BreadcrumbsKnobs,
	SideNavCanvas,
	SideNavKnobs,
	SkipLinkCanvas,
	SkipLinkKnobs,
	TopNavCanvas,
	TopNavKnobs,
	ToolbarSelectCanvas,
	ToolbarSelectKnobs,
	SegmentedControlCanvas,
	SegmentedControlDemoProvider,
	SegmentedControlKnobs,
	StepperCanvas,
	StepperKnobs,
};
