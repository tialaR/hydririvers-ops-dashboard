# HydroRivers Design System — Storybook

## Purpose

Storybook is the living catalog for reusable HydroRivers UI. It documents component contracts, states, semantic themes and accessibility before those pieces are composed into product screens.

## Commands

`npm run storybook` starts the local catalog on port 6006.  
`npm run build-storybook` verifies that the catalog can be statically built.

## Theme contract

Stories use `data-hy-theme="dark|light"` and the semantic bridge in `src/shared/design-system/foundations/semantic-tokens.css`.

The `--hy-*` variables are the forward-facing semantic contract. Existing variables remain aliases only while production components migrate incrementally.

## Promotion rule

A story is not proof that a component is APPROVED/DIAMOND. Storybook proves implementation states. Product homologation still follows the canonical HydroRivers Source of Truth.

## Published catalog

- `Primitives/Button`: primary, secondary, ghost, loading and disabled states.
- `Primitives/StatusBadge`: full logistics status vocabulary, dot and density states.
- `Primitives/ProgressBar`: semantic tones, boundaries and visible value.
- `Primitives/Surface`: material, padding, semantic role and interactive state.
- `Primitives/IconButton`: role, icon, active, badge, loading and disabled states.
- `Primitives/FilterChip`: selected, unselected, disabled, long-label and interactive group states.
- `Primitives/SearchField`: empty, populated, disabled and controlled interaction states.
- `Operational/CargoStatusBadge`: first stabilized HydroRivers operational composition, reusing the shared `StatusBadge` contract.
- `Operational/CargoCard`: first complete operational block, covering logistics states, selection, disabled behavior, direct navigation and long-content resilience.
- `Patterns/BottomSheet`: production modal pattern with focus management, Escape, overlay, footer and keyboard-operable snaps.
- `Operational/CargoDetailSheetContent`: cargo detail composition with route, ETA, delivery forecast and section states.
- `Operational/CargoRouteLine`: card and sheet routes, terminal metadata, absent metadata and long-corridor resilience.
- `Operational/CargoEtaBlock`: compact ETA, unavailable value, forecast metrics and revised-window states.
- `Operational/CargoFilterSheetContent`: seven operational filter groups, default and active selections, long labels and interactive controlled state.

Every story runs in Dark and Light through the global theme control. The a11y addon is configured with `test: 'error'`, so accessibility violations are blocking when stories run through Storybook's test integration rather than remaining informational.
