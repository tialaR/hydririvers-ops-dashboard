# ADR: Mobile Bottom Sheet and Map Pattern

## Status
Accepted

## Context
The HydroRivers mobile experience uses multiple overlays: notifications, search, filters, menus, and map expansion. Separate implementations caused scroll leaks, z-index conflicts, and inconsistent interactions.

## Decision
Centralize overlays on a single bottom sheet primitive (`src/shared/components/bottom-sheet/`), backed by a shared body-scroll lock hook, and keep the mobile map in two modes: compact inline and fullscreen landscape-friendly.

The approved map route sheet (`MobileRouteSheet`) is a **composition** only: shell/drag/snap/overlay live in shared; route content stays in `waterway-map` via `children`.

## Consequences
- fewer overlay bugs;
- consistent accessibility and focus management;
- a predictable z-index hierarchy;
- easier maintenance for future mobile features.

## Alternatives considered
- keep separate sheet implementations per feature;
- use native selects and modals for mobile overlays;
- keep the map as a scaled-down desktop component.
