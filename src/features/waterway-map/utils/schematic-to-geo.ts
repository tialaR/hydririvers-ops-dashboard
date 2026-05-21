import type { HydrowayMapPoint, HydrowayMapViewBox } from '../providers/map-provider.types';

/** Bbox fictício WGS84 para o corredor amazônico do spike (determinístico). */
export const SPIKE_GEO_BBOX = {
  west: -60.5,
  east: -47.0,
  south: -4.0,
  north: 0.5,
} as const;

export type LngLat = [number, number];

export function schematicPointToLngLat(
  point: HydrowayMapPoint,
  viewBox: HydrowayMapViewBox = { width: 1600, height: 900 },
): LngLat {
  const { west, east, south, north } = SPIKE_GEO_BBOX;
  const lng = west + (point.x / viewBox.width) * (east - west);
  const lat = north - (point.y / viewBox.height) * (north - south);
  return [roundCoord(lng), roundCoord(lat)];
}

export function schematicPathToLineString(
  pathD: string,
  viewBox: HydrowayMapViewBox = { width: 1600, height: 900 },
  samplesPerCurve = 12,
): GeoJSON.Position[] {
  const points = parseSvgPathToPoints(pathD, samplesPerCurve);
  return points.map((point) => schematicPointToLngLat(point, viewBox));
}

function roundCoord(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

/** Parser mínimo para paths do spike (M, L, C). */
export function parseSvgPathToPoints(pathD: string, samplesPerCurve = 12): HydrowayMapPoint[] {
  const tokens = pathD
    .trim()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const points: HydrowayMapPoint[] = [];
  let index = 0;
  let command = '';
  let cursor: HydrowayMapPoint = { x: 0, y: 0 };
  let start: HydrowayMapPoint = { x: 0, y: 0 };

  const readNumber = (): number => {
    const value = Number(tokens[index]);
    index += 1;
    return value;
  };

  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[MLCZ]$/i.test(token)) {
      command = token.toUpperCase();
      index += 1;
    } else if (!command) {
      index += 1;
      continue;
    }

    if (command === 'M') {
      cursor = { x: readNumber(), y: readNumber() };
      start = { ...cursor };
      points.push({ ...cursor });
      command = 'L';
      continue;
    }

    if (command === 'L') {
      cursor = { x: readNumber(), y: readNumber() };
      points.push({ ...cursor });
      continue;
    }

    if (command === 'C') {
      const c1 = { x: readNumber(), y: readNumber() };
      const c2 = { x: readNumber(), y: readNumber() };
      const end = { x: readNumber(), y: readNumber() };
      for (let step = 1; step <= samplesPerCurve; step += 1) {
        const t = step / samplesPerCurve;
        points.push(cubicBezier(cursor, c1, c2, end, t));
      }
      cursor = end;
      continue;
    }

    if (command === 'Z') {
      cursor = { ...start };
      points.push({ ...cursor });
      continue;
    }

    index += 1;
  }

  return points;
}

function cubicBezier(
  p0: HydrowayMapPoint,
  p1: HydrowayMapPoint,
  p2: HydrowayMapPoint,
  p3: HydrowayMapPoint,
  t: number,
): HydrowayMapPoint {
  const u = 1 - t;
  const x =
    u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y =
    u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}
