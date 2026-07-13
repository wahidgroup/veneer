import { createContext, useContext, useState, type ReactNode } from "react";

import { Combobox, FormField, Toggle } from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

const AZ_OPTIONS = [
	{ value: "a", label: "us-east-1a" },
	{ value: "b", label: "us-east-1b" },
	{ value: "c", label: "us-east-1c" },
	{ value: "d", label: "us-east-1d" },
	{ value: "e", label: "us-east-1e", disabled: true },
];

const INSTANCE_OPTIONS = [
	{ value: "t3.micro", label: "t3.micro - 2 vCPU, 1 GiB" },
	{ value: "t3.small", label: "t3.small - 2 vCPU, 2 GiB" },
	{ value: "m5.large", label: "m5.large - 2 vCPU, 8 GiB" },
	{ value: "c6i.large", label: "c6i.large - 2 vCPU, 4 GiB" },
];

interface SingleDemoValue {
	primaryAz: string;
	setPrimaryAz: (value: string) => void;
	showError: boolean;
	setShowError: (value: boolean) => void;
	azInvalid: boolean;
	azError: string | undefined;
}

const SingleDemoContext = createContext<SingleDemoValue | null>(null);

function useSingleDemo() {
	const value = useContext(SingleDemoContext);
	if (value === null) {
		throw new Error("SingleDemoProvider required");
	}
	return value;
}

function SingleDemoProvider({ children }: { children: ReactNode }) {
	const [primaryAz, setPrimaryAz] = useState("");
	const [showError, setShowError] = useState(false);

	let azInvalid = false;
	if (showError && primaryAz.length === 0) {
		azInvalid = true;
	}

	let azError: string | undefined;
	if (azInvalid) {
		azError = "Primary AZ is required";
	}

	return (
		<SingleDemoContext.Provider
			value={{
				primaryAz,
				setPrimaryAz,
				showError,
				setShowError,
				azInvalid,
				azError,
			}}
		>
			{children}
		</SingleDemoContext.Provider>
	);
}

function SingleCanvas() {
	const demo = useSingleDemo();

	return (
		<Canvas>
			<div className="max-w-md">
				<FormField
					label="Primary AZ"
					htmlFor="demo-primary-az"
					hint="Compose with FormField via matching id / htmlFor"
					error={demo.azError}
					required
				>
					<Combobox
						id="demo-primary-az"
						options={AZ_OPTIONS}
						value={demo.primaryAz}
						invalid={demo.azInvalid}
						placeholder="Choose AZ"
						onChange={demo.setPrimaryAz}
					/>
				</FormField>
			</div>
		</Canvas>
	);
}

function SingleKnobs() {
	const demo = useSingleDemo();

	return (
		<RailPanel
			title="Single select"
			description="Searchable listbox. Type to filter; Arrow / Enter to pick; Esc closes."
		>
			<DemoRow
				label="Require primary AZ"
				description="When on, an empty selection shows the required-field error."
			>
				<Toggle
					label="Enabled"
					checked={demo.showError}
					onCheckedChange={demo.setShowError}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface MultiDemoValue {
	secondaryAzs: string[];
	setSecondaryAzs: (value: string[]) => void;
}

const MultiDemoContext = createContext<MultiDemoValue | null>(null);

function useMultiDemo() {
	const value = useContext(MultiDemoContext);
	if (value === null) {
		throw new Error("MultiDemoProvider required");
	}
	return value;
}

function MultiDemoProvider({ children }: { children: ReactNode }) {
	const [secondaryAzs, setSecondaryAzs] = useState<string[]>([]);

	return (
		<MultiDemoContext.Provider value={{ secondaryAzs, setSecondaryAzs }}>
			{children}
		</MultiDemoContext.Provider>
	);
}

function MultiCanvas() {
	const demo = useMultiDemo();

	return (
		<Canvas>
			<div className="max-w-md">
				<FormField
					label="Secondary AZs"
					htmlFor="demo-secondary-azs"
					hint="Click a chip to remove"
				>
					<Combobox
						id="demo-secondary-azs"
						multiple
						options={AZ_OPTIONS}
						value={demo.secondaryAzs}
						placeholder="Add AZs"
						onChange={demo.setSecondaryAzs}
					/>
				</FormField>
			</div>
		</Canvas>
	);
}

function MultiKnobs() {
	return (
		<RailPanel
			title="Multi select"
			description="Same component with multiple. Selected values render as removable chips."
		/>
	);
}

interface StatesDemoValue {
	instance: string;
	setInstance: (value: string) => void;
	loading: boolean;
	setLoading: (value: boolean) => void;
}

const StatesDemoContext = createContext<StatesDemoValue | null>(null);

function useStatesDemo() {
	const value = useContext(StatesDemoContext);
	if (value === null) {
		throw new Error("StatesDemoProvider required");
	}
	return value;
}

function StatesDemoProvider({ children }: { children: ReactNode }) {
	const [instance, setInstance] = useState("t3.small");
	const [loading, setLoading] = useState(false);

	return (
		<StatesDemoContext.Provider
			value={{ instance, setInstance, loading, setLoading }}
		>
			{children}
		</StatesDemoContext.Provider>
	);
}

function StatesCanvas() {
	const demo = useStatesDemo();

	return (
		<Canvas>
			<div className="grid max-w-3xl gap-6 md:grid-cols-2">
				<div className="flex flex-col gap-3">
					<FormField label="Instance type" htmlFor="demo-instance">
						<Combobox
							id="demo-instance"
							options={INSTANCE_OPTIONS}
							value={demo.instance}
							loading={demo.loading}
							placeholder="Choose instance"
							onChange={demo.setInstance}
						/>
					</FormField>
				</div>
				<div className="flex flex-col gap-4">
					<FormField
						label="Non-searchable"
						htmlFor="demo-no-search"
						hint="searchable={false} - open list only"
					>
						<Combobox
							id="demo-no-search"
							options={AZ_OPTIONS}
							defaultValue="a"
							searchable={false}
							placeholder="Pick AZ"
						/>
					</FormField>
					<FormField label="Disabled" htmlFor="demo-disabled">
						<Combobox
							id="demo-disabled"
							options={AZ_OPTIONS}
							value="b"
							disabled
							placeholder="Disabled"
						/>
					</FormField>
				</div>
			</div>
		</Canvas>
	);
}

function StatesKnobs() {
	const demo = useStatesDemo();

	return (
		<RailPanel
			title="States"
			description="Loading panel, non-searchable list, and disabled control."
		>
			<DemoRow
				label="Show loading"
				description="Shows the loading state on the instance type combobox."
			>
				<Toggle
					label="Enabled"
					checked={demo.loading}
					onCheckedChange={demo.setLoading}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function ComboboxCategoryProvider({ children }: { children: ReactNode }) {
	return (
		<SingleDemoProvider>
			<MultiDemoProvider>
				<StatesDemoProvider>{children}</StatesDemoProvider>
			</MultiDemoProvider>
		</SingleDemoProvider>
	);
}

function ComboboxCategoryCanvas() {
	return (
		<div className="flex flex-col gap-2">
			<section className="flex flex-col border-b border-border pb-2">
				<div className="px-6 pt-6">
					<h3 className="text-lg font-semibold text-foreground">
						Single select
					</h3>
					<p className="text-sm text-muted-foreground">
						Searchable listbox. Type to filter; Arrow / Enter to
						pick; Esc closes.
					</p>
				</div>
				<SingleCanvas />
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<div className="px-6 pt-6">
					<h3 className="text-lg font-semibold text-foreground">
						Multi select
					</h3>
					<p className="text-sm text-muted-foreground">
						Same component with multiple. Selected values render as
						removable chips.
					</p>
				</div>
				<MultiCanvas />
			</section>
			<section className="flex flex-col">
				<div className="px-6 pt-6">
					<h3 className="text-lg font-semibold text-foreground">
						States
					</h3>
					<p className="text-sm text-muted-foreground">
						Loading panel, non-searchable list, and disabled
						control.
					</p>
				</div>
				<StatesCanvas />
			</section>
		</div>
	);
}

function ComboboxCategoryKnobs() {
	const single = useSingleDemo();
	const states = useStatesDemo();

	return (
		<RailPanel
			title="Combobox"
			description="Single, multi, and state demos on one page. No component tabs."
		>
			<DemoRow
				label="Require primary AZ"
				description="When on, an empty single-select shows the required-field error."
			>
				<Toggle
					label="Enabled"
					checked={single.showError}
					onCheckedChange={single.setShowError}
				/>
			</DemoRow>
			<DemoRow
				label="Show loading"
				description="Shows the loading state on the instance type combobox."
			>
				<Toggle
					label="Enabled"
					checked={states.loading}
					onCheckedChange={states.setLoading}
				/>
			</DemoRow>
		</RailPanel>
	);
}

export {
	ComboboxCategoryCanvas,
	ComboboxCategoryKnobs,
	ComboboxCategoryProvider,
	MultiCanvas,
	MultiDemoProvider,
	MultiKnobs,
	SingleCanvas,
	SingleDemoProvider,
	SingleKnobs,
	StatesCanvas,
	StatesDemoProvider,
	StatesKnobs,
};
