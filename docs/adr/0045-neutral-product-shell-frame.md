# 0045 - Neutral product shell frame

## Status
Accepted

## Context
The persona-oriented `shipper-mobile-flow` owns a mobile application shell together with business-facing screens. This creates a structural blocker for extracting presentation by business capability because cargo screens would need to depend back on the persona feature merely to obtain layout chrome.

## Decision
Introduce a product-neutral `ProductShellFrame` under `src/shared/layout`.

The shared frame owns only structural composition slots: header, content, navigation and overlays. It must not import feature code, know personas, routes, cargo semantics or product branding.

`MobileAppShell` remains temporarily as the persona adapter and continues to own route resolution, provider state and shipper-specific chrome while delegating layout structure to the neutral frame.

## Consequences
- Business presentation can migrate away from the persona God Feature without copying shell structure.
- Shared layout remains dependency-safe.
- Existing routes and behavior remain unchanged.
- The persona adapter can shrink incrementally in later waves.
