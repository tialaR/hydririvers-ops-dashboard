import type { ExpressionSpecification } from 'maplibre-gl';

import { hydroMapStyleTokens } from './hydro-map-style';

/** Breathing animation cycle lengths (ms). */
export const HYDRAWAY_ROUTE_BREATHING_ACTIVE_CYCLE_MS = 24000;
export const HYDRAWAY_ROUTE_BREATHING_REMAINING_CYCLE_MS = 38000;
export const HYDRAWAY_ROUTE_BREATHING_TICK_MS = 350;

export const HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED = true;

/** Active segment (origin → vessel) — hydrovia teal/cyan. */
export const HYDRAWAY_ROUTE_ACTIVE_COLORS = {
  deep: '#064e55',
  mid: '#087c75',
  bright: '#0daca0',
  head: '#7ffff2',
  glow: '#7ffff2',
  shadow: '#050808',
  dash: '#d9fffb',
} as const;

/** Remaining segment (vessel → destination) — distant future route. */
export const HYDRAWAY_ROUTE_REMAINING_COLORS = {
  near: '#0daca0',
  far: '#064e55',
  glow: '#7ffff2',
  shadow: '#050808',
  fallback: '#087c75',
} as const;

/** Base track tint (routeTrackGlow / routeTrackCore). */
export const ROUTE_RIVER_COLORS = {
  base: HYDRAWAY_ROUTE_ACTIVE_COLORS.bright,
  glow: HYDRAWAY_ROUTE_ACTIVE_COLORS.glow,
  flow: HYDRAWAY_ROUTE_REMAINING_COLORS.fallback,
  highlight: '#f5d77a',
} as const;

export type HydrowayRouteBreathingPaint = {
  active: {
    glowOpacity: number;
    glowBlur: number;
    coreOpacity: number;
  };
  remaining: {
    glowOpacity: number;
    glowBlur: number;
    coreOpacity: number;
  };
};

function clampRouteProgress(progress01: number): number {
  if (!Number.isFinite(progress01)) return 0.15;
  return Math.max(0.02, Math.min(0.98, progress01));
}

/** Legacy planned-route gradient (hydro-maplibre-style). */
export function buildRouteLineGradientExpression(progress01: number): ExpressionSpecification {
  const progress = clampRouteProgress(progress01);
  const seam = Math.min(progress + 0.012, 0.99);

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    hydroMapStyleTokens.routeProgress,
    progress,
    hydroMapStyleTokens.routeProgress,
    seam,
    hydroMapStyleTokens.routeRemaining,
    1,
    hydroMapStyleTokens.routeRemaining,
  ];
}

/** Static line-gradient for the active segment (requires lineMetrics on source). */
export function buildHydrowayRouteActiveGradientExpression(): ExpressionSpecification {
  if (!HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED) {
    return HYDRAWAY_ROUTE_ACTIVE_COLORS.bright as unknown as ExpressionSpecification;
  }

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    HYDRAWAY_ROUTE_ACTIVE_COLORS.deep,
    0.35,
    HYDRAWAY_ROUTE_ACTIVE_COLORS.mid,
    0.7,
    HYDRAWAY_ROUTE_ACTIVE_COLORS.bright,
    1,
    HYDRAWAY_ROUTE_ACTIVE_COLORS.head,
  ];
}

/** Static line-gradient for the remaining segment (requires lineMetrics on source). */
export function buildHydrowayRouteRemainingGradientExpression(): ExpressionSpecification {
  if (!HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED) {
    return HYDRAWAY_ROUTE_REMAINING_COLORS.fallback as unknown as ExpressionSpecification;
  }

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    HYDRAWAY_ROUTE_REMAINING_COLORS.near,
    1,
    HYDRAWAY_ROUTE_REMAINING_COLORS.far,
  ];
}

/** Opacity/blur breathing — no geometry or dash motion. */
export function resolveHydrowayRouteBreathingPaint(elapsedMs: number): HydrowayRouteBreathingPaint {
  const elapsed = Math.max(0, elapsedMs);
  const activeWave =
    (Math.sin((elapsed / HYDRAWAY_ROUTE_BREATHING_ACTIVE_CYCLE_MS) * Math.PI * 2) + 1) / 2;
  const remainingWave =
    (Math.sin((elapsed / HYDRAWAY_ROUTE_BREATHING_REMAINING_CYCLE_MS) * Math.PI * 2 + Math.PI / 3) +
      1) /
    2;

  return {
    active: {
      glowOpacity: 0.07 + activeWave * 0.055,
      glowBlur: 1.8 + activeWave * 0.8,
      coreOpacity: 0.74 + activeWave * 0.05,
    },
    remaining: {
      glowOpacity: 0.03 + remainingWave * 0.045,
      glowBlur: 2.2 + remainingWave * 1.1,
      coreOpacity: 0.18 + remainingWave * 0.055,
    },
  };
}

/** Preset-driven track tinting (cargo-route base layers). */
export type RouteFlowPalette = {
  base: string;
  glow: string;
  flow: string;
  highlight: string;
  trackCasing: string;
  traveledBody: string;
  traveledHighlight: string;
  traveledHead: string;
  remainingBody: string;
  remainingTail: string;
  traveledGlowOpacity: number;
  traveledOpacity: number;
  remainingOpacity: number;
};

export const DEFAULT_ROUTE_FLOW_PALETTE: RouteFlowPalette = {
  base: HYDRAWAY_ROUTE_ACTIVE_COLORS.bright,
  glow: HYDRAWAY_ROUTE_ACTIVE_COLORS.glow,
  flow: HYDRAWAY_ROUTE_REMAINING_COLORS.fallback,
  highlight: '#f5d77a',
  trackCasing: 'rgba(8, 28, 42, 0.42)',
  traveledBody: HYDRAWAY_ROUTE_ACTIVE_COLORS.bright,
  traveledHighlight: '#f5d77a',
  traveledHead: HYDRAWAY_ROUTE_ACTIVE_COLORS.head,
  remainingBody: HYDRAWAY_ROUTE_REMAINING_COLORS.near,
  remainingTail: HYDRAWAY_ROUTE_REMAINING_COLORS.far,
  traveledGlowOpacity: 0.1,
  traveledOpacity: 0.78,
  remainingOpacity: 0.24,
};

export type RoutePointPulseKind = 'origin' | 'destination' | 'vessel';

const ROUTE_POINT_PULSE_MS: Record<RoutePointPulseKind, number> = {
  origin: 1900,
  destination: 2000,
  vessel: 1650,
};

const ROUTE_POINT_PULSE_PHASE_MS: Record<RoutePointPulseKind, number> = {
  origin: 0,
  destination: 280,
  vessel: 0,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function pulseWave(elapsedMs: number, durationMs: number, phaseMs: number): number {
  const t = ((elapsedMs + phaseMs) % durationMs) / durationMs;
  return 0.5 - 0.5 * Math.cos(Math.PI * 2 * t);
}

function zoomPulseRadius(zoom: number, kind: RoutePointPulseKind): number {
  const z = Number.isFinite(zoom) ? zoom : 8;
  if (kind === 'vessel') {
    if (z <= 4) return 11;
    if (z <= 10) return 16;
    return 21;
  }
  if (z <= 4) return 8;
  if (z <= 10) return 11;
  return 14;
}

export type RoutePointPulsePaint = {
  'circle-radius': number;
  'circle-opacity': number;
  'circle-blur': number;
  'circle-stroke-opacity': number;
};

/** Paint-only radar halo for route points (core dots stay on routePoints layer). */
export function resolveRoutePointPulsePaint(
  kind: RoutePointPulseKind,
  zoom: number,
  elapsedMs: number,
): RoutePointPulsePaint {
  const wave = pulseWave(elapsedMs, ROUTE_POINT_PULSE_MS[kind], ROUTE_POINT_PULSE_PHASE_MS[kind]);
  const baseRadius = zoomPulseRadius(zoom, kind);

  if (kind === 'vessel') {
    return {
      'circle-radius': lerp(baseRadius * 0.92, baseRadius * 1.14, wave),
      'circle-opacity': lerp(0.14, 0.32, wave),
      'circle-blur': lerp(0.42, 0.62, wave),
      'circle-stroke-opacity': lerp(0.2, 0.42, wave),
    };
  }

  return {
    'circle-radius': lerp(baseRadius * 0.96, baseRadius * 1.08, wave),
    'circle-opacity': lerp(0.1, 0.22, wave),
    'circle-blur': lerp(0.48, 0.68, wave),
    'circle-stroke-opacity': lerp(0.12, 0.28, wave),
  };
}
