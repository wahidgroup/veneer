import { useState } from "react";

import {
	ActionMenu,
	Combobox,
	Popover,
	ToolbarSelect,
} from "@wahidgroup/veneer";

const MENU_ITEMS = [
	{
		key: "view",
		label: "View events",
		onSelect: () => {
			/* proof page records dismiss, not the item */
		},
	},
];

const ACCOUNT_OPTIONS = [
	{ value: "acct-prod", label: "Prod" },
	{ value: "acct-stage", label: "Staging" },
];

const REGION_OPTIONS = [
	{ value: "us-east-1", label: "N. Virginia" },
	{ value: "eu-west-1", label: "Ireland" },
];

/**
 * Playwright-only overlay page. The examples app does not mount this.
 */
function OverlayFocusProof() {
	const [popoverOpens, setPopoverOpens] = useState<boolean[]>([]);
	const [queries, setQueries] = useState<string[]>([]);

	return (
		<main>
			<ActionMenu label="Stack" items={MENU_ITEMS} />
			<Popover
				trigger="Details"
				onOpenChange={(open) => {
					setPopoverOpens((current) => {
						return current.concat(open);
					});
				}}
			>
				<button type="button">Inside</button>
			</Popover>
			<p data-testid="popover-opens">{popoverOpens.join(",")}</p>
			<ToolbarSelect
				aria-label="Account"
				defaultValue="acct-prod"
				options={ACCOUNT_OPTIONS}
			/>
			<Combobox
				aria-label="Region"
				options={REGION_OPTIONS}
				value=""
				onChange={() => {
					/* controlled empty value; the proof watches search clears */
				}}
				onSearchChange={(query) => {
					setQueries((current) => {
						return current.concat(query);
					});
				}}
			/>
			<p data-testid="queries">{queries.join("|")}</p>
		</main>
	);
}

export { OverlayFocusProof };
