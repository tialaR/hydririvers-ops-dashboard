/**
 * Geometria dos markers da rota MapLibre.
 *
 * Regra absoluta:
 * A LineString desenhada no mapa é a fonte de verdade.
 *
 * - origem = primeiro vértice da LineString
 * - destino = último vértice da LineString
 * - embarcação = ponto interpolado SOBRE a LineString conforme progress
 *
 * Não usar coordenadas soltas de origem/destino.
 * Não usar midpoint simples.
 * Não usar fallback fora da rota.
 */

export type RouteMarkerCoordinate = [number, number];

export type RouteMarkerCoordinates = {
  origin: RouteMarkerCoordinate | null;
  vessel: RouteMarkerCoordinate | null;
  destination: RouteMarkerCoordinate | null;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRouteCoordinate(value: unknown): value is RouteMarkerCoordinate {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1])
  );
}

/**
 * Sanitiza vértices da LineString.
 * Mantém somente pares [lng, lat] finitos.
 */
export function sanitizeRouteLineStringCoordinates(
  coordinates: GeoJSON.Position[] | RouteMarkerCoordinate[] | unknown,
): RouteMarkerCoordinate[] {
  if (!Array.isArray(coordinates)) return [];

  return coordinates
    .filter(isRouteCoordinate)
    .map((coordinate) => [coordinate[0], coordinate[1]]);
}

export function normalizeRouteProgress(progress?: number | null): number {
  if (!isFiniteNumber(progress)) return 0.5;

  if (progress > 1) {
    return Math.min(Math.max(progress / 100, 0), 1);
  }

  return Math.min(Math.max(progress, 0), 1);
}

function distance2d(a: RouteMarkerCoordinate, b: RouteMarkerCoordinate): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  return Math.sqrt(dx * dx + dy * dy);
}

function interpolateLngLat(
  a: RouteMarkerCoordinate,
  b: RouteMarkerCoordinate,
  progress: number,
): RouteMarkerCoordinate {
  return [
    a[0] + (b[0] - a[0]) * progress,
    a[1] + (b[1] - a[1]) * progress,
  ];
}

/**
 * Primeiro vértice da LineString.
 */
export function resolveOriginCoordinate(
  routeCoordinates: GeoJSON.Position[] | RouteMarkerCoordinate[] | unknown,
): RouteMarkerCoordinate | null {
  const track = sanitizeRouteLineStringCoordinates(routeCoordinates);

  return track[0] ?? null;
}

/**
 * Último vértice da LineString.
 */
export function resolveDestinationCoordinate(
  routeCoordinates: GeoJSON.Position[] | RouteMarkerCoordinate[] | unknown,
): RouteMarkerCoordinate | null {
  const track = sanitizeRouteLineStringCoordinates(routeCoordinates);

  return track.length > 0 ? track[track.length - 1] : null;
}

/**
 * Ponto interpolado sobre a LineString por distância acumulada.
 *
 * Importante:
 so NÃO usa média simples entre origem/destino.
 * O ponto é calculado segmento por segmento, respeitando a rota desenhada.
 */
export function resolveVesselCoordinate(
  routeCoordinates: GeoJSON.Position[] | RouteMarkerCoordinate[] | unknown,
  progress?: number | null,
): RouteMarkerCoordinate | null {
  const track = sanitizeRouteLineStringCoordinates(routeCoordinates);

  if (track.length === 0) return null;
  if (track.length === 1) return track[0];

  const normalizedProgress = normalizeRouteProgress(progress);

  const segmentLengths = track.slice(0, -1).map((coordinate, index) => {
    return distance2d(coordinate, track[index + 1]);
  });

  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength <= 0) return track[0];

  const targetDistance = totalLength * normalizedProgress;
  let walkedDistance = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];

    if (walkedDistance + segmentLength >= targetDistance) {
      const segmentProgress =
        segmentLength === 0 ? 0 : (targetDistance - walkedDistance) / segmentLength;

      return interpolateLngLat(track[index], track[index + 1], segmentProgress);
    }

    walkedDistance += segmentLength;
  }

  return track[track.length - 1];
}

/**
 * Compatibilidade com imports antigos.
 */
export const getRouteOriginCoordinate = resolveOriginCoordinate;
export const getRouteDestinationCoordinate = resolveDestinationCoordinate;
export const getCoordinateAtRouteProgress = resolveVesselCoordinate;

/**
 * Coordenadas finais dos markers, todas derivadas da mesma LineString.
 */
export function resolveRouteMarkerCoordinates(
  routeCoordinates: GeoJSON.Position[],
  progress01: number,
): RouteMarkerCoordinates {
  const track = sanitizeRouteLineStringCoordinates(routeCoordinates);

  if (track.length < 2) {
    return {
      origin: null,
      destination: null,
      vessel: null,
    };
  }

  return {
    origin: track[0],
    destination: track[track.length - 1],
    vessel: resolveVesselCoordinate(track, progress01),
  };
}
