# ADR — Dashboard Visual Language Refresh

**Date:** 2026-09-24
**Status:** Accepted for WORKING / Page 62 and reusable dashboard patterns

## Context

The Page 62 desktop journey was functionally coherent, but several surfaces underused the desktop viewport and relied too heavily on small cards, compact charts and repeated progress/timeline patterns.

The visual references and HydroRivers product-design contracts require desktop to expose more intelligence simultaneously, semantic color to signal state/change rather than decorate every surface, visual encoding to match the decision being made, approved components to remain protected, and mobile to preserve intelligence later through a different composition.

## Decision

### Protected

COMP-CARGO-CARD-001 / ShipmentCard remains APPROVED / LOCKED. Its anatomy is not part of this refresh.

### Visual foundation

Dashboard surfaces use a neutral-first palette: noir/graphite canvas and surfaces, white/gray typography hierarchy, restrained neutral chart series, and semantic blue/green/amber/red reserved for information, success, attention and critical state.

Shared source: src/shared/design-system/foundations/dashboard-visual-tokens.css.

### Typography and density

Desktop surfaces receive stronger heading/body contrast, larger useful visual regions and more intentional vertical rhythm. Scroll in the Y axis is acceptable when it preserves comprehension.

### Charts

Apache ECharts 6 remains the primary chart engine after re-evaluation. It already covers line/area, bars, gauge, radar, multi-grid telemetry, rich interactive tooltips and responsive Canvas rendering. No second chart library is added without a measured product or performance gap.

Operational tooltips share one grammar in src/shared/design-system/patterns/operational-chart/operational-tooltip.ts.

### Reusable patterns added

- SegmentedGoalMeter: segmented completion/goal encoding.
- OperationalScheduleList: date/milestone list with functional icon, semantic left rail and status badge.
- OperationalContextChat: deterministic contextual DEMO assistant with suggested questions and cargo-grounded answers.

### Layout

Complex charts are not compressed to preserve a one-screen dashboard. Desktop may use wider chart surfaces and vertical scrolling. Cockpit telemetry becomes dominant; route context is repositioned instead of competing for chart width.

### Sidebar

The existing desktop shell already supports expanded/collapsed states. Its visual language is neutralized while preserving behavior. A duplicate sidebar implementation is not created merely to match a reference.

### Interaction

Color, iconography and motion communicate state. Motion remains restrained and respects reduced-motion behavior.

## Evidence / references

The refresh adapts the canonical HydroRivers reference grammar and the Studio Admin family supplied for chart proportions, neutral dark surfaces, typography hierarchy, collapsible navigation, expressive schedule/status rows and professional chat composition.

External research was used for principles, not pixel copying: Apple layout/split-view guidance for allocating space and hideable panes, Vercel dashboard examples for responsive/collapsible shell patterns, and Apache ECharts documentation/examples for tooltip and visualization capabilities.

## Guardrails

1. Shipment Card stays frozen.
2. Semantic state colors remain contract-driven.
3. No chart exists solely to decorate a screen.
4. No library is retained or added from inertia.
5. No timeline is used where comparison, magnitude, progress or distribution is the real question.
6. DEMO answers/data must be clearly labeled.
7. Storybook + runtime gates remain the validation surface before production-route integration.
