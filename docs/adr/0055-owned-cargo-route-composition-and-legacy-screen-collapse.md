# 0055 - Owned cargo route composition and legacy screen collapse

## Status

Accepted

## Context

SO-015 moved the authenticated cargo presentation into `features/cargo/owned`, but three compatibility screens remained in `features/shipper-mobile-flow/screens` only to compose route shell and legacy UI primitives. Keeping these files preserved the historical persona-screen namespace after ownership had already moved.

## Decision

1. Delete the remaining owned-cargo compatibility screens from `shipper-mobile-flow/screens`.
2. Keep canonical business presentation in `features/cargo/owned`.
3. Move temporary shell/UI-primitive composition to route-local client adapters under `src/app/[locale]/(shipper-mobile-flow)/minhas-cargas`.
4. Route adapters may consume legacy shell primitives while migration continues; canonical `cargo/owned` code may not.
5. No business behavior, permissions, URLs, translations or visual intent changes in this wave.

## Consequences

- SO-015 legacy owned-screen debt reaches zero.
- The persona feature loses three files without creating replacement files inside it.
- Remaining persona coupling is explicit route/infrastructure debt instead of duplicated feature presentation.
- Future work can neutralize shell primitives independently without reopening owned-cargo ownership.

## Containment baseline migration

The persona containment baseline transfers the three existing route consumer slots to the three route-local client adapters. This is a one-for-one consumer ownership migration: the frozen external consumer budget remains 21 and does not increase.
