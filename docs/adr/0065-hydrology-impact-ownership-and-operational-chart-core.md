# ADR 0065 — Hydrology/Impact ownership and operational chart core

## Status
Accepted in SO-019 Wave 01.

## Context
After SO-018, `shipper-mobile-flow` still owned Hydrology and Impact application use cases, repository contracts, mocks, presentation screens and a Recharts implementation. Hydrology, Impact and Landing were also coupled through a single `HydroRepository`, making a persona-oriented feature the owner of unrelated product capabilities.

## Decision
- `src/features/hydrology` owns hydrology domain, repository contract, mock adapter, application orchestration and presentation content.
- `src/features/impact` owns the operational impact summary/chart data and presentation content, reusing the already-existing Impact capability boundary.
- `src/shared/design-system/patterns/operational-chart` becomes the neutral, portable chart rendering pattern on top of Recharts.
- The chart pattern receives translated copy and semantic status labels as data. It does not import persona or feature code.
- The Shipper route layer remains responsible for composing capability content inside the existing mobile product shell. This preserves chrome, navigation, visual behavior and route contracts without making Hydrology or Impact depend on the persona feature.
- Landing chart data remains inside the Shipper experience until Landing ownership is attacked separately.

## Constraints
- No business-rule changes.
- No i18n key changes.
- No route changes.
- No visual redesign.
- Recharts remains the chart engine; no custom chart engine is introduced.
- `features/hydrology -> shipper-mobile-flow = 0`.
- `features/impact -> shipper-mobile-flow = 0`.
- shared Design System code must not import feature/persona code.

## Consequences
The old shared Hydro repository disappears, Hydrology and Impact can evolve independently, and chart rendering stops being persona-owned while preserving the current visual contract.
