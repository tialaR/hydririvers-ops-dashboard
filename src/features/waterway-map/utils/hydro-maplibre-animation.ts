import {
  headingAlongPolyline,
  pointAtPolylineProgress,
  slicePolylineAtProgress,
} from '../adapters/route-geometry';

/** Duração de um ciclo completo de animação da rota/embarcação (ms). */
export const HYDRO_MAPLIBRE_ANIMATION_CYCLE_MS = 9000;

/** Amplitude da oscilação de progresso sobre a posição base da carga. */
export const HYDRO_MAPLIBRE_ANIMATION_SWING = 0.14;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Progresso animado ao longo da rota (0–1), oscilando suavemente a partir da posição base.
 * Usa tempo monotônico — chamar apenas em efeito client-side (performance.now).
 */
export function resolveAnimatedRouteProgress(
  baseProgress01: number,
  elapsedMs: number,
  cycleMs = HYDRO_MAPLIBRE_ANIMATION_CYCLE_MS,
  swing = HYDRO_MAPLIBRE_ANIMATION_SWING,
): number {
  const base = clamp01(baseProgress01);
  const phase = (elapsedMs % cycleMs) / cycleMs;
  const wave = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
  return clamp01(base + wave * swing);
}

export function buildRouteTraveledGeoJson(
  routeTrack: GeoJSON.Position[],
  progress01: number,
  properties: Record<string, unknown> = {},
): GeoJSON.FeatureCollection {
  const coordinates = slicePolylineAtProgress(routeTrack, progress01);
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { ...properties, kind: 'route-traveled', progress01 },
        geometry: {
          type: 'LineString',
          coordinates: coordinates.length >= 2 ? coordinates : [coordinates[0] ?? [0, 0], coordinates[0] ?? [0, 0]],
        },
      },
    ],
  };
}

export function buildVesselGeoJson(
  routeTrack: GeoJSON.Position[],
  progress01: number,
  displayLabel: string,
  properties: Record<string, unknown> = {},
): GeoJSON.FeatureCollection {
  const position = pointAtPolylineProgress(routeTrack, progress01);
  const heading = headingAlongPolyline(routeTrack, progress01);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          ...properties,
          kind: 'vessel',
          displayLabel,
          heading,
          progress01,
        },
        geometry: {
          type: 'Point',
          coordinates: position,
        },
      },
    ],
  };
}
