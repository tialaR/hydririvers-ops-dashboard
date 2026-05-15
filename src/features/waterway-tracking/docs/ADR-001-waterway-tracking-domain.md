# ADR-001: Waterway tracking domain and scenario-driven mocks

## Status

Accepted for feature branch.

## Context

The immersive cargo map needs to evolve from a visual prototype into an operational waterway tracking experience. Brazilian waterway logistics depend on corridor, navigability, draft, drought, dredging, port windows, signal, documentation and contingency conditions.

## Decision

Create a feature-based domain under `src/features/waterway-tracking` with:

- domain types;
- corridor mocks;
- cargo tracking scenario mocks;
- utility helpers for labels and formatting.

The initial map integration reads scenarios by `cargoId`, allowing QA to open several map states through `/[locale]/rastreio/[cargoId]`.

## Consequences

- The App Router route remains responsible for routing/page composition.
- Domain and mock data live inside the feature.
- Scenarios can be replaced by API/services later without rewriting the map UI.
- Visual QA can cover on-time, attention, delayed, restricted and contingency states before backend integration.
