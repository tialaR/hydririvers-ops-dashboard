import {
  HYDROWAY_MOCK_GEO_BBOX,
  type HydrowayGeoBbox,
} from '../domain/hydroway-geo.types';

export type HydrowayRouteGeometry = {
  routeTrack: GeoJSON.Position[];
  routeTraveled: GeoJSON.Position[];
  origin: GeoJSON.Position;
  destination: GeoJSON.Position;
  vessel: GeoJSON.Position;
  heading: number;
  bbox: HydrowayGeoBbox;
};

function roundCoord(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function polylineLength(coordinates: GeoJSON.Position[]): number {
  let length = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const [x0, y0] = coordinates[index - 1];
    const [x1, y1] = coordinates[index];
    length += Math.hypot(x1 - x0, y1 - y0);
  }
  return Math.max(length, 1e-9);
}

function pointAtPolylineProgress(
  coordinates: GeoJSON.Position[],
  progress: number,
): GeoJSON.Position {
  if (coordinates.length === 0) {
    return [0, 0];
  }
  if (coordinates.length === 1) {
    return [...coordinates[0]];
  }

  const target = clamp(progress, 0, 1) * polylineLength(coordinates);
  let accumulated = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const [x0, y0] = coordinates[index - 1];
    const [x1, y1] = coordinates[index];
    const segment = Math.hypot(x1 - x0, y1 - y0);

    if (accumulated + segment >= target || index === coordinates.length - 1) {
      const ratio = segment > 0 ? clamp((target - accumulated) / segment, 0, 1) : 0;
      return [
        roundCoord(x0 + (x1 - x0) * ratio),
        roundCoord(y0 + (y1 - y0) * ratio),
      ];
    }
    accumulated += segment;
  }

  const last = coordinates[coordinates.length - 1];
  return [roundCoord(last[0]), roundCoord(last[1])];
}

function headingAlongPolyline(coordinates: GeoJSON.Position[], progress: number): number {
  const current = pointAtPolylineProgress(coordinates, progress);
  const previous = pointAtPolylineProgress(coordinates, clamp(progress - 0.03, 0, 1));
  const degrees = (Math.atan2(current[1] - previous[1], current[0] - previous[0]) * 180) / Math.PI;
  return Math.round(degrees * 10) / 10;
}

function slicePolylineAtProgress(
  coordinates: GeoJSON.Position[],
  progress: number,
): GeoJSON.Position[] {
  if (coordinates.length < 2) {
    return coordinates.map((coord) => [roundCoord(coord[0]), roundCoord(coord[1])]);
  }

  const safeProgress = clamp(progress, 0, 1);
  if (safeProgress <= 0) {
    const start = coordinates[0];
    return [
      [roundCoord(start[0]), roundCoord(start[1])],
      pointAtPolylineProgress(coordinates, 0),
    ];
  }

  const traveled: GeoJSON.Position[] = [[roundCoord(coordinates[0][0]), roundCoord(coordinates[0][1])]];
  const target = safeProgress * polylineLength(coordinates);
  let accumulated = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const [x0, y0] = coordinates[index - 1];
    const [x1, y1] = coordinates[index];
    const segment = Math.hypot(x1 - x0, y1 - y0);

    if (accumulated + segment >= target) {
      traveled.push(pointAtPolylineProgress(coordinates, safeProgress));
      return traveled;
    }

    traveled.push([roundCoord(x1), roundCoord(y1)]);
    accumulated += segment;
  }

  return traveled;
}

/** Gera LineString fictício entre origem e destino (determinístico, sem aleatoriedade). */
export function buildFallbackRouteCoordinates(
  origin: GeoJSON.Position,
  destination: GeoJSON.Position,
  seed: string,
  segments = 16,
): GeoJSON.Position[] {
  const [ox, oy] = origin;
  const [dx, dy] = destination;
  const distance = Math.hypot(dx - ox, dy - oy) || 0.01;
  const normalX = -(dy - oy) / distance;
  const normalY = (dx - ox) / distance;

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }
  const sign = Math.abs(hash) % 2 === 0 ? 1 : -1;
  const curvature = clamp(distance * 0.12, 0.02, 0.35) * sign;

  const coordinates: GeoJSON.Position[] = [];
  for (let step = 0; step <= segments; step += 1) {
    const t = step / segments;
    const wave = Math.sin(t * Math.PI) * curvature;
    coordinates.push([
      roundCoord(ox + (dx - ox) * t + normalX * wave),
      roundCoord(oy + (dy - oy) * t + normalY * wave),
    ]);
  }
  return coordinates;
}

export function computeHydrowayBbox(
  positions: GeoJSON.Position[],
  paddingDegrees = 0.08,
): HydrowayGeoBbox {
  if (positions.length === 0) {
    return [
      HYDROWAY_MOCK_GEO_BBOX.west,
      HYDROWAY_MOCK_GEO_BBOX.south,
      HYDROWAY_MOCK_GEO_BBOX.east,
      HYDROWAY_MOCK_GEO_BBOX.north,
    ];
  }

  const lngs = positions.map((position) => position[0]);
  const lats = positions.map((position) => position[1]);

  const west = clamp(Math.min(...lngs) - paddingDegrees, HYDROWAY_MOCK_GEO_BBOX.west, HYDROWAY_MOCK_GEO_BBOX.east);
  const east = clamp(Math.max(...lngs) + paddingDegrees, HYDROWAY_MOCK_GEO_BBOX.west, HYDROWAY_MOCK_GEO_BBOX.east);
  const south = clamp(Math.min(...lats) - paddingDegrees, HYDROWAY_MOCK_GEO_BBOX.south, HYDROWAY_MOCK_GEO_BBOX.north);
  const north = clamp(Math.max(...lats) + paddingDegrees, HYDROWAY_MOCK_GEO_BBOX.south, HYDROWAY_MOCK_GEO_BBOX.north);

  return [roundCoord(west), roundCoord(south), roundCoord(east), roundCoord(north)];
}

export function buildHydrowayRouteGeometry(
  routeTrack: GeoJSON.Position[],
  progress01: number,
): HydrowayRouteGeometry {
  const normalizedTrack = routeTrack.map(
    (coord) => [roundCoord(coord[0]), roundCoord(coord[1])] as GeoJSON.Position,
  );
  const safeProgress = clamp(progress01, 0, 1);
  const origin = normalizedTrack[0] ?? [0, 0];
  const destination = normalizedTrack[normalizedTrack.length - 1] ?? origin;
  const vessel = pointAtPolylineProgress(normalizedTrack, safeProgress);
  const routeTraveled = slicePolylineAtProgress(normalizedTrack, safeProgress);
  const bboxPositions = [...normalizedTrack, vessel];

  return {
    routeTrack: normalizedTrack,
    routeTraveled,
    origin,
    destination,
    vessel,
    heading: headingAlongPolyline(normalizedTrack, safeProgress),
    bbox: computeHydrowayBbox(bboxPositions),
  };
}
