# Veneer examples

Vite app. Aliases `@wahidgroup/veneer` -> package `src` for live review
(plus `@wahidgroup/veneer/data-table`, `/diff`, and `/flow` entry points).

## Run

From package root (`make setup` installs examples + API + tests):

```bash
make setup
make examples
```

Open http://localhost:5173. Category nav uses Veneer `Tabs` / `TabsPanel`. Theme button flips `data-theme` on `<html>`.

## Notes

- Not published (`files` in root package excludes this tree).
- Own `package-lock.json` under `examples/`. React / types come from package root.
- `@source` in `src/styles.css` scans `../../src` so Tailwind sees library classes without a prior `make build`.
- Add a showcase under `src/showcases/` and wire it in the catalog when a new surface lands.
