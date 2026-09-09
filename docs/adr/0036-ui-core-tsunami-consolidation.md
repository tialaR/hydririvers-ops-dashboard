# 0036 - UI core primitive consolidation

## Status

Accepted

## Context

The repository contains multiple live UI layers with overlapping primitive concepts. The reusable design-system core must be extractable without carrying product naming, business semantics, or visual theme decisions.

## Decision

1. `src/shared/design-system/core` owns product-agnostic DOM semantics for reusable primitives.
2. Compatibility layers may keep their current public APIs and CSS while migration is in progress.
3. Visual identity stays in compatibility skins, themes, materials, and patterns, not in the generic core.
4. This wave consolidates the native DOM ownership of `Button`, `Surface`, and `IconButton` in one attack.
5. Existing product behavior, press logic, variants, CSS classes, and consumers remain compatible.
6. Business concepts such as cargo status and risk do not enter the generic core. They remain product/domain adapters over neutral primitives.
7. Legacy paths are migration surfaces, not sources for new primitives.

## Extraction target

The core must remain suitable for a future package boundary such as `packages/ui` and for isolated documentation tooling such as Storybook without requiring product code.

## Non-goals

- no visual redesign;
- no token migration in this wave;
- no route or product-flow changes;
- no mass rename of legacy PascalCase filenames;
- no removal of compatibility APIs yet.

## Validation

The SharkOps contract verifies product-neutral core files, single native DOM ownership, compatibility delegation, public exports, repository boundaries, type safety, lint, i18n, unit/integration tests, production build, and the existing mobile P0 suite excluding its separately tracked touch-target false-negative contract.
