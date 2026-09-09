# ADR 0066 — Product Shell / Chrome Ownership

## Status
Accepted in SO-020 Wave 01.

## Context
After SO-019, navigation, header, mobile shell, avatar/confirmation overlays, locale/theme controls and CTA wrappers still lived inside `features/shipper-mobile-flow`. These are product-shell/chrome concerns, not cargo, hydrology, impact, auth or persona-domain ownership.

The persona feature is under an explicit containment rule: it may shrink, never grow. `shared` also cannot import persona-specific code.

## Decision
Move the authenticated mobile product shell and chrome to `src/features/product-shell` while keeping `src/shared/layout/product-shell-frame` as the neutral layout primitive.

Move mobile visual scale/mixins to `src/shared/design-system/foundations`, because they are portable visual foundations consumed by multiple UI owners.

`features/product-shell` owns:
- mobile shell composition;
- header and bottom navigation composition;
- avatar and confirmation overlays;
- locale/theme/notification chrome controls;
- product-shell interaction context;
- route-to-shell navigation policy.

The extraction preserves existing routes, i18n keys, visual values, DOM behavior and business flow. This wave is architectural, not a redesign.

## Consequences
- `shipper-mobile-flow` drops from 69 to at most 44 files.
- external imports from the persona feature drop from 18 to at most 12.
- `features/product-shell -> shipper-mobile-flow` must remain zero.
- `shared -> shipper-mobile-flow` must remain zero.
- future visual hardening can target a stable shell boundary instead of editing persona code.
