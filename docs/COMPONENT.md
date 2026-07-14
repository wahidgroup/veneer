# Component stamp

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" are interpreted as in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Canonical reuse

Composites MUST reuse these instead of reinventing chrome, fields, or portals:

| Component         | Path                                                                             | Use for                                                |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `Button`          | [`forms/Button.tsx`](../src/components/forms/Button.tsx)                         | Actions, icon/ghost chrome                             |
| `Card`            | [`layout/Card.tsx`](../src/components/layout/Card.tsx)                           | Non-interactive panel chrome                           |
| `SkipLink`        | [`navigation/SkipLink.tsx`](../src/components/navigation/SkipLink.tsx)           | Bypass link to main (G1)                               |
| `Input`           | [`forms/Input.tsx`](../src/components/forms/Input.tsx)                           | Text entry                                             |
| `Label`           | [`forms/Label.tsx`](../src/components/forms/Label.tsx)                           | Control labels                                         |
| `FieldError`      | [`forms/FieldError.tsx`](../src/components/forms/FieldError.tsx)                 | Field-level errors                                     |
| `FieldHint`       | [`forms/FieldHint.tsx`](../src/components/forms/FieldHint.tsx)                   | Field-level hints                                      |
| `FormField`       | [`forms/FormField.tsx`](../src/components/forms/FormField.tsx)                   | Label + control + hint/error                           |
| `Badge`           | [`indicators/Badge.tsx`](../src/components/indicators/Badge.tsx)                 | Status / removable chips                               |
| `Loading`         | [`feedback/Loading.tsx`](../src/components/feedback/Loading.tsx)                 | Busy / skeleton                                        |
| `Portal`          | [`overlays/Portal.tsx`](../src/components/overlays/Portal.tsx)                   | Portaled layers                                        |
| `Drawer`          | [`overlays/Drawer.tsx`](../src/components/overlays/Drawer.tsx)                   | Edge sheet dialog (modal)                              |
| `Pagination`      | [`navigation/Pagination.tsx`](../src/components/navigation/Pagination.tsx)       | Prev/Next + item-range chrome                          |
| `EmptyState`      | [`feedback/EmptyState.tsx`](../src/components/feedback/EmptyState.tsx)           | No-results / first-run CTA                             |
| `CopyButton`      | [`forms/CopyButton.tsx`](../src/components/forms/CopyButton.tsx)                 | Copy ARNs / IDs                                        |
| `StatusBadge`     | [`indicators/StatusBadge.tsx`](../src/components/indicators/StatusBadge.tsx)     | Inventory status chips                                 |
| `DescriptionList` | [`data/DescriptionList.tsx`](../src/components/data/DescriptionList.tsx)         | Resource key/value pairs                               |
| `Skeleton`        | [`feedback/Skeleton.tsx`](../src/components/feedback/Skeleton.tsx)               | Placeholder bones                                      |
| `ToolbarSelect`   | [`navigation/ToolbarSelect.tsx`](../src/components/navigation/ToolbarSelect.tsx) | Nav chrome value pickers                               |
| `ProgressBar`     | [`feedback/ProgressBar.tsx`](../src/components/feedback/ProgressBar.tsx)         | Determinate / indeterminate                            |
| `ProgressGroup`   | [`feedback/ProgressGroup.tsx`](../src/components/feedback/ProgressGroup.tsx)     | Parallel lanes + composite                             |
| `DiffView`        | [`data/DiffView.tsx`](../src/components/data/DiffView.tsx)                       | Line + tree diffs (`@wahidgroup/veneer/diff`)          |
| `PlanSummary`     | [`data/PlanSummary.tsx`](../src/components/data/PlanSummary.tsx)                 | IaC counts + DiffView tree (`@wahidgroup/veneer/diff`) |

`Button.tsx` remains the stamp example for exports, `cva`/`cn`, `data-slot`, and tokens.

## Layout

```
src/components/<category>/<Name>.tsx
src/components/<category>/<Name>.test.tsx
```

- File name MUST match the primary export (`Input.tsx`).
- Tests MUST be co-located. Setup helpers live in `src/test/` only.
- Public API stays flat via `src/index.ts` - no category re-exports.

## Implementation

| Rule         | Requirement                                                   |
| ------------ | ------------------------------------------------------------- |
| Exports      | Named: `Name`, `nameVariants` (if any), `NameProps` type      |
| Variants     | `cva` + `cn(variants(...), className)`                        |
| DOM          | Extend `ComponentProps<"el">` (+ `VariantProps`)              |
| Slot         | `data-slot="<name>"` on root                                  |
| Tokens       | Semantic utilities only; no `dark:` in primitives             |
| Icons        | Prefer `lucide-react`; extra icons via `ReactNode` slots      |
| Reuse        | Prefer the canonical primitives table above inside composites |
| Control flow | No ternaries in `.ts` / `.tsx`                                |
| Docs         | Multi-line JSDoc on the public component                      |
| Barrel       | Update `src/index.ts` + `EXPECTED_EXPORTS` in the same PR     |

## Tests

MUST:

1. Prefer `getByRole` / `getByLabelText`; `data-slot` only when needed
2. Run axe `toHaveNoViolations` on the default render (and open state for overlays)
3. Cover variants with `it.each`
4. Cover disabled / invalid when applicable
5. Assert `className` merge
6. Use real callbacks - never `vi.fn` / `vi.mock`
7. Keep tests linear (no `if` in test bodies)
8. Reuse `src/test/component-harness.js` helpers when applicable

Overlays MUST also cover Esc, focus trap/restore, and activation keys.
