# ADR: Mobile Bottom Sheet and Map Pattern

## Status
Accepted

## Context
The HydroRivers mobile experience uses multiple overlays: notifications, search, filters, menus, and map expansion. Separate implementations caused scroll leaks, z-index conflicts, and inconsistent interactions.

## Decision
Centralize overlays on a single bottom sheet primitive, backed by a shared body-scroll lock hook, and keep the mobile map in two modes: compact inline and fullscreen landscape-friendly.

## Consequences
- fewer overlay bugs;
- consistent accessibility and focus management;
- a predictable z-index hierarchy;
- easier maintenance for future mobile features.

## Alternatives considered
- keep separate sheet implementations per feature;
- use native selects and modals for mobile overlays;
- keep the map as a scaled-down desktop component.
