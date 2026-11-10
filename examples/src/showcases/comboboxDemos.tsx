import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { Button, Combobox, FormField, Toggle, useDebounce } from "@wahidgroup/veneer";

import type { InstanceOption } from "../api/client.js";
import { addInstanceOption, listInstanceOptions, removeInstanceOption, resetInstanceOptions } from "../api/client.js";
import { Canvas, DemoRow, DemoSectionHeader, RailPanel } from "./demoChrome.js";

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
	instance: string;
	setInstance: (value: string) => void;
	showError: boolean;
	setShowError: (value: boolean) => void;
	instanceInvalid: boolean;
	instanceError: string | undefined;
	options: InstanceOption[];
	loading: boolean;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	addOption: () => Promise<void>;
	removeOption: () => Promise<void>;
	resetOptions: () => Promise<void>;
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
	const [instance, setInstance] = useState("");
	const [showError, setShowError] = useState(false);
	const [options, setOptions] = useState<InstanceOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const customSeqRef = useRef(1);
	const debouncedQuery = useDebounce(searchQuery, 200);
	const requestId = useRef(0);

	let instanceInvalid = false;
	if (showError && instance.length === 0) {
		instanceInvalid = true;
	}

	let instanceError: string | undefined;
	if (instanceInvalid) {
		instanceError = "Instance type is required";
	}

	useEffect(() => {
		const id = requestId.current + 1;
		requestId.current = id;
		setLoading(true);

		void listInstanceOptions(debouncedQuery)
			.then((result) => {
				if (requestId.current !== id) {
					return;
				}

				setOptions(result.items);
				setLoading(false);
			})
			.catch(() => {
				if (requestId.current !== id) {
					return;
				}

				setOptions([]);
				setLoading(false);
			});
	}, [debouncedQuery]);

	async function refreshOptions() {
		const id = requestId.current + 1;
		requestId.current = id;
		setLoading(true);

		try {
			const result = await listInstanceOptions(debouncedQuery);
			if (requestId.current !== id) {
				return;
			}

			setOptions(result.items);
		} catch {
			if (requestId.current !== id) {
				return;
			}

			setOptions([]);
		} finally {
			if (requestId.current === id) {
				setLoading(false);
			}
		}
	}

	async function addOption() {
		const seq = customSeqRef.current;
		customSeqRef.current = seq + 1;
		const value = `custom-${seq}`;

		try {
			await addInstanceOption({
				value,
				label: `${value} - demo`,
			});
			await refreshOptions();
		} catch {
			/* ignore */
		}
	}

	async function removeOption() {
		let target = instance;
		if (target.length === 0) {
			if (options[0] === undefined) {
				return;
			}

			target = options[0].value;
		}

		try {
			await removeInstanceOption(target);
			if (instance === target) {
				setInstance("");
			}

			await refreshOptions();
		} catch {
			/* ignore */
		}
	}

	async function resetOptions() {
		try {
			await resetInstanceOptions();
			customSeqRef.current = 1;
			if (instance.length > 0) {
				const listed = await listInstanceOptions("");
				let stillPresent = false;
				for (const option of listed.items) {
					if (option.value === instance) {
						stillPresent = true;
						break;
					}
				}

				if (!stillPresent) {
					setInstance("");
				}
			}
			await refreshOptions();
		} catch {
			/* ignore */
		}
	}

	return (
		<SingleDemoContext.Provider
			value={{
				instance,
				setInstance,
				showError,
				setShowError,
				instanceInvalid,
				instanceError,
				options,
				loading,
				searchQuery,
				setSearchQuery,
				addOption,
				removeOption,
				resetOptions,
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
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					size="sm"
					onClick={() => {
						void demo.addOption();
					}}
				>
					Add option
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						void demo.removeOption();
					}}
				>
					Remove
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outlined"
					onClick={() => {
						void demo.resetOptions();
					}}
				>
					Reset
				</Button>
			</div>
			<div className="max-w-md">
				<FormField
					label="Instance type"
					htmlFor="demo-instance-remote"
					hint="Nest GET /v1/options/instances?q= with filterMode=remote"
					error={demo.instanceError}
					required
				>
					<Combobox
						id="demo-instance-remote"
						options={demo.options}
						value={demo.instance}
						invalid={demo.instanceInvalid}
						loading={demo.loading}
						filterMode="remote"
						placeholder="Search instance types"
						onSearchChange={demo.setSearchQuery}
						onChange={demo.setInstance}
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
			description="Nest typeahead. Add / remove / reset mutate the shared options list."
		>
			<DemoRow
				label="Require instance type"
				description="When on, an empty selection shows the required-field error."
			>
				<Toggle label="Enabled" checked={demo.showError} onCheckedChange={demo.setShowError} />
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

	return <MultiDemoContext.Provider value={{ secondaryAzs, setSecondaryAzs }}>{children}</MultiDemoContext.Provider>;
}

function MultiCanvas() {
	const demo = useMultiDemo();

	return (
		<Canvas>
			<div className="max-w-md">
				<FormField label="Secondary AZs" htmlFor="demo-secondary-azs" hint="Click a chip to remove">
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
		<StatesDemoContext.Provider value={{ instance, setInstance, loading, setLoading }}>
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
						<Combobox id="demo-disabled" options={AZ_OPTIONS} value="b" disabled placeholder="Disabled" />
					</FormField>
				</div>
			</div>
		</Canvas>
	);
}

function StatesKnobs() {
	const demo = useStatesDemo();

	return (
		<RailPanel title="States" description="Loading panel, non-searchable list, and disabled control.">
			<DemoRow label="Show loading" description="Shows the loading state on the instance type combobox.">
				<Toggle label="Enabled" checked={demo.loading} onCheckedChange={demo.setLoading} />
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
				<DemoSectionHeader
					title="Single select"
					description="Nest typeahead (filterMode=remote). Add / remove / reset mutate /v1/options/instances."
					apiDriven
				/>
				<SingleCanvas />
			</section>
			<section className="flex flex-col border-b border-border pb-2">
				<DemoSectionHeader
					title="Multi select"
					description="Same component with multiple. Selected values render as removable chips."
				/>
				<MultiCanvas />
			</section>
			<section className="flex flex-col">
				<DemoSectionHeader
					title="States"
					description="Loading panel, non-searchable list, and disabled control."
				/>
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
			description="Single select is Nest-backed typeahead with add/remove/reset. Multi and States stay local."
		>
			<DemoRow
				label="Require instance type"
				description="When on, an empty single-select shows the required-field error."
			>
				<Toggle label="Enabled" checked={single.showError} onCheckedChange={single.setShowError} />
			</DemoRow>
			<DemoRow label="Show loading" description="Shows the loading state on the local instance type combobox.">
				<Toggle label="Enabled" checked={states.loading} onCheckedChange={states.setLoading} />
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
