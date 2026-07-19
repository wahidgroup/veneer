# veneer

Lightweight UI kit for React apps: forms, data display, overlays, navigation, and feedback on Tailwind CSS v4 tokens (`theme.css`). DataTable, Diff, and Flow ship as optional subpaths so the root entry stays lean. Peers: `react` / `react-dom` `>=19`.

## Install

```bash
npm install @wahidgroup/veneer
```

GitHub Packages: configure the `@wahidgroup` registry (see [`.npmrc`](.npmrc)).

App CSS:

```css
@import "tailwindcss";
@import "@wahidgroup/veneer/theme.css";
```

Theme on `<html>`:

```html
<html data-theme="light"></html>
```

`.dark` on an ancestor is an alias for the same dark tokens. Prefer `data-theme`.

## Form field

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

## Money + status

Integer minor units (sats for BTC):

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

## Empty state

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

## Button skinning

Filled / outlined / text honor `--button-bg`, `--button-fg`, and size vars. Ghost / secondary / danger stay on semantic tokens:

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

## Package entrypoints

| Import                           | Contents                                    | Required peer                         |
| -------------------------------- | ------------------------------------------- | ------------------------------------- |
| `@wahidgroup/veneer`             | root components + `cn`                      | `react`, `react-dom`                  |
| `@wahidgroup/veneer/theme.css`   | tokens + `@source` for Tailwind             | Tailwind CSS v4                       |
| `@wahidgroup/veneer/data-table`  | `DataTable`, row helpers                    | `@tanstack/react-table` `>=8.21.3 <9` |
| `@wahidgroup/veneer/diff`        | `DiffView`, `PlanSummary`, `buildDiffLines` | `diff` `>=9.0.0 <10`                  |
| `@wahidgroup/veneer/flow`        | `FlowCanvas`, viewport, typed ports         | none                                  |
| `@wahidgroup/veneer/flow/layout` | `layoutGraph`                               | `elkjs` `>=0.11.1 <1`                 |

Optional peers are not installed with a plain `npm install @wahidgroup/veneer`. The root entry never imports them.

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

## Theme overrides

Defaults live under `@layer theme` for `:root` / `[data-theme="light"]` and `.dark` / `[data-theme="dark"]`:

```css
@layer theme {
	[data-theme="brand"] {
		--primary: #0b3d2e;
		--primary-foreground: #ffffff;
	}
}
```

Do **not** put light/dark hex values inside `@theme` / `@theme inline`. That freezes utilities at build time. Keep values on `--token` vars.

Light / dark / system toggles are an app concern: set `data-theme` from `localStorage` + `matchMedia("(prefers-color-scheme: dark)")`.

## Examples app

```bash
make setup
make examples
```

Vite aliases package `src`. See [`examples/README.md`](examples/README.md).

## Dev

```
make setup           deps (kit + examples + API + Playwright)
make lint            lint + spell (fix=1)
make test            kit + API Vitest + Playwright (watch=1 = kit only)
make coverage        kit Vitest + Cobertura (coverage/)
make test-examples   API Vitest + Playwright
make build           dist/
make smoke           load dist exports
make examples        Nest API + Vite showcases
make examples-build  production build of examples/
make spellcheck      cspell
make sbom            sbom.json (also shipped in npm pack)
make pack            assert npm pack is minimal + includes sbom
make ci              lint, build, coverage, test-examples, examples-build, smoke, pack
make release         version=v0.2.0 [dry-run=1]
make clean-dist      wipe dist + artifacts + coverage + sbom
make clean           wipe dist + artifacts + sbom + node_modules
```

```bash
make release version=v0.2.0
make release version=v0.2.0 dry-run=1
```

New components MUST follow [`docs/COMPONENT.md`](docs/COMPONENT.md).

## CI

- PR Checks: title, body, metadata
- CI: `make ci`, upload coverage + SBOM
- Audit: deps + weekly
- Release: tag `releases/v*`, publish + attach SBOM

## Stack

TypeScript 5.9+, React 19, Tailwind CSS v4, Vitest, CVA, `cn` (`clsx` + `tailwind-merge`), Lucide, `@wahidgroup/lint-rules`.

## License

MIT
