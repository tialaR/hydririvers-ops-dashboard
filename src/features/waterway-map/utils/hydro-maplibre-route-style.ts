import type { ExpressionSpecification } from 'maplibre-gl';

import { hydroMapStyleTokens } from './hydro-map-style';

/** Família ciano/aqua do SVG hydririvers-route-cyan-progressive-slow. */
export const ROUTE_RIVER_COLORS = {
  base: '#65ffe8',
  glow: '#5fffe0',
  flow: '#72ffe8',
  highlight: '#f5d77a',
} as const;

const ROUTE_FLOW_TRANSPARENT = 'rgba(95, 255, 224, 0)';
const ROUTE_FLOW_TRAVELED_BODY = 'rgba(101, 255, 232, 0.72)';
const ROUTE_FLOW_TRAVELED_HIGHLIGHT = 'rgba(245, 215, 122, 0.68)';
const ROUTE_FLOW_TRAVELED_HEAD = 'rgba(114, 255, 232, 0.92)';
/** Mesma família aqua do percorrido; opacidade alvo 0.3 no trecho restante. */
const ROUTE_FLOW_REMAINING_BODY = 'rgba(101, 255, 232, 0.30)';
const ROUTE_FLOW_REMAINING_TAIL = 'rgba(95, 255, 224, 0.18)';

const ROUTE_FLOW_PHASE_SHIFT = 0.06;

/** hrRiverFlowToBoat — 9.8s */
export const ROUTE_DESTINATION_FLOW_DURATION_MS = 9800;
const ROUTE_DEST_FLOW_DASH = 72;
const ROUTE_DEST_FLOW_GAP = 420;
const ROUTE_DEST_FLOW_CYCLE = ROUTE_DEST_FLOW_DASH + ROUTE_DEST_FLOW_GAP;

/** hrRiverMistToBoat — 15s */
export const ROUTE_RIVER_MIST_DURATION_MS = 15000;
const ROUTE_RIVER_MIST_DASH = 120;
const ROUTE_RIVER_MIST_GAP = 520;
const ROUTE_RIVER_MIST_CYCLE = ROUTE_RIVER_MIST_DASH + ROUTE_RIVER_MIST_GAP;

type ScalarKeyframe = { at: number; value: number };

function clampRouteProgress(progress01: number): number {
  if (!Number.isFinite(progress01)) return 0.15;
  return Math.max(0.02, Math.min(0.98, progress01));
}

function clampFlowPhase(flowPhase01: number): number {
  if (!Number.isFinite(flowPhase01)) return 0;
  return flowPhase01 % 1;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cubicBezierEase(t: number, x1: number, y1: number, x2: number, y2: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  let start = 0;
  let end = 1;
  for (let i = 0; i < 12; i += 1) {
    const mid = (start + end) / 2;
    const x =
      3 * (1 - mid) * (1 - mid) * mid * x1 +
      3 * (1 - mid) * mid * mid * x2 +
      mid * mid * mid;
    if (x < clamped) {
      start = mid;
    } else {
      end = mid;
    }
  }
  const mid = (start + end) / 2;
  return (
    3 * (1 - mid) * (1 - mid) * mid * y1 +
    3 * (1 - mid) * mid * mid * y2 +
    mid * mid * mid
  );
}

function sampleScalarKeyframes(t01: number, frames: ScalarKeyframe[], ease = false): number {
  const t = clampFlowPhase(t01);
  if (t <= frames[0].at) return frames[0].value;
  for (let i = 1; i < frames.length; i += 1) {
    const next = frames[i];
    const prev = frames[i - 1];
    if (t <= next.at) {
      const span = next.at - prev.at;
      if (span <= 0) return next.value;
      const local = (t - prev.at) / span;
      const eased = ease ? cubicBezierEase(local, 0.45, 0, 0.25, 1) : local;
      return lerp(prev.value, next.value, eased);
    }
  }
  return frames[frames.length - 1].value;
}

/** Desloca o padrão de dash ao longo da linha (equivalente a stroke-dashoffset no SVG). */
export function buildRouteAnimatedDasharray(
  offsetPx: number,
  dash: number,
  gap: number,
): [number, number, number] {
  const total = dash + gap;
  const normalized = ((offsetPx % total) + total) % total;
  if (normalized < 0.001) {
    return [0, dash, gap];
  }
  const gapLead = Math.max(0.001, gap - normalized);
  return [normalized, dash, gapLead];
}

export type RouteRiverDashPaint = {
  'line-dasharray': [number, number, number];
  'line-opacity': number;
};

/** Fluxo principal até a embarcação (hr-route-destination-flow). */
export function resolveRouteDestinationFlowPaint(
  elapsedMs: number,
  reducedMotion = false,
): RouteRiverDashPaint {
  if (reducedMotion) {
    return {
      'line-dasharray': buildRouteAnimatedDasharray(
        ROUTE_DEST_FLOW_CYCLE * 0.42,
        ROUTE_DEST_FLOW_DASH,
        ROUTE_DEST_FLOW_GAP,
      ),
      'line-opacity': 0.34,
    };
  }

  const t = (elapsedMs % ROUTE_DESTINATION_FLOW_DURATION_MS) / ROUTE_DESTINATION_FLOW_DURATION_MS;
  const opacity = sampleScalarKeyframes(
    t,
    [
      { at: 0, value: 0.08 },
      { at: 0.18, value: 0.34 },
      { at: 0.58, value: 0.82 },
      { at: 0.82, value: 0.46 },
      { at: 1, value: 0.08 },
    ],
    true,
  );
  const offset = sampleScalarKeyframes(
    t,
    [
      { at: 0, value: ROUTE_DEST_FLOW_CYCLE },
      { at: 0.82, value: 0 },
      { at: 1, value: -ROUTE_DEST_FLOW_DASH },
    ],
    true,
  );

  return {
    'line-dasharray': buildRouteAnimatedDasharray(
      offset,
      ROUTE_DEST_FLOW_DASH,
      ROUTE_DEST_FLOW_GAP,
    ),
    'line-opacity': opacity,
  };
}

/** Véu de correnteza mais largo e lento (hr-route-river-mist). */
export function resolveRouteRiverMistPaint(
  elapsedMs: number,
  reducedMotion = false,
): RouteRiverDashPaint {
  if (reducedMotion) {
    return {
      'line-dasharray': buildRouteAnimatedDasharray(
        ROUTE_RIVER_MIST_CYCLE * 0.38,
        ROUTE_RIVER_MIST_DASH,
        ROUTE_RIVER_MIST_GAP,
      ),
      'line-opacity': 0.22,
    };
  }

  const t = (elapsedMs % ROUTE_RIVER_MIST_DURATION_MS) / ROUTE_RIVER_MIST_DURATION_MS;
  const opacity = sampleScalarKeyframes(t, [
    { at: 0, value: 0.1 },
    { at: 0.45, value: 0.28 },
    { at: 0.75, value: 0.22 },
    { at: 1, value: 0.1 },
  ]);
  const offset = sampleScalarKeyframes(t, [
    { at: 0, value: ROUTE_RIVER_MIST_CYCLE },
    { at: 0.75, value: 0 },
    { at: 1, value: -160 },
  ]);

  return {
    'line-dasharray': buildRouteAnimatedDasharray(
      offset,
      ROUTE_RIVER_MIST_DASH,
      ROUTE_RIVER_MIST_GAP,
    ),
    'line-opacity': opacity,
  };
}

/** Expressão line-gradient MapLibre (requer lineMetrics na source). */
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

/** Percorrido: corpo aqua até o head no progresso; highlight sutil perto da embarcação. */
export function buildRouteTraveledFlowGradientExpression(
  progress01: number,
  flowPhase01 = 0,
): ExpressionSpecification {
  const progress = clampRouteProgress(progress01);
  const phase = clampFlowPhase(flowPhase01);
  const flowShift = phase * ROUTE_FLOW_PHASE_SHIFT;
  const head = Math.min(progress + flowShift, 0.992);
  const headLead = Math.max(0, head - 0.08);
  const highlight = Math.max(0, head - 0.025);
  const fade = Math.min(head + 0.018, 0.995);

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    ROUTE_FLOW_TRAVELED_BODY,
    headLead,
    ROUTE_FLOW_TRAVELED_BODY,
    highlight,
    ROUTE_FLOW_TRAVELED_HIGHLIGHT,
    head,
    ROUTE_FLOW_TRAVELED_HEAD,
    fade,
    ROUTE_FLOW_TRANSPARENT,
    1,
    ROUTE_FLOW_TRANSPARENT,
  ];
}

/** Restante: transparente até o progresso; gradiente suave depois (família aqua/cyan). */
export function buildRouteRemainingFlowGradientExpression(
  progress01: number,
  flowPhase01 = 0,
): ExpressionSpecification {
  const progress = clampRouteProgress(progress01);
  const phase = clampFlowPhase(flowPhase01);
  const breathe = 0.004 + phase * 0.005;
  const seam = Math.min(progress + 0.02 + breathe, 0.99);

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    ROUTE_FLOW_TRANSPARENT,
    progress,
    ROUTE_FLOW_TRANSPARENT,
    seam,
    ROUTE_FLOW_REMAINING_BODY,
    1,
    ROUTE_FLOW_REMAINING_TAIL,
  ];
}

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
