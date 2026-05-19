# Hydroway Map Spike Freeze

## Status

The Hydroway MapLibre spike is frozen as a technical foundation, not as a production-ready visual experience.

## What is validated

- Isolated dev route for hydroway map spike.
- MapLibre provider foundation.
- GeoJSON data model foundation.
- Cargo route smoke coverage.
- Fallback SVG route.
- Locale route coverage.
- Desktop /cargas route preserved.
- Official /cargas/[id]/mapa route preserved.
- Mobile /cargas smoke preserved.
- Automated Playwright route smoke test.

## Why frozen

The visual experience still needs a dedicated cartography/data-design track. Attempts to solve visual polish, river geography, route animation, camera choreography and enriched mock data in a single implementation pass caused excessive complexity and regressions.

## Next recommended map track

Create a separate V3 map initiative with:

1. Real geodata research and simplified hydrographic dataset.
2. Dedicated river polygon generation.
3. Cartographic design system for MapLibre.
4. Visual smoke screenshots.
5. Controlled integration into /cargas/[id]/mapa behind a feature flag.

## Current rule

Do not integrate the MapLibre spike into production routes until a dedicated V3 map plan is approved.
