# 0058 - Public Cargo route composition and legacy screen collapse

## Status
Accepted

## Context
After the public cargo domain/data/application spine and presentation were moved to `features/cargo/public`, two compatibility screens still lived inside `features/shipper-mobile-flow`. They contained no public-cargo business ownership, only composition of the mobile shell and existing UI adapters.

## Decision
Remove the two legacy public cargo screens from the persona feature. Keep route-specific client composition next to the App Router pages, while canonical public cargo presentation remains under `features/cargo/public`.

The route client layer may compose the existing mobile shell and temporary UI adapters, but must not move public cargo business rules back into the persona feature.

## Consequences
- `shipper-mobile-flow` shrinks by two files.
- Public cargo presentation has a single canonical owner.
- The server pages consume `cargo/public` application use cases and delegate client-only shell composition locally.
- Existing routes, i18n, privacy rules and visual behavior remain unchanged.
