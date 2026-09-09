# ADR 0067 - Cockpit, landing and chart ownership collapse

Status: **accepted**  
Date: 2026-08-28

## Context

After SO-020, `shipper-mobile-flow` still owned the mobile cockpit presentation/application layer, the shipper landing presentation/data, and two thin chart wrappers around the canonical operational chart Design System.

## Decision

- Mobile cockpit belongs to `features/dashboard`.
- Shipper landing belongs to `features/home`.
- Cockpit data reads the canonical owned-cargo repository directly from its feature boundary.
- Operational chart rendering uses `src/shared/design-system/patterns/operational-chart` directly; persona-local line/bar wrappers are retired.
- Existing copy, values, route behavior, i18n keys, visual dimensions and accessibility semantics are preserved.

## Guardrails

- `dashboard` and `home` must not depend on `shipper-mobile-flow`.
- `shipper-mobile-flow` may only shrink.
- This wave does not redesign the cockpit or landing and does not change business rules.
- Future visual evolution must build on Design System tokens and the canonical Recharts primitives.
