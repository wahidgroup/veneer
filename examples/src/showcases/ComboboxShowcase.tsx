import { useState } from "react";

import { Combobox, FormField, Toggle } from "@wahidgroup/veneer";

import { DemoRow, ShowcaseSection } from "./ShowcaseSection.js";

const AZ_OPTIONS = [
	{ value: "a", label: "us-east-1a" },
	{ value: "b", label: "us-east-1b" },
	{ value: "c", label: "us-east-1c" },
	{ value: "d", label: "us-east-1d" },
	{ value: "e", label: "us-east-1e", disabled: true },
];

const INSTANCE_OPTIONS = [
	{ value: "t3.micro", label: "t3.micro — 2 vCPU, 1 GiB" },
	{ value: "t3.small", label: "t3.small — 2 vCPU, 2 GiB" },
	{ value: "m5.large", label: "m5.large — 2 vCPU, 8 GiB" },
	{ value: "c6i.large", label: "c6i.large — 2 vCPU, 4 GiB" },
];

/**
 * Combobox: single search-select, multi chips, loading / invalid / disabled.
 */
function ComboboxShowcase() {
	const [primaryAz, setPrimaryAz] = useState("");
	const [secondaryAzs, setSecondaryAzs] = useState<string[]>([]);
	const [instance, setInstance] = useState("t3.small");
	const [loading, setLoading] = useState(false);
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
		<div className="flex flex-col">
			<ShowcaseSection
				title="Single select"
				description="Searchable listbox. Type to filter; Arrow / Enter to pick; Esc closes."
			>
				<div className="max-w-md">
					<FormField
						label="Primary AZ"
						htmlFor="demo-primary-az"
						hint="Compose with FormField via matching id / htmlFor"
						error={azError}
						required
					>
						<Combobox
							id="demo-primary-az"
							options={AZ_OPTIONS}
							value={primaryAz}
							invalid={azInvalid}
							placeholder="Choose AZ"
							onChange={setPrimaryAz}
						/>
					</FormField>
					<DemoRow label="Validate">
						<Toggle
							label="Require primary AZ"
							checked={showError}
							onCheckedChange={setShowError}
						/>
					</DemoRow>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="Multi select"
				description="Same component with multiple. Selected values render as removable chips."
			>
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
							value={secondaryAzs}
							placeholder="Add AZs"
							onChange={setSecondaryAzs}
						/>
					</FormField>
				</div>
			</ShowcaseSection>

			<ShowcaseSection
				title="States"
				description="Loading panel, non-searchable list, and disabled control."
			>
				<div className="grid max-w-3xl gap-6 md:grid-cols-2">
					<div className="flex flex-col gap-3">
						<FormField
							label="Instance type"
							htmlFor="demo-instance"
						>
							<Combobox
								id="demo-instance"
								options={INSTANCE_OPTIONS}
								value={instance}
								loading={loading}
								placeholder="Choose instance"
								onChange={setInstance}
							/>
						</FormField>
						<DemoRow label="Loading">
							<Toggle
								label="Show loading"
								checked={loading}
								onCheckedChange={setLoading}
							/>
						</DemoRow>
					</div>
					<div className="flex flex-col gap-4">
						<FormField
							label="Non-searchable"
							htmlFor="demo-no-search"
							hint="searchable={false} — open list only"
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
			</ShowcaseSection>
		</div>
	);
}

export { ComboboxShowcase };
