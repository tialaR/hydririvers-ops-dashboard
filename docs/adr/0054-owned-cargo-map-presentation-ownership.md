# 0054 - Owned cargo map presentation ownership

## Status
Accepted

## Context
The authenticated cargo map was still presented by `shipper-mobile-flow` after owned-cargo data, list, detail and documents had moved to `features/cargo/owned`.

## Decision
1. `features/cargo/owned/screens/owned-cargo-map-screen.tsx` owns cargo-facing map controls, status, context content and interaction.
2. The canonical screen receives the map renderer and bottom-sheet primitive through explicit composition boundaries and does not import `shipper-mobile-flow`.
3. The existing `operation-map-screen` path is retained as a shrinking compatibility bridge for persona shell, legacy route data and MapLibre rendering. No new file is added to the contained Persona God Feature.
4. The legacy `cargo-map-screen.tsx` is removed and the route points to `OperationMapScreen` directly.
5. Map-specific classes leave `shared-ui.module.sass` and move beside the canonical owned screen.
6. A later Waterway Map attack will migrate the remaining route-data/MapLibre infrastructure to its correct operational ownership.

## Consequences
- owned cargo owns its map experience;
- Persona God Feature file count shrinks instead of growing;
- Shared UI God Stylesheet shrinks again;
- legacy MapLibre debt is visible behind one existing bridge;
- routes, permissions, translations, map behavior and business rules stay unchanged.
