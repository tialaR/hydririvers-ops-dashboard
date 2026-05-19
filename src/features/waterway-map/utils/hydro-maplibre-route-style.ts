import { hydroMapStyleTokens } from './hydro-map-style';

/** Expressão line-gradient MapLibre (requer lineMetrics na source). */
export function buildRouteLineGradientExpression(progress01: number): unknown[] {
  const progress = Math.max(0.02, Math.min(0.98, progress01));
  const seam = Math.min(progress + 0.008, 0.99);

  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    hydroMapStyleTokens.routeProgress,
    progress,
    hydroMapStyleTokens.routeProgress,
    seam,
    hydroMapStyleTokens.routeTrack,
    1,
    hydroMapStyleTokens.routeTrack,
  ];
}
