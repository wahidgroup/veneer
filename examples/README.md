# Veneer examples

Vite app. Aliases `@wahidgroup/veneer` -> package `src` for live review
(plus `@wahidgroup/veneer/data-table` and `@wahidgroup/veneer/diff` entry points).

## Run

From package root:

```bash
make examples-setup
make examples
```

Open http://localhost:5173. Category nav uses Veneer `Tabs` / `TabsPanel`. Theme button flips `data-theme` on `<html>`.

## Categories

| Tab        | Components                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives | Button, Badge, Loading                                                                                                                                                      |
| Forms      | FormField, FormSection, Input, NumberInput, TextArea, Select, Combobox, TagInput, Slider, DateTimePicker, FileUpload, Checkbox, RadioGroup, Toggle, SearchInput, FieldError |
| Combobox   | Single, multi, loading, invalid, disabled, non-searchable                                                                                                                   |

Add a showcase under `src/showcases/` and a tab in `App.tsx` when a new catalog phase lands.

## Notes

- Not published (`files` in root package excludes this tree).
- Own `package-lock.json` under `examples/`. React / types come from package root (`make setup` first).
- `@source` in `src/styles.css` scans `../../src` so Tailwind sees library classes without a prior `make build`.
