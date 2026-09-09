# 0035 - Extractable UI core boundary

## Status

Accepted

## Context

HydroRivers currently has multiple live UI layers: `src/shared/components`, `src/shared/ui`, `src/shared/design-system`, and product-specific components inside features. The repository already declares the Hydro Design System as the source of truth, but runtime usage still spans parallel implementations.

The next architecture phase must reduce duplication without coupling reusable components to HydroRivers naming, cargo semantics, shipper flows, or a specific visual material.

## Decision

`src/shared/design-system` remains the canonical Design System boundary, but it is split conceptually into three responsibilities:

1. `core/` owns reusable, product-agnostic primitives and components.
2. `themes/hydrorivers/` owns HydroRivers visual identity and product theme mappings.
3. `patterns/` owns reusable compositions that may coordinate multiple core components without embedding business rules.

Feature components continue to own business semantics such as cargo status, operational risk, shipper actions, hydrology summaries, and domain-specific cards.

The generic core must use semantic names such as `Button`, `Surface`, `Badge`, `IconButton`, `Sheet`, and `SearchField`. Generic core APIs and tokens must not use HydroRivers, HydriRivers, `hy`, cargo, or shipper prefixes.

Liquid Glass is treated as a material/appearance option, not as the identity of a component family.

Existing `src/shared/components` and `src/shared/ui` namespaces are temporarily frozen by a ratchet gate. They may shrink during migration, but new top-level component namespaces cannot be added there.

## Target shape

```text
src/shared/design-system/
  core/
    primitives/
    components/
    tokens/
  themes/
    hydrorivers/
  patterns/
  materials/
```

The current folders under `src/shared/design-system` are not mass-migrated by this ADR. Migration happens in reversible waves after consumer and API analysis.

## Extraction path

The core boundary is intentionally designed so it can later move to a package such as `packages/ui` without carrying HydroRivers business semantics.

Possible future consumers include Storybook and other applications. Package naming is deliberately deferred until the core API stabilizes.

## Consequences

### Positive

- one explicit source of truth for reusable UI;
- product identity separated from reusable component behavior;
- safer future Storybook/package extraction;
- legacy namespaces can only shrink;
- feature components remain free to model business semantics.

### Cost

- temporary coexistence with legacy layers;
- adapters may exist during migration;
- visual parity must be verified per migration wave.

## Executable contract

`.sharkops/contracts/verify-ui-core-boundary.mjs` protects the ratchet.

The gate intentionally does not delete or rewrite existing components. Its first job is to stop architectural drift while the migration proceeds.
