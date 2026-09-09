# 0039 - Sheet semantics and glass as material

## Status

Accepted

## Context

The repository had two independent sheet implementations owning their own semantic container while the design system also encoded glass in component names. This made sheet semantics harder to extract and allowed a visual material to become an architectural identity.

## Decision

1. `src/shared/design-system/core/sheet` owns the product-neutral semantic sheet container.
2. Existing sheet adapters keep portals, focus management, drag/snap behavior, motion and visual CSS.
3. Generic glass vocabulary lives under `src/shared/design-system/materials/glass`.
4. The old `liquid-glass-material` API remains only as a compatibility alias during migration.
5. Product names and product tokens are forbidden from the generic sheet core.

## Consequences

- Sheet semantics become reusable outside this product.
- Existing visual behavior remains stable.
- Glass becomes a material choice instead of the identity of the semantic component.
- Legacy `LiquidGlass*` primitives can be migrated incrementally in later waves.
