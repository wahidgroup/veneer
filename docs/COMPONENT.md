# Component stamp

The key words "MUST", "MUST NOT", "SHOULD", and "MAY" are interpreted as in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

Canonical reference: [`src/components/forms/Button.tsx`](../src/components/forms/Button.tsx).

## Layout

```
src/components/<category>/<Name>.tsx
src/components/<category>/<Name>.test.tsx
```

- File name MUST match the primary export (`Input.tsx`).
- Tests MUST be co-located. Setup helpers live in `src/test/` only.
- Categories: `forms/`, `feedback/`, `indicators/`, `overlays/`, `navigation/` (add folders when a new IA bucket appears).
- Public API stays flat via `src/index.ts` - no category re-exports.

## Implementation

| Rule         | Requirement                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| Exports      | Named: `Name`, `nameVariants` (if any), `NameProps` type                         |
| Variants     | `cva` + `cn(variants(...), className)`                                           |
| DOM          | Extend `ComponentProps<"el">` (+ `VariantProps`)                                 |
| Slot         | `data-slot="<name>"` on root                                                     |
| Tokens       | Semantic utilities only; no `dark:` in primitives                                |
| Icons        | Prefer `lucide-react`; extra icons via `ReactNode` slots                         |
| Reuse        | Prefer Veneer primitives inside composites (e.g. `Button` ghost/icon for chrome) |
| Control flow | No ternaries in `.ts` / `.tsx`                                                   |
| Docs         | Multi-line JSDoc on the public component                                         |
| Barrel       | Update `src/index.ts` + `EXPECTED_EXPORTS` in the same PR                        |

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

## Definition of Done

A component PR MUST NOT merge unless:

1. `make ci` PASS
2. Stamp + tests + export lock satisfied
3. Code Reviewer PASS
4. QA PASS
5. Software Architect PASS for composites only (Modal, DataTable, AppShell, Stepper, LogViewer)
