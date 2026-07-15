import { createContext, useContext, useState, type ReactNode } from "react";

import {
	BtcInput,
	Checkbox,
	Combobox,
	DateTimePicker,
	FieldError,
	FileUpload,
	FormField,
	FormSection,
	Input,
	MoneyInput,
	NumberInput,
	RadioGroup,
	SearchInput,
	SegmentedControl,
	Select,
	Slider,
	TagInput,
	TextArea,
	Toggle,
} from "@wahidgroup/veneer";

import { Canvas, DemoRow, RailPanel } from "./demoChrome.js";

const REGION_OPTIONS = [
	{ value: "us-east-1", label: "US East (N. Virginia)" },
	{ value: "eu-west-1", label: "EU West (Ireland)" },
	{ value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

const AZ_OPTIONS = [
	{ value: "a", label: "us-east-1a" },
	{ value: "b", label: "us-east-1b" },
	{ value: "c", label: "us-east-1c" },
	{ value: "d", label: "us-east-1d" },
];

const NETWORK_OPTIONS = [
	{ value: "public", label: "Public" },
	{ value: "private", label: "Private" },
];

interface FormFieldDemoValue {
	stackName: string;
	setStackName: (value: string) => void;
	showError: boolean;
	setShowError: (value: boolean) => void;
	nameInvalid: boolean;
	nameError: string | undefined;
}

const FormFieldDemoContext = createContext<FormFieldDemoValue | null>(null);

function useFormFieldDemo() {
	const value = useContext(FormFieldDemoContext);
	if (value === null) {
		throw new Error("FormFieldDemoProvider required");
	}

	return value;
}

function FormFieldDemoProvider({ children }: { children: ReactNode }) {
	const [stackName, setStackName] = useState("prod-vpc");
	const [showError, setShowError] = useState(false);

	let nameInvalid = false;
	if (showError && stackName.trim().length === 0) {
		nameInvalid = true;
	}

	let nameError: string | undefined;
	if (nameInvalid) {
		nameError = "Stack name is required";
	}

	return (
		<FormFieldDemoContext.Provider
			value={{
				stackName,
				setStackName,
				showError,
				setShowError,
				nameInvalid,
				nameError,
			}}
		>
			{children}
		</FormFieldDemoContext.Provider>
	);
}

function FormFieldCanvas() {
	const demo = useFormFieldDemo();

	return (
		<Canvas>
			<div className="max-w-md">
				<FormField
					label="Stack name"
					htmlFor="stack-name"
					hint="Lowercase letters, digits, and hyphens"
					error={demo.nameError}
					required
				>
					<Input
						id="stack-name"
						value={demo.stackName}
						invalid={demo.nameInvalid}
						onChange={(event) => {
							demo.setStackName(event.target.value);
						}}
					/>
				</FormField>
			</div>
		</Canvas>
	);
}

function FormFieldKnobs() {
	const demo = useFormFieldDemo();

	return (
		<RailPanel
			title="FormField"
			description="Compose Label / hint / error around controls. Invalid state uses semantic danger tokens."
		>
			<DemoRow
				label="Show validation error"
				description="When on, an empty stack name shows the required-field error."
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

interface TextSelectDemoValue {
	notes: string;
	setNotes: (value: string) => void;
	region: string;
	setRegion: (value: string) => void;
}

const TextSelectDemoContext = createContext<TextSelectDemoValue | null>(null);

function useTextSelectDemo() {
	const value = useContext(TextSelectDemoContext);
	if (value === null) {
		throw new Error("TextSelectDemoProvider required");
	}
	return value;
}

function TextSelectDemoProvider({ children }: { children: ReactNode }) {
	const [notes, setNotes] = useState("");
	const [region, setRegion] = useState("us-east-1");

	return (
		<TextSelectDemoContext.Provider
			value={{ notes, setNotes, region, setRegion }}
		>
			{children}
		</TextSelectDemoContext.Provider>
	);
}

function TextSelectCanvas() {
	const demo = useTextSelectDemo();

	return (
		<Canvas>
			<div className="grid max-w-3xl gap-4 md:grid-cols-2">
				<FormField label="Notes" htmlFor="notes">
					<TextArea
						id="notes"
						value={demo.notes}
						rows={5}
						placeholder="Change request / ticket link"
						onChange={(event) => {
							demo.setNotes(event.target.value);
						}}
					/>
				</FormField>
				<FormField label="Region" htmlFor="region" required>
					<Select
						id="region"
						options={REGION_OPTIONS}
						value={demo.region}
						onChange={(value) => {
							demo.setRegion(value);
						}}
					/>
				</FormField>
			</div>
		</Canvas>
	);
}

function TextSelectKnobs() {
	return (
		<RailPanel
			title="TextArea + Select"
			description="Multi-line notes and region listbox for deploy wizards."
		/>
	);
}

interface FormsComboboxDemoValue {
	primaryAz: string;
	setPrimaryAz: (value: string) => void;
	secondaryAzs: string[];
	setSecondaryAzs: (value: string[]) => void;
}

const FormsComboboxDemoContext = createContext<FormsComboboxDemoValue | null>(
	null,
);

function useFormsComboboxDemo() {
	const value = useContext(FormsComboboxDemoContext);
	if (value === null) {
		throw new Error("FormsComboboxDemoProvider required");
	}

	return value;
}

function FormsComboboxDemoProvider({ children }: { children: ReactNode }) {
	const [primaryAz, setPrimaryAz] = useState("");
	const [secondaryAzs, setSecondaryAzs] = useState<string[]>([]);

	return (
		<FormsComboboxDemoContext.Provider
			value={{
				primaryAz,
				setPrimaryAz,
				secondaryAzs,
				setSecondaryAzs,
			}}
		>
			{children}
		</FormsComboboxDemoContext.Provider>
	);
}

function FormsComboboxCanvas() {
	const demo = useFormsComboboxDemo();

	return (
		<Canvas>
			<div className="grid max-w-3xl gap-4 md:grid-cols-2">
				<FormField
					label="Primary AZ"
					htmlFor="primary-az"
					hint="Type to filter availability zones"
					required
				>
					<Combobox
						id="primary-az"
						options={AZ_OPTIONS}
						value={demo.primaryAz}
						placeholder="Choose AZ"
						onChange={demo.setPrimaryAz}
					/>
				</FormField>
				<FormField
					label="Secondary AZs"
					htmlFor="secondary-azs"
					hint="Multi-select with removable chips"
				>
					<Combobox
						id="secondary-azs"
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

function FormsComboboxKnobs() {
	return (
		<RailPanel
			title="Combobox"
			description="Searchable listbox. Same component for single and multi."
		/>
	);
}

interface ChoicesDemoValue {
	agree: boolean;
	setAgree: (value: boolean) => void;
	network: string;
	setNetwork: (value: string) => void;
	ha: boolean;
	setHa: (value: boolean) => void;
	haLabel: string;
}

const ChoicesDemoContext = createContext<ChoicesDemoValue | null>(null);

function useChoicesDemo() {
	const value = useContext(ChoicesDemoContext);
	if (value === null) {
		throw new Error("ChoicesDemoProvider required");
	}

	return value;
}

function ChoicesDemoProvider({ children }: { children: ReactNode }) {
	const [agree, setAgree] = useState(false);
	const [network, setNetwork] = useState("private");
	const [ha, setHa] = useState(true);

	let haLabel = "Off";
	if (ha) {
		haLabel = "On";
	}

	return (
		<ChoicesDemoContext.Provider
			value={{
				agree,
				setAgree,
				network,
				setNetwork,
				ha,
				setHa,
				haLabel,
			}}
		>
			{children}
		</ChoicesDemoContext.Provider>
	);
}

function ChoicesCanvas() {
	const demo = useChoicesDemo();

	return (
		<Canvas>
			<div className="flex max-w-xl flex-col gap-6">
				<Checkbox
					id="agree"
					label="I understand this will modify production resources"
					description="Required before apply in enterprise flows."
					checked={demo.agree}
					onChange={(event) => {
						demo.setAgree(event.target.checked);
					}}
				/>
				<RadioGroup
					legend="Network placement"
					options={NETWORK_OPTIONS}
					value={demo.network}
					onValueChange={demo.setNetwork}
				/>
				<DemoRow label="High availability">
					<Toggle
						label="High availability"
						checked={demo.ha}
						onCheckedChange={demo.setHa}
					/>
					<span className="text-sm text-muted-foreground">
						{demo.haLabel}
					</span>
				</DemoRow>
			</div>
		</Canvas>
	);
}

function ChoicesKnobs() {
	return (
		<RailPanel
			title="Checkbox / Radio / Toggle"
			description="Boolean and exclusive choices for network placement and feature flags."
		/>
	);
}

interface SearchDemoValue {
	query: string;
	setQuery: (value: string) => void;
	queryDisplay: string;
	debounceMs: number;
	setDebounceMs: (value: number) => void;
}

const SearchDemoContext = createContext<SearchDemoValue | null>(null);

function useSearchDemo() {
	const value = useContext(SearchDemoContext);
	if (value === null) {
		throw new Error("SearchDemoProvider required");
	}

	return value;
}

function SearchDemoProvider({ children }: { children: ReactNode }) {
	const [query, setQuery] = useState("");
	const [debounceMs, setDebounceMs] = useState(200);

	let queryDisplay = "(empty)";
	if (query.length > 0) {
		queryDisplay = query;
	}

	return (
		<SearchDemoContext.Provider
			value={{
				query,
				setQuery,
				queryDisplay,
				debounceMs,
				setDebounceMs,
			}}
		>
			{children}
		</SearchDemoContext.Provider>
	);
}

function SearchCanvas() {
	const demo = useSearchDemo();

	return (
		<Canvas>
			<div className="max-w-md space-y-2">
				<SearchInput
					value={demo.query}
					debounceMs={demo.debounceMs}
					placeholder="Search stacks"
					onValueChange={demo.setQuery}
				/>
				<p className="text-sm text-muted-foreground">
					Debounced query:{" "}
					<span className="font-medium text-foreground">
						{demo.queryDisplay}
					</span>
				</p>
			</div>
		</Canvas>
	);
}

function SearchKnobs() {
	const demo = useSearchDemo();

	return (
		<RailPanel
			title="SearchInput"
			description="Debounced search for inventory filters. Clear control appears when non-empty."
		>
			<DemoRow
				label="Debounce"
				description="Milliseconds to wait after typing before onValueChange fires."
			>
				<NumberInput
					id="search-debounce"
					min={0}
					step={50}
					value={demo.debounceMs}
					aria-label="Search debounce"
					onValueChange={(value) => {
						let next = 0;
						if (value !== undefined) {
							next = value;
						}
						demo.setDebounceMs(next);
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

interface DeployDemoValue {
	port: number | undefined;
	setPort: (value: number | undefined) => void;
	capacity: number;
	setCapacity: (value: number) => void;
	tags: string[];
	setTags: (value: string[]) => void;
	windowStart: string;
	setWindowStart: (value: string) => void;
	files: File[];
	setFiles: (value: File[]) => void;
}

const DeployDemoContext = createContext<DeployDemoValue | null>(null);

function useDeployDemo() {
	const value = useContext(DeployDemoContext);
	if (value === null) {
		throw new Error("DeployDemoProvider required");
	}

	return value;
}

function DeployDemoProvider({ children }: { children: ReactNode }) {
	const [port, setPort] = useState<number | undefined>(443);
	const [capacity, setCapacity] = useState(3);
	const [tags, setTags] = useState<string[]>(["env:prod"]);
	const [windowStart, setWindowStart] = useState("2026-07-12T09:00");
	const [files, setFiles] = useState<File[]>([]);

	return (
		<DeployDemoContext.Provider
			value={{
				port,
				setPort,
				capacity,
				setCapacity,
				tags,
				setTags,
				windowStart,
				setWindowStart,
				files,
				setFiles,
			}}
		>
			{children}
		</DeployDemoContext.Provider>
	);
}

function DeployCanvas() {
	const demo = useDeployDemo();

	let portValue: number | "";
	if (demo.port === undefined) {
		portValue = "";
	} else {
		portValue = demo.port;
	}

	return (
		<Canvas>
			<FormSection
				title="Deploy options"
				description="Capacity, tags, maintenance window, and template upload."
			>
				<div className="grid max-w-3xl gap-4 md:grid-cols-2">
					<FormField label="Listener port" htmlFor="port">
						<NumberInput
							id="port"
							min={1}
							max={65535}
							value={portValue}
							onValueChange={demo.setPort}
						/>
					</FormField>
					<FormField label="Desired capacity" htmlFor="capacity">
						<Slider
							id="capacity"
							min={1}
							max={10}
							value={demo.capacity}
							onValueChange={demo.setCapacity}
						/>
					</FormField>
					<FormField
						label="Resource tags"
						htmlFor="tags"
						hint="Enter or comma to add"
					>
						<TagInput
							id="tags"
							value={demo.tags}
							onChange={demo.setTags}
						/>
					</FormField>
					<FormField label="Maintenance window" htmlFor="window">
						<DateTimePicker
							id="window"
							granularity="datetime"
							value={demo.windowStart}
							onValueChange={demo.setWindowStart}
						/>
					</FormField>
				</div>
				<FormField
					label="Template file"
					htmlFor="template"
					hint="YAML or JSON. Drag and drop supported."
				>
					<FileUpload
						id="template"
						accept=".yaml,.yml,.json"
						value={demo.files}
						onChange={demo.setFiles}
					/>
				</FormField>
			</FormSection>
		</Canvas>
	);
}

function DeployKnobs() {
	return (
		<RailPanel
			title="Deploy options"
			description="TagInput, NumberInput, Slider, DateTimePicker, FileUpload."
		/>
	);
}

interface MoneyInputDemoValue {
	currency: string;
	setCurrency: (value: string) => void;
	amountMinor: number | undefined;
	setAmountMinor: (value: number | undefined) => void;
	btcUnit: "btc" | "sats";
	setBtcUnit: (value: "btc" | "sats") => void;
	btcSats: number | undefined;
	setBtcSats: (value: number | undefined) => void;
}

const MoneyInputDemoContext = createContext<MoneyInputDemoValue | null>(null);

function useMoneyInputDemo() {
	const value = useContext(MoneyInputDemoContext);
	if (value === null) {
		throw new Error("MoneyInputDemoProvider required");
	}

	return value;
}

function MoneyInputDemoProvider({ children }: { children: ReactNode }) {
	const [currency, setCurrency] = useState("USD");
	const [amountMinor, setAmountMinor] = useState<number | undefined>(1999);
	const [btcUnit, setBtcUnit] = useState<"btc" | "sats">("btc");
	const [btcSats, setBtcSats] = useState<number | undefined>(15000);

	return (
		<MoneyInputDemoContext.Provider
			value={{
				currency,
				setCurrency,
				amountMinor,
				setAmountMinor,
				btcUnit,
				setBtcUnit,
				btcSats,
				setBtcSats,
			}}
		>
			{children}
		</MoneyInputDemoContext.Provider>
	);
}

const MONEY_CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD" },
	{ value: "EUR", label: "EUR" },
	{ value: "JPY", label: "JPY" },
	{ value: "BTC", label: "BTC" },
];

const BTC_UNIT_OPTIONS = [
	{ value: "btc", label: "BTC" },
	{ value: "sats", label: "sats" },
];

function MoneyInputCanvas() {
	const demo = useMoneyInputDemo();

	let committedLabel = "-";
	if (demo.amountMinor !== undefined) {
		committedLabel = String(demo.amountMinor);
	}

	let btcCommitted = "-";
	if (demo.btcSats !== undefined) {
		btcCommitted = String(demo.btcSats);
	}

	return (
		<Canvas>
			<DemoRow label="FormField + MoneyInput">
				<FormField
					label="Payment amount"
					htmlFor="money-demo"
					hint="Integer minor units. BTC built in; currency change clears."
				>
					<MoneyInput
						id="money-demo"
						currency={demo.currency}
						locale="en-US"
						defaultAmountMinor={1999}
						onAmountMinorChange={demo.setAmountMinor}
					/>
				</FormField>
			</DemoRow>
			<DemoRow label="BtcInput + SegmentedControl unit">
				<div className="flex flex-col gap-3">
					<SegmentedControl
						aria-label="Bitcoin unit"
						options={BTC_UNIT_OPTIONS}
						value={demo.btcUnit}
						onValueChange={(value) => {
							if (value === "btc" || value === "sats") {
								demo.setBtcUnit(value);
							}
						}}
					/>
					<BtcInput
						aria-label="Bitcoin amount"
						unit={demo.btcUnit}
						defaultAmountSats={15000}
						locale="en-US"
						onAmountSatsChange={demo.setBtcSats}
					/>
				</div>
			</DemoRow>
			<DemoRow label="Committed minor / sats">
				<span className="font-mono text-sm tabular-nums text-muted-foreground">
					fiat {committedLabel} · btc {btcCommitted}
				</span>
			</DemoRow>
		</Canvas>
	);
}

function MoneyInputKnobs() {
	const demo = useMoneyInputDemo();

	return (
		<RailPanel
			title="MoneyInput"
			description="FormField + fiat/BTC amount entry. SegmentedControl owns BtcInput unit. Currency change clears. Commits on blur/Enter."
		>
			<DemoRow label="Currency">
				<Select
					id="money-currency"
					options={MONEY_CURRENCY_OPTIONS}
					value={demo.currency}
					aria-label="Currency"
					onChange={(value) => {
						demo.setCurrency(value);
					}}
				/>
			</DemoRow>
		</RailPanel>
	);
}

function FieldErrorCanvas() {
	return (
		<Canvas>
			<FieldError>Quota exceeded for this region</FieldError>
		</Canvas>
	);
}

function FieldErrorKnobs() {
	return (
		<RailPanel
			title="FieldError"
			description="Use when composing custom layouts outside FormField."
		/>
	);
}

export {
	ChoicesCanvas,
	ChoicesDemoProvider,
	ChoicesKnobs,
	DeployCanvas,
	DeployDemoProvider,
	DeployKnobs,
	MoneyInputCanvas,
	MoneyInputDemoProvider,
	MoneyInputKnobs,
	FieldErrorCanvas,
	FieldErrorKnobs,
	FormFieldCanvas,
	FormFieldDemoProvider,
	FormFieldKnobs,
	FormsComboboxCanvas,
	FormsComboboxDemoProvider,
	FormsComboboxKnobs,
	SearchCanvas,
	SearchDemoProvider,
	SearchKnobs,
	TextSelectCanvas,
	TextSelectDemoProvider,
	TextSelectKnobs,
};
