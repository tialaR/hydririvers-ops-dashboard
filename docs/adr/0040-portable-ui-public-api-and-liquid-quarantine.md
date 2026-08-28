# 0040 - Portable UI public API and Liquid Glass quarantine

## Status
Accepted

## Context
The repository historically exposed implementation/style names such as `LiquidGlass*`, `Ds*`, `Hydro*` and legacy shared UI paths. Those names are useful compatibility seams, but they are not a portable design-system vocabulary.

## Decision
1. `src/shared/design-system/index.ts` is the canonical portable public API.
2. Portable consumers use neutral concepts such as `Button`, `Surface`, `TextField`, `SearchField`, `Sheet`, `Card`, `Badge`, `ProgressBar` and `glassMaterial`.
3. `src/shared/design-system/core` cannot depend on HydroRivers, Liquid Glass, generated Hydro tokens, feature code, app code or compatibility UI namespaces.
4. Existing `LiquidGlass*` primitives remain compatibility/themed adapters while migration proceeds.
5. New product-facing direct imports from `primitives/liquid-glass-*` are forbidden. The Wave 07 gate records the current debt and blocks growth.
6. Storybook/package extraction should target the canonical public API, not legacy adapter paths.

## Consequences
The generic vocabulary becomes stable before visual migration is complete. Existing screens remain untouched, while architectural debt is prevented from expanding.
