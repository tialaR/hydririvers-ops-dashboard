import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  SPIKE_CONTEXT_CITIES,
  SPIKE_MAP_VIEWBOX,
  SPIKE_RIVER_CORRIDORS,
} from '@/features/waterway-map/data/spike-amazon-river.mock';
import type {
  HydrowayCargoRouteScene,
  HydrowayMapPoint,
} from '@/features/waterway-map/providers/map-provider.types';

export type OwnedCargoMapScene = {
  viewBox: { x: number; y: number; width: number; height: number };
  corridors: typeof SPIKE_RIVER_CORRIDORS;
  cities: typeof SPIKE_CONTEXT_CITIES;
  route: {
    origin: HydrowayMapPoint;
    destination: HydrowayMapPoint;
    routePathD: string;
    traveledPathD: string;
    vessel: HydrowayMapPoint;
    progress01: number;
  };
};

function normalizeCityKey(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(',')[0]
    ?.trim()
    .replace(/\s+/g, '-') ?? '';
}

function resolveCityPoint(label: string): HydrowayMapPoint | null {
  const key = normalizeCityKey(label);
  const city = SPIKE_CONTEXT_CITIES.find((entry) => {
    const cityKey = entry.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-');
    return cityKey === key || entry.id === key;
  });
  return city?.point ?? null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function buildRouteBezier(origin: HydrowayMapPoint, destination: HydrowayMapPoint): string {
  const midX = (origin.x + destination.x) / 2;
  const lift = Math.min(48, Math.abs(destination.x - origin.x) * 0.08 + 24);
  const controlY = Math.min(origin.y, destination.y) - lift;
  return `M ${origin.x} ${origin.y} C ${midX} ${controlY}, ${midX} ${controlY}, ${destination.x} ${destination.y}`;
}

function pointAlongCubic(
  origin: HydrowayMapPoint,
  destination: HydrowayMapPoint,
  progress01: number,
): HydrowayMapPoint {
  const t = clamp01(progress01);
  const midX = (origin.x + destination.x) / 2;
  const lift = Math.min(48, Math.abs(destination.x - origin.x) * 0.08 + 24);
  const controlY = Math.min(origin.y, destination.y) - lift;
  const c1y = controlY;
  const c2y = controlY;

  const lerp = (a: number, b: number, ratio: number) => a + (b - a) * ratio;
  const bezier = (p0: number, p1: number, p2: number, p3: number, ratio: number) => {
    const u = 1 - ratio;
    return u * u * u * p0 + 3 * u * u * ratio * p1 + 3 * u * ratio * ratio * p2 + ratio * ratio * ratio * p3;
  };

  return {
    x: bezier(origin.x, midX, midX, destination.x, t),
    y: bezier(origin.y, c1y, c2y, destination.y, t),
  };
}

function buildTraveledPath(routePathD: string, progress01: number): string {
  if (progress01 <= 0) return '';
  if (progress01 >= 1) return routePathD;
  const match = routePathD.match(
    /^M\s+([\d.]+)\s+([\d.]+)\s+C\s+([\d.]+)\s+([\d.]+),\s+([\d.]+)\s+([\d.]+),\s+([\d.]+)\s+([\d.]+)$/,
  );
  if (!match) return routePathD;

  const origin = { x: Number(match[1]), y: Number(match[2]) };
  const destination = { x: Number(match[7]), y: Number(match[8]) };
  const vessel = pointAlongCubic(origin, destination, progress01);
  const midX = (origin.x + destination.x) / 2;
  const lift = Math.min(48, Math.abs(destination.x - origin.x) * 0.08 + 24);
  const controlY = Math.min(origin.y, destination.y) - lift;
  const partialT = clamp01(progress01);
  const partialMidX = origin.x + (midX - origin.x) * partialT;
  const partialControlY = origin.y + (controlY - origin.y) * partialT;

  return `M ${origin.x} ${origin.y} C ${partialMidX} ${partialControlY}, ${partialMidX} ${partialControlY}, ${vessel.x} ${vessel.y}`;
}

function resolveCamera(
  origin: HydrowayMapPoint,
  destination: HydrowayMapPoint,
  padding = 120,
): OwnedCargoMapScene['viewBox'] {
  const minX = Math.min(origin.x, destination.x) - padding;
  const minY = Math.min(origin.y, destination.y) - padding;
  const maxX = Math.max(origin.x, destination.x) + padding;
  const maxY = Math.max(origin.y, destination.y) + padding;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Cena schematica alinhada ao stack MapLibre/Hydroway — preview client-safe para owned cargo.
 */
export function resolveOwnedCargoMapScene(
  cargo: Cargo,
  progressPercent: number,
): OwnedCargoMapScene | null {
  const origin = resolveCityPoint(cargo.origin);
  const destination = resolveCityPoint(cargo.destination);
  if (!origin || !destination) return null;

  const progress01 = clamp01(progressPercent / 100);
  const routePathD = buildRouteBezier(origin, destination);
  const traveledPathD = buildTraveledPath(routePathD, progress01);
  const vessel = pointAlongCubic(origin, destination, progress01);

  return {
    viewBox: resolveCamera(origin, destination),
    corridors: SPIKE_RIVER_CORRIDORS,
    cities: SPIKE_CONTEXT_CITIES,
    route: {
      origin,
      destination,
      routePathD,
      traveledPathD,
      vessel,
      progress01,
    },
  };
}

/** Fallback scene para demos spike (Belém → Santarém). */
export function resolveOwnedCargoMapSceneFallback(progressPercent: number): OwnedCargoMapScene {
  const origin = { x: 1420, y: 430 };
  const destination = { x: 980, y: 468 };
  const progress01 = clamp01(progressPercent / 100);
  const routePathD =
    'M 1420 430 C 1340 438, 1260 448, 1180 456 C 1100 462, 1040 466, 980 468';
  const traveledPathD = buildTraveledPath(routePathD, progress01);
  const vessel = pointAlongCubic(origin, destination, progress01);

  return {
    viewBox: resolveCamera(origin, destination, 160),
    corridors: SPIKE_RIVER_CORRIDORS,
    cities: SPIKE_CONTEXT_CITIES,
    route: {
      origin,
      destination,
      routePathD,
      traveledPathD,
      vessel,
      progress01,
    },
  };
}

export const OWNED_CARGO_MAP_SCENE_FALLBACK_VIEWBOX = SPIKE_MAP_VIEWBOX;
