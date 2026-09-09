# ADR-001: Waterway tracking domain as the first operational source for cargo list and immersive map

## Status

Accepted for the `feat/waterway-tracking-domain-v1` branch.

## Context

HydriRivers is not modeling a generic marketplace. Its main operational promise is hydro-logistics. Because of that, the immersive map cannot remain a decorative background and the cargo list cannot rely only on generic origin, destination and status labels.

Brazilian waterway operations depend on a set of operational facts that are specific to this domain:

- corridor and strategic river system;
- navigable segment being used by the cargo;
- vessel and operational stage;
- navigability constraints such as drought, draft, dredging, signaling or port windows;
- ETA confidence and signal quality;
- document readiness;
- estimated cost and environmental impact.

The project already had:

- cargo mocks with partial hydro fields such as `corridor`, `mainRiver`, `documentReadiness` and `connectivity`;
- an immersive cargo map;
- a first set of scenario mocks for visual QA.

However, that information was still too flat. It was enough to render prototypes, but not enough to support a consistent operational layer shared by:

- the cargo list;
- the immersive map;
- future action sheets and side rails;
- future APIs.

## Decision

Create the first dedicated domain base under `src/features/waterway-tracking`, with deterministic mocks and explicit types for:

- corridors;
- navigable segments;
- constraints;
- cargo waterway tracking snapshots.

The first version includes the minimum strategic corridors needed by the product concept:

- Hidrovia do Amazonas;
- Hidrovia do Madeira;
- Hidrovia Tapajós-Teles Pires;
- Hidrovia Tocantins-Araguaia;
- Barra Norte.

The domain is intentionally mock-driven and deterministic in this phase:

- no external API dependency;
- no non-deterministic generators;
- stable scenarios by `cargoId`;
- safe to use in QA, screenshots, regression checks and future adapters.

## Domain shape

The waterway feature becomes responsible for the canonical operational vocabulary used by cargo tracking:

- `WaterwayCorridor`
- `WaterwaySegment`
- `WaterwayConstraint`
- `CargoWaterwayTracking`

Each cargo tracking scenario now carries both:

- the real cargo lifecycle status from the cargo list, such as `open`, `bidding`, `contracting`, `reserved`, `boarded`, `delivered`;
- the waterway operational status used by the immersive map, such as `on-time`, `attention`, `delayed`, `restricted`, `contingency`.

This keeps the cargo lifecycle and the hydro-operation state related but not collapsed into the same concept.

## Why the map is not decorative

The immersive map is treated as an operational panel, not as a hero illustration.

Future UI layers should consume the domain to communicate:

- which corridor is in use;
- which navigable segment is active;
- which vessel is associated with the movement;
- how much of the route is completed;
- whether the constraint is contractual, navigational or documentary;
- whether the operation is under normal flow, attention, delay, restriction or contingency.

This makes the map a read-model of the operation instead of a disconnected visual asset.

## Why deterministic mocks are required in v1

This phase exists to stabilize the modeling before wiring more UI or integrating backend sources.

Deterministic mocks are required because they:

- keep screenshots and QA flows stable;
- avoid hydration mismatch and flaky rendering;
- let the list and map evolve against the same source of truth;
- make future adapters replaceable without rewriting the presentation layer.

## Scope of the first version

The first version intentionally stops at:

- domain types;
- corridor mocks;
- cargo tracking mocks;
- simple progress helpers;
- public exports for future consumers.

It does not yet change:

- cargo list UI;
- immersive map visuals;
- routes;
- authentication;
- mock users;
- bottom navigation;
- desktop layout.

## How future UI should consume the domain

The intended consumption path is:

1. cargo data identifies the lifecycle status and the cargo identity;
2. a scenario adapter resolves or enriches a `CargoWaterwayTracking` snapshot;
3. the cargo list uses compact operational signals such as corridor, ETA, progress and main risk;
4. the immersive map consumes the full snapshot with route, vessel, constraints, documents and cost-impact layers.

The UI should remain a consumer of this domain, not the owner of the rules.

## Risks

Main risks identified for the next PRs:

- duplicate truths between marketplace mocks and waterway mocks;
- diverging status semantics between cargo list and immersive map;
- overloading cards with too many operational signals;
- coupling UI directly to mock-only field shapes;
- breaking filters if list integration starts reading multiple sources at once;
- breaking i18n if operational labels leak into UI without translation planning.

## Next steps

Suggested incremental rollout:

1. connect cargo list cards to the new hydro tracking snapshot;
2. connect immersive map to richer segment and constraint data;
3. align labels and filters with corridor-aware metadata;
4. add tests around scenario resolution and status mapping.
