# ADR 0069: Operational map and create cargo ownership

## Status
Accepted in SO-023.

## Decision
Owned-cargo operational map data, GeoJSON adaptation, MapLibre presentation and full-screen map composition belong to `features/waterway-map`, while the owned-cargo route preview and create-cargo presentation belong to `features/cargo/owned`.

`shipper-mobile-flow` is no longer an owner or external dependency for these experiences. The final consumer of its legacy `shared-ui.module.sass` is removed, so that stylesheet is retired.

## Constraints
- `features/waterway-map` and `features/cargo` must not import `shipper-mobile-flow`.
- Route behavior, i18n keys, MapLibre behavior, fallback behavior and visual contracts remain unchanged.
- No parallel map engine is introduced. Existing MapLibre ownership is strengthened.
- `shipper-mobile-flow` may only continue shrinking.
