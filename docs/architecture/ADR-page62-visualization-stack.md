# ADR — Page 62 visualization stack

Status: accepted for D04–D05 implementation
Date: 2026-09-24

## Context

The Page 62 desktop blueprint treats cockpit data as operational intelligence, not decoration.
D04–D05 needs route progress, ETA delta, signal freshness, risk, telemetry and a real operational timeline without turning every quantitative value into the same progress bar.

## Decision

### Apache ECharts 6

Use modular ECharts imports through `echarts/core` and the Canvas renderer for operational visualizations.

Current Page 62 responsibilities:
- route/progress gauge;
- telemetry series;
- reusable operational line/bar primitives;
- future dense operational charts when the screen requires richer interactions or larger datasets.

Rules:
- register only required chart/component modules;
- use Canvas + dirty-rect rendering;
- keep chart animation disabled in deterministic Storybook/visual-contract surfaces;
- preserve an accessible textual/table equivalent at the card/pattern level;
- do not use a chart when a direct number, delta, status or semantic encoding is clearer.

### Motion for React

Use `motion/react` for meaningful interface transitions:
- cockpit ↔ timeline state transition;
- active tab continuity;
- layout changes driven by user interaction.

Rules:
- `MotionConfig reducedMotion="user"` is mandatory for Page 62 motion surfaces;
- Motion does not animate charts for decoration;
- do not duplicate the runtime with `framer-motion`.

## Retired from this path

### Recharts

Removed from the runtime after the operational chart primitives migrated to ECharts.
Reason: the D04–D05 direction requires one richer visualization engine rather than maintaining two overlapping chart stacks.

## Considered, not installed

### uPlot

Excellent candidate for extremely dense/high-frequency time-series telemetry.
Not installed because D04–D05 does not yet justify a second chart engine. Reconsider only with measured data-volume/performance evidence.

### Visx

Strong low-level React/D3 primitives and maximum design-system control.
Not selected because reproducing the same interaction/axis/tooltip/large-data infrastructure would increase implementation and maintenance cost for this cockpit.

### Nivo

Productive high-level React visualization library.
Not selected because the current need favors ECharts' broader operational chart surface and Canvas-oriented rendering in one engine.

## Guardrail

The CI contract `check:page62-cockpit` fails if:
- Page 62 stops reusing the canonical Shipment Card;
- D04/D05 Storybook states disappear;
- ECharts or Motion anchors disappear;
- Recharts or `framer-motion` return to application source.

This ADR does not promote every future HydroRivers visualization to ECharts automatically.
Choose the simplest semantic representation that communicates the operational decision clearly.
