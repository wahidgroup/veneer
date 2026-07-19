# @wahidgroup/veneer

A lightweight UI kit for React apps: forms, data display, overlays, navigation, and feedback on Tailwind CSS v4 tokens (`theme.css`). Heavy features (DataTable, Diff, Flow) ship as optional sub-paths so the root entry stays lean.

## Install

Published to [GitHub Packages](https://npm.pkg.github.com). Point the `@wahidgroup` scope at the registry (see root [`.npmrc`](.npmrc)), then:

```bash
npm install @wahidgroup/veneer
```

Peers: `react` / `react-dom` `>=19`. Consumer app needs Tailwind CSS v4.

## Quick start

App CSS entry:

```css
@import "tailwindcss";
@import "@wahidgroup/veneer/theme.css";
```

Set theme on `<html>`:

```html
<html data-theme="light">
	<!-- or data-theme="dark" -->
</html>
```

`.dark` on an ancestor is an alias for the same dark tokens. Prefer `data-theme` as the source of truth.

```tsx
import { Badge, Button, Loading, cn } from "@wahidgroup/veneer";

export function Toolbar() {
	return (
		<div className={cn("flex items-center gap-2")}>
			<Button variant="filled">Save</Button>
			<Button variant="outlined">Cancel</Button>
			<Badge variant="success">Ready</Badge>
			<Loading text="Working..." />
		</div>
	);
}
```

## Examples

### Form field

`FormField` wires label, hint, error, and `aria-describedby` onto a single control child:

```tsx
import { FormField, Input } from "@wahidgroup/veneer";

export function NameField({
	value,
	error,
	onChange,
}: {
	value: string;
	error?: string;
	onChange: (value: string) => void;
}) {
	return (
		<FormField
			label="Display name"
			hint="Shown on invoices"
			error={error}
			required
		>
			<Input
				value={value}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			/>
		</FormField>
	);
}
```

### Money + status

Integer minor units (and sats for BTC) keep formatting deterministic:

```tsx
import { MoneyAmount, StatusBadge } from "@wahidgroup/veneer";

export function BalanceRow() {
	return (
		<div className="flex items-center justify-between gap-3">
			<MoneyAmount amountMinor={125099} currency="USD" />
			<StatusBadge status="success">Settled</StatusBadge>
		</div>
	);
}
```

### Empty state

Compose the action with `Button`. EmptyState is chrome only:

```tsx
import { Button, EmptyState } from "@wahidgroup/veneer";

export function NoTransfers() {
	return (
		<EmptyState
			title="No transfers yet"
			action={<Button variant="filled">Send payment</Button>}
		>
			When you move funds, they show up here.
		</EmptyState>
	);
}
```

### Button skinning

Filled / outlined / text honor CSS vars (`--button-bg`, `--button-fg`, size vars). Ghost / secondary / danger stay on semantic tokens:

```tsx
import type { CSSProperties } from "react";
import { Button } from "@wahidgroup/veneer";

const brandSaveStyle: CSSProperties & {
	"--button-bg": string;
	"--button-fg": string;
} = {
	"--button-bg": "#0b3d2e",
	"--button-fg": "#ffffff",
};

export function BrandSave() {
	return (
		<Button variant="filled" style={brandSaveStyle}>
			Save
		</Button>
	);
}
```

Live category showcases (Vite aliases package `src`):

```bash
make setup
make examples
```

See [`examples/README.md`](examples/README.md).

## Optional sub-paths

`@tanstack/react-table`, `diff`, and `elkjs` are **optional peers**. Plain `npm install @wahidgroup/veneer` does not install them. The root entry never imports them.

| Subpath                          | Exports                                     | Required peer                         |
| -------------------------------- | ------------------------------------------- | ------------------------------------- |
| `@wahidgroup/veneer/data-table`  | `DataTable`, row helpers                    | `@tanstack/react-table` `>=8.21.3 <9` |
| `@wahidgroup/veneer/diff`        | `DiffView`, `PlanSummary`, `buildDiffLines` | `diff` `>=9.0.0 <10`                  |
| `@wahidgroup/veneer/flow`        | `FlowCanvas`, viewport, typed ports         | none                                  |
| `@wahidgroup/veneer/flow/layout` | `layoutGraph`                               | `elkjs` `>=0.11.1 <1`                 |

```bash
npm install @tanstack/react-table@8.21.3   # /data-table
npm install diff@9.0.0                    # /diff
npm install elkjs@0.11.1                  # /flow/layout
```

```ts
import { DataTable } from "@wahidgroup/veneer/data-table";
import { DiffView, PlanSummary } from "@wahidgroup/veneer/diff";
import { FlowCanvas } from "@wahidgroup/veneer/flow";
import { layoutGraph } from "@wahidgroup/veneer/flow/layout";
```

## Theme

Defaults live under `@layer theme` for `:root` / `[data-theme="light"]` and `.dark` / `[data-theme="dark"]`. Override or add a brand theme in the app:

```css
@layer theme {
	[data-theme="brand"] {
		--primary: #0b3d2e;
		--primary-foreground: #ffffff;
	}
}
```

Do **not** put light/dark hex values inside `@theme` / `@theme inline`. That freezes utilities at build time. Keep values on `--token` vars.

Three-way toggles (light / dark / system) are an **app** concern: set `data-theme` from `localStorage` + `matchMedia("(prefers-color-scheme: dark)")`. Veneer ships activation hooks, not media-only dark.

`theme.css` registers `@source "./dist"` for class scanning.

## Develop

```bash
make setup
make lint
make test
make build
make ci
```

Watch kit tests: `npm run test:watch`. Fix lint: `make lint fix=1`. `make help` lists targets.

New components MUST follow [`docs/COMPONENT.md`](docs/COMPONENT.md).

## Styling stack

- `class-variance-authority`: typed variants (`buttonVariants`, etc.)
- `cn`: `clsx` + `tailwind-merge`
- `lucide-react`: icons in SearchInput, Select, Combobox, TagInput, FileUpload, and related controls
- Semantic CSS variables via `theme.css` (`@theme inline` bridge + `@layer theme` values)

## License

MIT
