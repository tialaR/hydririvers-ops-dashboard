# 0037 - Product-neutral fields and status primitives

## Status

Accepted

## Context

The UI core already owns Badge, Button, Surface and IconButton semantics. Form controls and status presentation still duplicated semantic DOM and interaction behavior inside legacy shared components.

## Decision

Move semantic ownership of TextField, SearchField, FilterChip and StatusBadge to the product-neutral core. Existing shared components remain compatibility adapters and visual skins.

Business mappings, labels and product status vocabularies stay outside the core. CSS remains outside the core during this migration stage.

## Consequences

- the extractable core grows without product naming;
- compatibility APIs remain stable;
- styling can migrate independently later;
- product status vocabulary cannot leak into the generic package boundary.
