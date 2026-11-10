import { useState } from "react";

import {
	ActionMenu,
	Combobox,
	ContextMenu,
	Drawer,
	Modal,
	Popover,
	Select,
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

const ZONE_OPTIONS = [
	{ value: "north", label: "North" },
	{ value: "south", label: "South" },
];

/**
 * Playwright-only overlay page. The examples app does not mount this.
 */
function OverlayFocusProof() {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [holdOpen, setHoldOpen] = useState(false);
	const [popoverOpens, setPopoverOpens] = useState<boolean[]>([]);
	const [queries, setQueries] = useState<string[]>([]);

	return (
		<main>
			<input aria-label="Outside" />
			<p data-testid="inert-area" style={{ padding: "1rem" }}>
				Plain notes
			</p>
			<ActionMenu label="Stack" items={MENU_ITEMS} />
			<Popover
				trigger="Details"
				open={detailsOpen}
				onOpenChange={(open) => {
					setDetailsOpen(open);
					setPopoverOpens((current) => {
						return current.concat(open);
					});
				}}
			>
				<button type="button">Inside</button>
			</Popover>
			<button
				type="button"
				onClick={() => {
					setDetailsOpen(false);
				}}
			>
				Dismiss panel
			</button>
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
			<button
				type="button"
				onClick={() => {
					setDialogOpen(true);
				}}
			>
				Open dialog
			</button>
			<Select aria-label="Zone" options={ZONE_OPTIONS} defaultValue="" />
			<Modal
				open={dialogOpen}
				title="Stacked notice"
				onOpenChange={setDialogOpen}
			>
				Notice body
			</Modal>
			<Popover
				trigger="Hold"
				title="Hold"
				open={holdOpen}
				onOpenChange={setHoldOpen}
			>
				<button
					type="button"
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							event.preventDefault();
						}
					}}
				>
					Hold escape
				</button>
			</Popover>
			<button
				type="button"
				onClick={() => {
					setDrawerOpen(true);
				}}
			>
				Open drawer
			</button>
			<Drawer
				open={drawerOpen}
				title="Shelf"
				onOpenChange={setDrawerOpen}
			>
				<Select
					aria-label="Shelf zone"
					options={ZONE_OPTIONS}
					defaultValue=""
				/>
				<ContextMenu items={MENU_ITEMS}>
					<p>Shelf row</p>
				</ContextMenu>
			</Drawer>
			<p data-testid="queries">{queries.join("|")}</p>
		</main>
	);
}

export { OverlayFocusProof };
