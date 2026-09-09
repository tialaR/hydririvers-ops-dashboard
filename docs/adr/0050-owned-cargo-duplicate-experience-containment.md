# 0050 - Contain duplicate owned-cargo presentation before consolidation

## Status
Accepted

## Context
HydroRivers currently contains two overlapping implementations for the authenticated owned-cargo journey:

- legacy persona-owned screens under `src/features/shipper-mobile-flow/screens`;
- cargo-owned presentation already present under `src/features/cargo/owned` and related cargo modules.

Moving files blindly would preserve duplication under new paths and could silently change business behavior or erase validated interaction work.

## Decision
1. The four legacy owned-cargo screens become shrinking migration adapters:
   - `my-cargoes-screen.tsx`
   - `cargo-detail-screen.tsx`
   - `documents-screen.tsx`
   - `cargo-map-screen.tsx`
2. Their combined source size may shrink, never grow.
3. No additional owned-cargo screen may be created inside `shipper-mobile-flow/screens`.
4. `cargo/owned` remains forbidden from importing `shipper-mobile-flow`.
5. New owned-cargo presentation must land in `features/cargo/owned`.
6. Existing routes and business behavior remain unchanged during this containment wave.

## Migration target
The next waves consolidate route composition onto cargo-owned presentation one slice at a time, with regression gates around permissions, data loading, navigation and visual behavior.
