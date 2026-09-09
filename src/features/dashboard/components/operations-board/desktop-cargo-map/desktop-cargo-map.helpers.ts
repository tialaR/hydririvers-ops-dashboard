import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { getCargoRouteProgress01 } from '@/features/dashboard/components/operations-board/tracking-map/hydro-route-tracking.helpers';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

export const DESKTOP_MAP_VIEWBOX = {
  width: 1600,
  height: 900,
} as const;

export type DesktopMapPoint = { x: number; y: number };

type CubicRoute = {
  start: DesktopMapPoint;
  controlA: DesktopMapPoint;
  controlB: DesktopMapPoint;
  end: DesktopMapPoint;
};

const EXPANDED_LOCATION_COORDINATES: Record<string, DesktopMapPoint> = {
  'belem pa': { x: 1420, y: 430 },
  'belem para': { x: 1420, y: 430 },
  'santarem pa': { x: 980, y: 468 },
  'manaus am': { x: 520, y: 458 },
  'tefe am': { x: 240, y: 472 },
  'macapa ap': { x: 1360, y: 300 },
  'itacoatiara am': { x: 640, y: 448 },
  'obidos pa': { x: 900, y: 452 },
  'breves pa': { x: 1180, y: 438 },
  'abaetetuba pa': { x: 1320, y: 448 },
  'vila do conde pa': { x: 1480, y: 392 },
  'porto velho ro': { x: 180, y: 560 },
  'coari am': { x: 360, y: 462 },
  'parintins am': { x: 700, y: 410 },
  'juruti pa': { x: 860, y: 440 },
  'alenquer pa': { x: 940, y: 400 },
  'monte alegre pa': { x: 1020, y: 408 },
  'prainha pa': { x: 1080, y: 418 },
  'barcarena pa': { x: 1380, y: 418 },
  'itaituba pa': { x: 820, y: 520 },
  'altamira pa': { x: 1040, y: 500 },
};

const CARGO_PROGRESS_OVERRIDES: Record<string, number> = {
  'CARGO-001': 0.15,
  'CARGO-002': 0.25,
  'CARGO-004': 0.4,
};

const BACKGROUND_CORRIDORS = [
  {
    id: 'amazonas',
    label: 'AMAZONAS',
    labelPoint: { x: 520, y: 560 },
    d: 'M 80 520 C 280 500, 420 470, 620 455 C 820 440, 1020 450, 1240 445 C 1360 442, 1460 438, 1540 432',
  },
  {
    id: 'para',
    label: 'PARÁ',
    labelPoint: { x: 1240, y: 340 },
    d: 'M 1180 430 C 1260 390, 1320 350, 1400 310 C 1440 290, 1480 278, 1520 268',
  },
] as const;

const CONTEXT_CITIES: Array<{ name: string; location: string }> = [
  { name: 'Manaus', location: 'Manaus, AM' },
  { name: 'Parintins', location: 'Parintins, AM' },
  { name: 'Tefé', location: 'Tefé, AM' },
  { name: 'Óbidos', location: 'Óbidos, PA' },
  { name: 'Juruti', location: 'Juruti, PA' },
  { name: 'Santarém', location: 'Santarém, PA' },
  { name: 'Alenquer', location: 'Alenquer, PA' },
  { name: 'Monte Alegre', location: 'Monte Alegre, PA' },
  { name: 'Prainha', location: 'Prainha, PA' },
  { name: 'Breves', location: 'Breves, PA' },
  { name: 'Abaetetuba', location: 'Abaetetuba, PA' },
  { name: 'Barcarena', location: 'Barcarena, PA' },
  { name: 'Belém', location: 'Belém, PA' },
  { name: 'Macapá', location: 'Macapá, AP' },
];

const ROUTE_SAMPLE_SEGMENTS = 56;

function normalizeLocationKey(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveExpandedPoint(location: string): DesktopMapPoint {
  const key = normalizeLocationKey(location).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (EXPANDED_LOCATION_COORDINATES[key]) {
    return EXPANDED_LOCATION_COORDINATES[key];
  }
  const withoutState = key.replace(/\b[a-z]{2}\b/g, '').replace(/\s+/g, ' ').trim();
  if (EXPANDED_LOCATION_COORDINATES[withoutState]) {
    return EXPANDED_LOCATION_COORDINATES[withoutState];
  }
  const source = key || 'unknown';
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  return {
    x: 180 + (positive % 1240),
    y: 320 + (Math.floor(positive / 17) % 320),
  };
}

function buildExpandedCubicRoute(origin: DesktopMapPoint, destination: DesktopMapPoint): CubicRoute {
  const dx = destination.x - origin.x;
  const dy = destination.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const curvature = clamp(distance * 0.18, 48, 140);
  const riverBias = destination.y < origin.y ? -0.85 : 0.85;

  return {
    start: origin,
    end: destination,
    controlA: {
      x: origin.x + dx * 0.28 + normalX * curvature * riverBias,
      y: origin.y + dy * 0.22 + normalY * curvature * riverBias,
    },
    controlB: {
      x: origin.x + dx * 0.74 - normalX * curvature * (riverBias * 0.72),
      y: origin.y + dy * 0.78 - normalY * curvature * (riverBias * 0.72),
    },
  };
}

function pointOnCubic(route: CubicRoute, t: number): DesktopMapPoint {
  const safeT = clamp(t, 0, 1);
  const inv = 1 - safeT;
  return {
    x:
      inv ** 3 * route.start.x
      + 3 * inv ** 2 * safeT * route.controlA.x
      + 3 * inv * safeT ** 2 * route.controlB.x
      + safeT ** 3 * route.end.x,
    y:
      inv ** 3 * route.start.y
      + 3 * inv ** 2 * safeT * route.controlA.y
      + 3 * inv * safeT ** 2 * route.controlB.y
      + safeT ** 3 * route.end.y,
  };
}

function sampleCubicPolyline(route: CubicRoute, segments: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  for (let index = 0; index <= segments; index += 1) {
    const point = pointOnCubic(route, index / segments);
    points.push([point.x, point.y]);
  }
  return points;
}

function polylineLength(points: Array<[number, number]>) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    length += Math.hypot(x1 - x0, y1 - y0);
  }
  return Math.max(length, 1);
}

function pointAtPolylineProgress(points: Array<[number, number]>, progress: number): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return [...points[0]];
  const target = clamp(progress, 0, 1) * polylineLength(points);
  let accumulated = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    const segment = Math.hypot(x1 - x0, y1 - y0);
    if (accumulated + segment >= target || index === points.length - 1) {
      const ratio = segment > 0 ? clamp((target - accumulated) / segment, 0, 1) : 0;
      return [x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio];
    }
    accumulated += segment;
  }
  return [...points[points.length - 1]];
}

function polylineToSvgD(points: Array<[number, number]>) {
  if (!points.length) return '';
  const [firstX, firstY] = points[0];
  const rest = points
    .slice(1)
    .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  return `M ${firstX.toFixed(1)} ${firstY.toFixed(1)} ${rest}`.trim();
}

function cubicToSvgD(route: CubicRoute) {
  return [
    `M ${route.start.x.toFixed(1)} ${route.start.y.toFixed(1)}`,
    `C ${route.controlA.x.toFixed(1)} ${route.controlA.y.toFixed(1)}`,
    `${route.controlB.x.toFixed(1)} ${route.controlB.y.toFixed(1)}`,
    `${route.end.x.toFixed(1)} ${route.end.y.toFixed(1)}`,
  ].join(' ');
}

function vesselHeading(points: Array<[number, number]>, progress: number) {
  const current = pointAtPolylineProgress(points, progress);
  const previous = pointAtPolylineProgress(points, clamp(progress - 0.03, 0, 1));
  return (Math.atan2(current[1] - previous[1], current[0] - previous[0]) * 180) / Math.PI;
}

function resolveRiverLabel(cargo: Cargo) {
  const corridor = cargo.corridor?.trim();
  if (corridor) {
    const [first] = corridor.split(/[–-]/);
    return first?.trim() || 'Amazonas';
  }
  return 'Amazonas';
}

export function formatShortLocation(location: string) {
  return location.split(',')[0]?.trim() ?? location;
}

export function formatRouteTitle(cargo: Cargo) {
  return `${formatShortLocation(cargo.origin)} → ${formatShortLocation(cargo.destination)}`;
}

export function extractDesktopMapEtaShort(etaConfidence: string | undefined) {
  if (!etaConfidence) return undefined;
  const [first] = etaConfidence.split('•');
  const trimmed = first?.trim();
  return trimmed || undefined;
}

export function extractDesktopMapConfidenceShort(etaConfidence: string | undefined) {
  if (!etaConfidence) return undefined;
  const parts = etaConfidence.split('•');
  if (parts.length < 2) return undefined;
  const trimmed = parts.slice(1).join('•').trim();
  return trimmed || undefined;
}

export type DesktopMapLayerMode = 'all' | 'route' | 'network';

export function getDesktopCargoProgress01(cargo: Cargo) {
  const cargoId = normalizeCargoId(cargo.id);
  if (cargoId in CARGO_PROGRESS_OVERRIDES) {
    return CARGO_PROGRESS_OVERRIDES[cargoId];
  }
  return getCargoRouteProgress01(cargo.status);
}

export type DesktopExpandedRouteGeometry = {
  viewBox: typeof DESKTOP_MAP_VIEWBOX;
  origin: DesktopMapPoint & { label: string };
  destination: DesktopMapPoint & { label: string };
  routePathD: string;
  traveledPathD: string;
  vessel: DesktopMapPoint & { heading: number };
  progress01: number;
  riverLabel: string;
  backgroundCorridors: typeof BACKGROUND_CORRIDORS;
  contextCities: Array<{
    name: string;
    point: DesktopMapPoint;
    role: 'endpoint' | 'context';
  }>;
};

export function buildDesktopExpandedRouteGeometry(cargo: Cargo): DesktopExpandedRouteGeometry {
  const originPoint = resolveExpandedPoint(cargo.origin);
  const destinationPoint = resolveExpandedPoint(cargo.destination);
  const cubicRoute = buildExpandedCubicRoute(originPoint, destinationPoint);
  const polyline = sampleCubicPolyline(cubicRoute, ROUTE_SAMPLE_SEGMENTS);
  const progress01 = getDesktopCargoProgress01(cargo);
  const traveledCount = Math.max(2, Math.round(progress01 * ROUTE_SAMPLE_SEGMENTS) + 1);
  const traveledPolyline = polyline.slice(0, traveledCount);
  const vesselCoordinates = pointAtPolylineProgress(polyline, progress01);
  const endpointNames = new Set([formatShortLocation(cargo.origin), formatShortLocation(cargo.destination)]);

  return {
    viewBox: DESKTOP_MAP_VIEWBOX,
    origin: { ...originPoint, label: formatShortLocation(cargo.origin) },
    destination: { ...destinationPoint, label: formatShortLocation(cargo.destination) },
    routePathD: cubicToSvgD(cubicRoute),
    traveledPathD: polylineToSvgD(traveledPolyline.length >= 2 ? traveledPolyline : polyline.slice(0, 2)),
    vessel: {
      x: vesselCoordinates[0],
      y: vesselCoordinates[1],
      heading: vesselHeading(polyline, progress01),
    },
    progress01,
    riverLabel: resolveRiverLabel(cargo),
    backgroundCorridors: BACKGROUND_CORRIDORS,
    contextCities: CONTEXT_CITIES.map((city) => ({
      name: city.name,
      point: resolveExpandedPoint(city.location),
      role: endpointNames.has(city.name) ? 'endpoint' : 'context',
    })),
  };
}
