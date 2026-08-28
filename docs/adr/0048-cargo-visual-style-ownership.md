# 0048 - Cargo visual styles leave the persona God stylesheet

## Status
Accepted

## Context
`shipper-mobile-flow/components/shared-ui/shared-ui.module.sass` became a broad styling dependency for unrelated product capabilities. SO-013 Wave 01 froze it as shrinking debt. Cargo screens still consumed that file, preventing presentation ownership from moving cleanly into the Cargo feature.

## Decision
Cargo-specific screen styles are carved out into `src/features/cargo/styles/cargo-flow.module.sass`.

The following screens stop consuming the persona God stylesheet:
- owned cargo list;
- public cargo list;
- owned cargo detail;
- public cargo detail;
- cargo documents.

Rules shared with non-cargo consumers are copied temporarily instead of deleted from the legacy stylesheet. Cargo-only rules are removed from the legacy stylesheet. This preserves behavior while allowing the debt file to shrink safely.

## Boundaries
- No business rule changes.
- No route changes.
- No component behavior changes.
- `features/cargo` must not import from `shipper-mobile-flow`.
- `shared-ui.module.sass` remains shrinking debt and may never grow again.

## Consequences
This wave deliberately prioritizes ownership over redesign. The next screen-extraction wave can move Cargo presentation without carrying a hidden styling dependency back into the persona feature.
