import { createContext, useContext, useState, type ReactNode } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	ActivityRow,
	BtcAmount,
	buildPaymentUri,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	ContextMenu,
	FeeRateControl,
	LedgerRow,
	parsePaymentUri,
	ResizablePanel,
	SeedPhrase,
	SegmentedControl,
	Sparkline,
	Stepper,
	StepperActions,
	TxStatusBadge,
	type ResizablePanelOrientation,
} from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

function SegmentedControlCanvas() {
	const [unit, setUnit] = useState("btc");

	return (
		<Canvas>
			<DemoRow label="Unit switch">
				<SegmentedControl
					aria-label="Display unit"
					options={[
						{ value: "btc", label: "BTC" },
						{ value: "sats", label: "sats" },
					]}
					value={unit}
					onValueChange={setUnit}
				/>
			</DemoRow>
			<DemoRow label="View mode (sm)">
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
	return (
		<RailPanel
			title="SegmentedControl"
			description="Exclusive radiogroup strip. Prefer over ChipGroup (multi) and Tabs (panels)."
		/>
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

	let startLabel = "Start";
	let endLabel = "End";
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
					{demo.orientation} split — drag the handle or focus it and
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

function ActivitySurfacesCanvas() {
	const built = buildPaymentUri({
		address: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
		amountSats: 1999,
		label: "Invoice",
	});

	let uriPreview = "build failed";
	if (built.ok) {
		uriPreview = built.value;
	}

	const parsed = parsePaymentUri(uriPreview);
	let parseLabel = "parse failed";
	if (parsed.ok && parsed.value.amountSats !== undefined) {
		parseLabel = `${String(parsed.value.amountSats)} sats`;
	}

	return (
		<Canvas>
			<DemoRow label="FeeRateControl">
				<FeeRateControl aria-label="Fee rate" defaultValue={10} />
			</DemoRow>
			<DemoRow label="ActivityRow">
				<ActivityRow
					direction="in"
					title="Received"
					subtitle="2 min ago"
					amount={<BtcAmount amountSats={25000} unit="sats" />}
					status={
						<TxStatusBadge status="confirming" confirmations={2}>
							Confirming
						</TxStatusBadge>
					}
				/>
			</DemoRow>
			<DemoRow label="LedgerRow">
				<ul className="w-full max-w-md divide-y divide-border rounded-md border border-border">
					<LedgerRow
						description="Payroll"
						amountMinor={-12500}
						currency="USD"
						balanceMinor={87500}
					/>
					<LedgerRow
						description="Refund"
						amountMinor={2500}
						currency="USD"
						balanceMinor={90000}
					/>
				</ul>
			</DemoRow>
			<DemoRow label="Sparkline">
				<Sparkline
					values={[4, 8, 6, 12, 9, 14, 11]}
					aria-label="Weekly volume"
				/>
			</DemoRow>
			<DemoRow label="PaymentUri">
				<code className="block max-w-full break-all text-xs text-muted-foreground">
					{uriPreview}
					{" -> "}
					{parseLabel}
				</code>
			</DemoRow>
		</Canvas>
	);
}

function ActivitySurfacesKnobs() {
	return (
		<RailPanel
			title="Activity surfaces"
			description="FeeRateControl, ActivityRow, LedgerRow, Sparkline, PaymentUri parse/build."
		/>
	);
}

const SEED_DEMO_WORDS = [
	"abandon",
	"ability",
	"able",
	"about",
	"above",
	"absent",
	"absorb",
	"abstract",
	"absurd",
	"abuse",
	"access",
	"accident",
	"account",
	"accuse",
	"achieve",
	"acid",
	"acoustic",
	"acquire",
	"across",
	"act",
	"action",
	"actor",
	"actress",
	"actual",
] as const;

type SeedDemoWordCount = "12" | "15" | "18" | "24";

function SeedPhraseDemoProvider({ children }: { children: ReactNode }) {
	const [wordCount, setWordCount] = useState<SeedDemoWordCount>("12");

	return (
		<SeedPhraseDemoContext.Provider value={{ wordCount, setWordCount }}>
			{children}
		</SeedPhraseDemoContext.Provider>
	);
}

const SeedPhraseDemoContext = createContext<{
	wordCount: SeedDemoWordCount;
	setWordCount: (value: SeedDemoWordCount) => void;
} | null>(null);

function useSeedPhraseDemo() {
	const value = useContext(SeedPhraseDemoContext);
	if (value === null) {
		throw new Error("SeedPhraseDemoProvider required");
	}

	return value;
}

function SeedPhraseCanvas() {
	const demo = useSeedPhraseDemo();
	const count = Number(demo.wordCount);
	const words = SEED_DEMO_WORDS.slice(0, count);

	return (
		<Canvas>
			<DemoRow label={`Reveal + copy (${String(count)} words)`}>
				<SeedPhrase words={words} showCopy defaultRevealed={false} />
			</DemoRow>
		</Canvas>
	);
}

function SeedPhraseKnobs() {
	const demo = useSeedPhraseDemo();

	return (
		<RailPanel
			title="SeedPhrase"
			description="n-words via words.length. Fixed ch slots keep hide/reveal size stable."
		>
			<DemoRow label="Word count">
				<SegmentedControl
					aria-label="Seed phrase word count"
					size="sm"
					options={[
						{ value: "12", label: "12" },
						{ value: "15", label: "15" },
						{ value: "18", label: "18" },
						{ value: "24", label: "24" },
					]}
					value={demo.wordCount}
					onValueChange={(value) => {
						if (value === "12") {
							demo.setWordCount("12");
							return;
						}
						if (value === "15") {
							demo.setWordCount("15");
							return;
						}
						if (value === "18") {
							demo.setWordCount("18");
							return;
						}
						if (value === "24") {
							demo.setWordCount("24");
						}
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

export {
	AccordionCanvas,
	AccordionKnobs,
	ActivitySurfacesCanvas,
	ActivitySurfacesKnobs,
	ContextMenuCanvas,
	ContextMenuKnobs,
	ResizablePanelCanvas,
	ResizablePanelDemoProvider,
	ResizablePanelKnobs,
	SeedPhraseCanvas,
	SeedPhraseDemoProvider,
	SeedPhraseKnobs,
	SegmentedControlCanvas,
	SegmentedControlKnobs,
	StepperCanvas,
	StepperKnobs,
};
