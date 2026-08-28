# 0041 - Responsive visual language contract

## Status

Accepted

## Context

HydroRivers is mobile-first, but portfolio quality cannot stop at a narrow mobile viewport. Tablet and desktop must carry the same visual intent, information hierarchy and interaction quality while preserving established business rules.

The design system is being extracted behind a product-neutral public API. Visual implementation should therefore use reusable foundations and theme adapters instead of coupling product behavior to a specific visual trend or third-party UI implementation.

## Decision

1. Mobile remains the default layout mode.
2. Tablet and desktop are first-class presentation targets, not stretched mobile canvases.
3. Responsive behavior is expressed through product-neutral layout foundations under `src/shared/design-system/foundations/responsive`.
4. HydroRivers-specific visual identity remains under `src/shared/design-system/themes/hydrorivers`.
5. Business/domain modules must not be imported by design-system foundations or theme files.
6. Visual work may change composition, density, spacing, hierarchy, motion and materials, but must not change business rules, route contracts or domain state semantics unless a separate architecture wave explicitly authorizes it.
7. Liquid Glass is optional. It may remain only where it improves hierarchy, depth or interaction. No component is required to preserve a Liquid Glass appearance.
8. Visual validation must cover mobile, tablet and desktop targets.

## Target viewport classes

- compact: default / mobile-first
- medium: tablet-class layouts
- wide: desktop-class layouts

These are design-system layout classes, not business concepts.

## Consequences

- Visual refinement can start without reopening product rules.
- Responsive layouts can diverge structurally while keeping shared component semantics.
- Future Storybook/package extraction receives a stable responsive vocabulary.
- Product-specific visual identity can evolve independently from reusable primitives.
