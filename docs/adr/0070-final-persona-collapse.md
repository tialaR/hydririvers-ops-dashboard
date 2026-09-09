# ADR 0070: Final Persona Collapse

## Status
Accepted

## Decision
Retire `src/features/shipper-mobile-flow` after all business capabilities, product shell, maps, presentation states and cargo experiences have canonical owners.

The remaining 18 files were unreferenced compatibility UI/types with zero external consumers. They are deleted rather than promoted into a second design system.

## Consequences
- `shipper-mobile-flow` no longer exists as a feature implementation.
- Canonical capabilities remain under their business features and `shared/design-system` / `features/product-shell`.
- Architecture contracts accept the stronger terminal state where the legacy persona feature is absent.
- No business, visual, route or i18n behavior is intentionally changed.
