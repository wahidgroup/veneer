# @wahidgroup/veneer

React component library for React apps.

Foundation: `cn` / CVA, `theme.css`, Button, Badge, Loading.

## Daily loop

```bash
make setup
make lint
make test
make build
make ci
```

Watch tests while iterating:

```bash
npm run test:watch
```

`make help` lists all targets. Fix lint with `make lint fix=1`.

## Examples

Runnable category showcases (live `src` via Vite alias):

```bash
make examples-setup
make examples
```

See [`examples/README.md`](examples/README.md).

## Install (when published)

```bash
npm install @wahidgroup/veneer
```

Peers: `react` >= 19, `react-dom` >= 19. Consumer app needs Tailwind CSS v4.

### Theme

In the app CSS entry:

```css
@import "tailwindcss";
@import "@wahidgroup/veneer/theme.css";
```

`theme.css` registers `@source "./dist"` for class scanning.

#### Activation (enterprise)

Prefer **`data-theme` on `<html>`** as the single source of truth:

```html
<html data-theme="light">
	<!-- or -->
	<html data-theme="dark"></html>
</html>
```

`.dark` on an ancestor is an alias for the same dark token set (common class toggles).

Veneer primitives use semantic utilities (`bg-primary`, `text-muted-foreground`). They flip when tokens change - no `dark:` needed on library components. Use `dark:` in the app only when structure differs by mode.

#### Override / brand themes

Defaults live under `@layer theme` for `:root` / `[data-theme="light"]` and `.dark` / `[data-theme="dark"]`.

Override or add a brand theme in the app (same layer or later):

```css
@layer theme {
	[data-theme="brand"] {
		--primary: #0b3d2e;
		--primary-foreground: #ffffff;
		/* …reassign only what you need */
	}
}
```

Do **not** put light/dark hex values inside `@theme` / `@theme inline` - that freezes utilities at build time. Keep values on `--token` vars; leave the `@theme inline` bridge alone.

#### Light / dark / system

Three-way toggles (explicit light, explicit dark, follow OS) are an **app** concern: set `data-theme` (or `.dark`) from `localStorage` + `matchMedia("(prefers-color-scheme: dark)")`. Veneer ships class/`data-theme` activation, not media-only dark.

### Usage

```tsx
import { Badge, Button, Loading, cn } from "@wahidgroup/veneer";

export function Example() {
	return (
		<div className={cn("flex gap-2")}>
			<Button variant="filled">Save</Button>
			<Badge variant="success">Ready</Badge>
			<Loading text="Working..." />
		</div>
	);
}
```

## Styling stack

- `class-variance-authority` - typed variants (`buttonVariants`, etc.)
- `cn` - `clsx` + `tailwind-merge` for conditionals and conflict resolution
- `lucide-react` - icons in SearchInput, Select, Combobox, TagInput, FileUpload
- Semantic CSS variables via `theme.css` (`@theme inline` bridge + `@layer theme` values)

New components MUST follow [`docs/COMPONENT.md`](docs/COMPONENT.md).

## License

MIT
