import { useState } from "react";

import {
	Checkbox,
	Combobox,
	DateTimePicker,
	FieldError,
	FileUpload,
	FormField,
	FormSection,
	Input,
	NumberInput,
	RadioGroup,
	SearchInput,
	Select,
	Slider,
	TagInput,
	TextArea,
	Toggle,
} from "@wahidgroup/veneer";

import { DemoRow, ShowcaseSection } from "./ShowcaseSection.js";

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

/**
 * Forms: labels, fields, selects, combobox, toggles, search, tags, files.
 */
function FormsShowcase() {
	const [stackName, setStackName] = useState("prod-vpc");
	const [region, setRegion] = useState("us-east-1");
	const [primaryAz, setPrimaryAz] = useState("");
	const [secondaryAzs, setSecondaryAzs] = useState<string[]>([]);
	const [notes, setNotes] = useState("");
	const [ha, setHa] = useState(true);
	const [agree, setAgree] = useState(false);
	const [network, setNetwork] = useState("private");
	const [query, setQuery] = useState("");
	const [showError, setShowError] = useState(false);
	const [port, setPort] = useState<number | undefined>(443);
	const [tags, setTags] = useState<string[]>(["env:prod"]);
	const [capacity, setCapacity] = useState(3);
	const [windowStart, setWindowStart] = useState("2026-07-12T09:00");
	const [files, setFiles] = useState<File[]>([]);

	let nameInvalid = false;
	if (showError && stackName.trim().length === 0) {
		nameInvalid = true;
	}

	let nameError: string | undefined;
	if (nameInvalid) {
		nameError = "Stack name is required";
	}

	let queryDisplay = "(empty)";
	if (query.length > 0) {
		queryDisplay = query;
	}

	let haLabel = "Off";
	if (ha) {
		haLabel = "On";
	}

	return (
		<div className="flex flex-col">
			<ShowcaseSection
				title="FormField + Input"
				description="Compose Label / hint / error around controls. Invalid state uses semantic danger tokens."
			>
				<div className="max-w-md space-y-4">
					<FormField
						label="Stack name"
						htmlFor="stack-name"
						hint="Lowercase letters, digits, and hyphens"
						error={nameError}
						required
					>
						<Input
							id="stack-name"
							value={stackName}
							invalid={nameInvalid}
							onChange={(event) => {
								setStackName(event.target.value);
							}}
						/>
					</FormField>
					<DemoRow label="Validate">
						<Toggle
							label="Show validation error when empty"
							checked={showError}
							onCheckedChange={setShowError}
						/>
					</DemoRow>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="TextArea + Select"
				description="Multi-line notes and native region select for deploy wizards."
			>
				<div className="grid max-w-3xl gap-4 md:grid-cols-2">
					<FormField label="Notes" htmlFor="notes">
						<TextArea
							id="notes"
							value={notes}
							rows={5}
							placeholder="Change request / ticket link"
							onChange={(event) => {
								setNotes(event.target.value);
							}}
						/>
					</FormField>
					<FormField label="Region" htmlFor="region" required>
						<Select
							id="region"
							options={REGION_OPTIONS}
							value={region}
							onChange={(event) => {
								setRegion(event.target.value);
							}}
						/>
					</FormField>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="Combobox"
				description="Searchable listbox. Same component for single and multi (`multiple`). Compose with FormField."
			>
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
							value={primaryAz}
							placeholder="Choose AZ"
							onChange={setPrimaryAz}
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
							value={secondaryAzs}
							placeholder="Add AZs"
							onChange={setSecondaryAzs}
						/>
					</FormField>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="Checkbox, Radio, Toggle"
				description="Boolean and exclusive choices for network placement and feature flags."
			>
				<div className="flex max-w-xl flex-col gap-6">
					<Checkbox
						id="agree"
						label="I understand this will modify production resources"
						description="Required before apply in enterprise flows."
						checked={agree}
						onChange={(event) => {
							setAgree(event.target.checked);
						}}
					/>
					<RadioGroup
						legend="Network placement"
						options={NETWORK_OPTIONS}
						value={network}
						onValueChange={setNetwork}
					/>
					<DemoRow label="High availability">
						<Toggle
							label="High availability"
							checked={ha}
							onCheckedChange={setHa}
						/>
						<span className="text-sm text-muted-foreground">
							{haLabel}
						</span>
					</DemoRow>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="SearchInput"
				description="Debounced search for inventory filters. Clear control appears when non-empty."
			>
				<div className="max-w-md space-y-2">
					<SearchInput
						value={query}
						debounceMs={200}
						placeholder="Search stacks"
						onValueChange={setQuery}
					/>
					<p className="text-sm text-muted-foreground">
						Debounced query:{" "}
						<span className="font-medium text-foreground">
							{queryDisplay}
						</span>
					</p>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="Tags, numbers, schedule, files"
				description="TagInput, NumberInput, Slider, DateTimePicker, FileUpload — grouped with FormSection."
			>
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
								value={port ?? ""}
								onValueChange={setPort}
							/>
						</FormField>
						<FormField label="Desired capacity" htmlFor="capacity">
							<Slider
								id="capacity"
								min={1}
								max={10}
								value={capacity}
								onValueChange={setCapacity}
							/>
						</FormField>
						<FormField
							label="Resource tags"
							htmlFor="tags"
							hint="Enter or comma to add"
						>
							<TagInput
								id="tags"
								value={tags}
								onChange={setTags}
							/>
						</FormField>
						<FormField label="Maintenance window" htmlFor="window">
							<DateTimePicker
								id="window"
								granularity="datetime"
								value={windowStart}
								onValueChange={setWindowStart}
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
							value={files}
							onChange={setFiles}
						/>
					</FormField>
				</FormSection>
			</ShowcaseSection>

			<ShowcaseSection
				title="Standalone FieldError"
				description="Use when composing custom layouts outside FormField."
			>
				<FieldError>Quota exceeded for this region</FieldError>
			</ShowcaseSection>
		</div>
	);
}

export { FormsShowcase };
