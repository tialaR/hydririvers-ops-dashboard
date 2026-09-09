# 0052 - Owned Cargo list screen ownership

## Status

Accepted

## Context

The authenticated "Minhas Cargas" list still lived inside `shipper-mobile-flow`, even after cargo domain, repositories and presentation primitives moved to `features/cargo/owned`.

Keeping the complete list screen under a persona-wide feature preserved duplicate ownership and made future evolution of the authenticated cargo journey depend on a God Feature.

## Decision

1. The canonical authenticated cargo list body belongs to `src/features/cargo/owned/screens/owned-cargo-list-screen.tsx`.
2. `shipper-mobile-flow/screens/my-cargoes-screen.tsx` becomes a temporary compatibility adapter responsible only for the persona shell and legacy UI primitives that have not yet been extracted.
3. The canonical owned screen may not import `shipper-mobile-flow`.
4. Existing route, i18n keys, filtering behavior, cargo data and visual composition remain unchanged.
5. Legacy persona owned-cargo screen debt must continue to shrink and may never grow.

## Consequences

- `cargo/owned` owns list behavior and presentation.
- The persona feature loses another substantial screen body without forcing unrelated shell primitives into cargo ownership.
- Future work can extract or neutralize the remaining shell/search/sheet adapters independently.
