# 0041 - Zero direct material implementation imports in product code

## Status

Accepted

## Context

The UI core now exposes a neutral public vocabulary and glass is classified as a material. Product code still had one direct dependency on `liquid-glass-*` primitives in the mobile cargo lab, which leaked implementation naming across the design-system boundary.

## Decision

1. Product and feature code must not import `src/shared/design-system/primitives/liquid-glass-*` directly.
2. Neutral component adapters are the migration boundary for implementation-heavy controls that are not yet fully core-owned.
3. `BottomNavigation` and interactive `BottomSheet` are introduced as neutral adapters.
4. Existing Liquid Glass primitives remain private compatibility implementations until later decomposition waves.
5. Direct product-consumer debt is ratcheted to zero and may not regress.

## Consequences

- Product code no longer knows the current material implementation name.
- Visual behavior remains unchanged.
- Future replacement of glass styling does not require changing feature imports.
- Later waves may replace aliases with neutral core-owned behavior without touching consumers.
