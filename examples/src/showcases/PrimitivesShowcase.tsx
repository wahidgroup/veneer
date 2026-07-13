import { useState } from "react";

import {
	Badge,
	Button,
	Loading,
	Modal,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
} from "@wahidgroup/veneer";

import { DemoRow, ShowcaseSection } from "./ShowcaseSection.js";

/**
 * Primitives: Button, Badge, Loading, Tabs, Modal.
 */
function PrimitivesShowcase() {
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className="flex flex-col">
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
				description="Busy state for page sections and async actions."
			>
				<DemoRow label="Sizes">
					<Loading size="sm" aria-label="Loading small" />
					<Loading size="md" text="Deploying stack…" />
					<Loading size="lg" aria-label="Loading large" />
				</DemoRow>
			</ShowcaseSection>
		</div>
	);
}

export { PrimitivesShowcase };
