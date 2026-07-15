# Component stamp

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" are interpreted as in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Canonical reuse

Composites MUST reuse these instead of reinventing chrome, fields, or portals:

| Component          | Path                                                                                   | Use for                                                         |
| ------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Button`           | [`forms/Button.tsx`](../src/components/forms/Button.tsx)                               | Actions; color + size CSS vars (`--button-height`/`px`/`fz`)    |
| `Card`             | [`layout/Card.tsx`](../src/components/layout/Card.tsx)                                 | Non-interactive panel chrome                                    |
| `SkipLink`         | [`navigation/SkipLink.tsx`](../src/components/navigation/SkipLink.tsx)                 | Bypass link to main (G1)                                        |
| `Input`            | [`forms/Input.tsx`](../src/components/forms/Input.tsx)                                 | Text entry                                                      |
| `Label`            | [`forms/Label.tsx`](../src/components/forms/Label.tsx)                                 | Control labels                                                  |
| `FieldError`       | [`forms/FieldError.tsx`](../src/components/forms/FieldError.tsx)                       | Field-level errors                                              |
| `FieldHint`        | [`forms/FieldHint.tsx`](../src/components/forms/FieldHint.tsx)                         | Field-level hints                                               |
| `FormField`        | [`forms/FormField.tsx`](../src/components/forms/FormField.tsx)                         | Label + control + hint/error                                    |
| `Badge`            | [`indicators/Badge.tsx`](../src/components/indicators/Badge.tsx)                       | Status / removable chips                                        |
| `Avatar`           | [`indicators/Avatar.tsx`](../src/components/indicators/Avatar.tsx)                     | User / contact identity (img + fallback)                        |
| `DeltaBadge`       | [`indicators/DeltaBadge.tsx`](../src/components/indicators/DeltaBadge.tsx)             | +/- change chip (not color-only)                                |
| `TxStatusBadge`    | [`indicators/TxStatusBadge.tsx`](../src/components/indicators/TxStatusBadge.tsx)       | Unconfirmed / confirming / confirmed / failed                   |
| `Loading`          | [`feedback/Loading.tsx`](../src/components/feedback/Loading.tsx)                       | Busy / skeleton                                                 |
| `Portal`           | [`overlays/Portal.tsx`](../src/components/overlays/Portal.tsx)                         | Portaled layers                                                 |
| `Drawer`           | [`overlays/Drawer.tsx`](../src/components/overlays/Drawer.tsx)                         | Edge sheet dialog (modal)                                       |
| `Pagination`       | [`navigation/Pagination.tsx`](../src/components/navigation/Pagination.tsx)             | Prev/Next + item-range chrome                                   |
| `EmptyState`       | [`feedback/EmptyState.tsx`](../src/components/feedback/EmptyState.tsx)                 | No-results / first-run CTA                                      |
| `ErrorState`       | [`feedback/ErrorState.tsx`](../src/components/feedback/ErrorState.tsx)                 | Failure / forbidden chrome (`role="alert"`)                     |
| `CopyButton`       | [`forms/CopyButton.tsx`](../src/components/forms/CopyButton.tsx)                       | Copy ARNs / IDs                                                 |
| `ColorPicker`      | [`forms/ColorPicker.tsx`](../src/components/forms/ColorPicker.tsx)                     | HSV plane + hue + HEX/RGB + swatches (no deps)                  |
| `StatusBadge`      | [`indicators/StatusBadge.tsx`](../src/components/indicators/StatusBadge.tsx)           | Inventory status chips                                          |
| `ChipGroup`        | [`navigation/ChipGroup.tsx`](../src/components/navigation/ChipGroup.tsx)               | Multi-select filter chips (`aria-pressed`)                      |
| `SegmentedControl` | [`navigation/SegmentedControl.tsx`](../src/components/navigation/SegmentedControl.tsx) | Exclusive segment strip; `--segment-*` vars; hover = active hue |
| `Stepper`          | [`navigation/Stepper.tsx`](../src/components/navigation/Stepper.tsx)                   | Form wizard steps (≠ Workflow)                                  |
| `CodeBlock`        | [`data/CodeBlock.tsx`](../src/components/data/CodeBlock.tsx)                           | Plain read-only code + CopyButton (+ line #, tabSize)           |
| `DescriptionList`  | [`data/DescriptionList.tsx`](../src/components/data/DescriptionList.tsx)               | Resource key/value pairs                                        |
| `StatDisplay`      | [`data/StatDisplay.tsx`](../src/components/data/StatDisplay.tsx)                       | Metric tile on Card (tone + text)                               |
| `MoneyAmount`      | [`data/MoneyAmount.tsx`](../src/components/data/MoneyAmount.tsx)                       | ISO 4217 display from integer minor units                       |
| `MoneyInput`       | [`forms/MoneyInput.tsx`](../src/components/forms/MoneyInput.tsx)                       | Amount entry; ISO via Intl; BTC built in                        |
| `BtcInput`         | [`forms/BtcInput.tsx`](../src/components/forms/BtcInput.tsx)                           | Satoshi API on MoneyInput (`btc` \| `sats` unit)                |
| `FeeRateControl`   | [`forms/FeeRateControl.tsx`](../src/components/forms/FeeRateControl.tsx)               | sat/vB slider + presets                                         |
| `BtcAmount`        | [`data/BtcAmount.tsx`](../src/components/data/BtcAmount.tsx)                           | BTC / sats display from satoshi integers                        |
| `AddressDisplay`   | [`data/AddressDisplay.tsx`](../src/components/data/AddressDisplay.tsx)                 | Middle-truncate address + CopyButton                            |
| `MaskedAccount`    | [`data/MaskedAccount.tsx`](../src/components/data/MaskedAccount.tsx)                   | Masked account / IBAN + CopyButton                              |
| `ActivityRow`      | [`data/ActivityRow.tsx`](../src/components/data/ActivityRow.tsx)                       | Send/receive activity list row                                  |
| `LedgerRow`        | [`data/LedgerRow.tsx`](../src/components/data/LedgerRow.tsx)                           | Debit/credit + optional running balance                         |
| `Sparkline`        | [`data/Sparkline.tsx`](../src/components/data/Sparkline.tsx)                           | Peer-free SVG metric sparkline                                  |
| `SeedPhrase`       | [`data/SeedPhrase.tsx`](../src/components/data/SeedPhrase.tsx)                         | Backup word grid; `words.length` = n; fixed `ch` slots          |
| `Separator`        | [`layout/Separator.tsx`](../src/components/layout/Separator.tsx)                       | Thematic `hr` break (horizontal / vertical)                     |
| `Collapsible`      | [`layout/Collapsible.tsx`](../src/components/layout/Collapsible.tsx)                   | Single disclosure atom                                          |
| `Accordion`        | [`layout/Accordion.tsx`](../src/components/layout/Accordion.tsx)                       | APG accordion (single / multiple)                               |
| `ResizablePanel`   | [`layout/ResizablePanel.tsx`](../src/components/layout/ResizablePanel.tsx)             | Two-pane split + keyboard / pointer handle                      |
| `ContextMenu`      | [`overlays/ContextMenu.tsx`](../src/components/overlays/ContextMenu.tsx)               | Right-click APG menu                                            |
| `Timeline`         | [`data/Timeline.tsx`](../src/components/data/Timeline.tsx)                             | Ordered event rail + optional StatusBadge                       |

| `TreeView` | [`data/TreeView.tsx`](../src/components/data/TreeView.tsx) | APG tree + `end` slot (`snug` \| `justify`) |
| `LogViewer` | [`data/LogViewer.tsx`](../src/components/data/LogViewer.tsx) | Live-tail chrome; parent filters/streams `lines` |
| `Skeleton` | [`feedback/Skeleton.tsx`](../src/components/feedback/Skeleton.tsx) | Placeholder bones |
| `Select` | [`forms/Select.tsx`](../src/components/forms/Select.tsx) | Single listbox (shared OptionPicker; optional search) |
| `Combobox` | [`forms/Combobox.tsx`](../src/components/forms/Combobox.tsx) | Searchable listbox + multi chips (shared OptionPicker) |
| `ToolbarSelect` | [`navigation/ToolbarSelect.tsx`](../src/components/navigation/ToolbarSelect.tsx) | Nav chrome value pickers |
| `ProgressBar` | [`feedback/ProgressBar.tsx`](../src/components/feedback/ProgressBar.tsx) | Determinate / indeterminate |
| `CircularProgress` | [`feedback/CircularProgress.tsx`](../src/components/feedback/CircularProgress.tsx) | Compact progress ring (`progressbar`) |
| `ProgressGroup` | [`feedback/ProgressGroup.tsx`](../src/components/feedback/ProgressGroup.tsx) | Parallel lanes + composite |
| `QuotaMeter` | [`indicators/QuotaMeter.tsx`](../src/components/indicators/QuotaMeter.tsx) | Soft-limit gauge (`meter`) |
| `Popover` | [`overlays/Popover.tsx`](../src/components/overlays/Popover.tsx) | Non-modal floating panel |
| `CommandPalette` | [`overlays/CommandPalette.tsx`](../src/components/overlays/CommandPalette.tsx) | Modal jump / command list |
| `ResourceGraph` | [`data/ResourceGraph.tsx`](../src/components/data/ResourceGraph.tsx) | SVG dependency map + edge list |
| `FlowCanvas` | [`flow/FlowCanvas.tsx`](../src/components/flow/FlowCanvas.tsx) via `/flow` | Hybrid editable flow canvas (optional `elkjs` peer) |
| `VisuallyHidden` | [`a11y/VisuallyHidden.tsx`](../src/components/a11y/VisuallyHidden.tsx) | Screen-reader-only text |
| `DiffView` | [`data/DiffView.tsx`](../src/components/data/DiffView.tsx) | Line + tree diffs (`@wahidgroup/veneer/diff`) |
| `PlanSummary` | [`data/PlanSummary.tsx`](../src/components/data/PlanSummary.tsx) | IaC counts + DiffView tree (`@wahidgroup/veneer/diff`) |

Utils (barrel):

| Symbol                                | Path                                                | Use for                           |
| ------------------------------------- | --------------------------------------------------- | --------------------------------- |
| `parsePaymentUri` / `buildPaymentUri` | [`utils/paymentUri.ts`](../src/utils/paymentUri.ts) | BIP-21 `bitcoin:` URI parse/build |

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
