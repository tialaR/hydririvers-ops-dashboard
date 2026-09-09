import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { NextMonitoredEndpoint, NextMonitoredSegment, TrackingPoint, TrackingRoute, TrackingStatus } from './hydro-route-tracking.types';
import {
  VESSEL_PATH_PROGRESS_MAX,
  VESSEL_PATH_PROGRESS_MIN
} from './hydro-route-tracking.constants';
import { formatSvgNumber } from './hydro-route-tracking-svg-format';

/** Resolução fixa da polilinha derivada da curva cúbica (determinístico). */
export const TRACKING_PATH_SAMPLE_SEGMENTS = 48;

type SchematicPoint = { x: number; y: number };

type CubicRoute = {
  start: SchematicPoint;
  controlA: SchematicPoint;
  controlB: SchematicPoint;
  end: SchematicPoint;
};

const LOCATION_COORDINATES: Record<string, SchematicPoint> = {
  'belem pa': { x: 890, y: 176 },
  'belem para': { x: 890, y: 176 },
  'santarem pa': { x: 610, y: 228 },
  'manaus am': { x: 350, y: 238 },
  'tabatinga am': { x: 110, y: 238 },
  'tefe am': { x: 245, y: 244 },
  'vila do conde pa': { x: 920, y: 198 },
  'suape pe': { x: 980, y: 348 },
  'coari am': { x: 300, y: 250 },
  'macapa ap': { x: 865, y: 116 },
  'itacoatiara am': { x: 430, y: 224 },
  'porto velho ro': { x: 220, y: 362 },
  'breves pa': { x: 770, y: 222 },
  'obidos pa': { x: 570, y: 218 },
  'abaetetuba pa': { x: 860, y: 222 },
  'itaituba pa': { x: 520, y: 316 },
  'altamira pa': { x: 650, y: 300 }
};

const ROUTE_DISTANCE_BASE_KM = 420;
const ROUTE_DISTANCE_SPREAD = 520;

function normalizeLocationKey(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveKnownPoint(location: string): SchematicPoint | null {
  const key = normalizeLocationKey(location).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (LOCATION_COORDINATES[key]) {
    return LOCATION_COORDINATES[key];
  }
  const withoutState = key.replace(/\b[a-z]{2}\b/g, '').replace(/\s+/g, ' ').trim();
  if (LOCATION_COORDINATES[withoutState]) {
    return LOCATION_COORDINATES[withoutState];
  }
  return null;
}

/** Ponto estável para localidades fora da tabela (hash da string, sem aleatoriedade). */
function fallbackPoint(location: string): SchematicPoint {
  const source = normalizeLocationKey(location);
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  const x = 140 + (positive % 760);
  const y = 90 + (Math.floor(positive / 13) % 270);
  return { x, y };
}

export function getPointFromLocation(location: string): SchematicPoint {
  return resolveKnownPoint(location) ?? fallbackPoint(location);
}

function buildCubicRoute(origin: SchematicPoint, destination: SchematicPoint): CubicRoute {
  const start = origin;
  const end = destination;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const curvature = clampNumber(distance * 0.22, 58, 130);
  const riverBias = end.y < start.y ? -0.9 : 0.9;

  const controlA = {
    x: start.x + dx * 0.3 + normalX * curvature * riverBias,
    y: start.y + dy * 0.24 + normalY * curvature * riverBias
  };
  const controlB = {
    x: start.x + dx * 0.72 - normalX * curvature * (riverBias * 0.76),
    y: start.y + dy * 0.78 - normalY * curvature * (riverBias * 0.76)
  };

  return { start, controlA, controlB, end };
}

function pointInCubicBezier(route: CubicRoute, t: number): SchematicPoint {
  const safeT = clampNumber(t, 0, 1);
  const inv = 1 - safeT;
  const x = (inv ** 3) * route.start.x
    + 3 * (inv ** 2) * safeT * route.controlA.x
    + 3 * inv * (safeT ** 2) * route.controlB.x
    + (safeT ** 3) * route.end.x;
  const y = (inv ** 3) * route.start.y
    + 3 * (inv ** 2) * safeT * route.controlA.y
    + 3 * inv * (safeT ** 2) * route.controlB.y
    + (safeT ** 3) * route.end.y;
  return { x, y };
}

/** Fração 0–1 do trajeto visual, alinhada ao status da carga (mock). */
export function getCargoRouteProgress01(status: CargoStatus): number {
  switch (status) {
    case 'open': return 0.15;
    case 'bidding': return 0.25;
    case 'contracting': return 0.35;
    case 'reserved': return 0.5;
    case 'boarded': return 0.65;
    case 'delivered': return 1;
    default: return 0.25;
  }
}

function samplePathFromCubic(origin: SchematicPoint, destination: SchematicPoint, segments: number): Array<[number, number]> {
  const cubic = buildCubicRoute(origin, destination);
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i += 1) {
    const p = pointInCubicBezier(cubic, i / segments);
    out.push([p.x, p.y]);
  }
  return out;
}

function polylineLength(points: Array<[number, number]>): number {
  let len = 0;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    len += Math.hypot(x1 - x0, y1 - y0);
  }
  return Math.max(len, 1);
}

export function approximatePathLength(points: Array<[number, number]>): number {
  return polylineLength(points);
}

/** Progresso em porcentagem 0–100 para exibição. */
export function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return clampNumber(progress, 0, 100);
}

/**
 * Progresso 0–1 ao longo do comprimento da polilinha mais próximo do ponto `(x,y)`.
 */
export function closestPathProgressNormalized(path: Array<[number, number]>, x: number, y: number): number {
  if (path.length < 2) return 0;
  const total = polylineLength(path);
  if (total <= 0) return 0;
  let bestDist = Infinity;
  let bestProgress = 0;
  let acc = 0;
  for (let i = 1; i < path.length; i += 1) {
    const [x0, y0] = path[i - 1];
    const [x1, y1] = path[i];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const segLenSq = dx * dx + dy * dy;
    const segLen = Math.sqrt(segLenSq) || 1;
    const tSeg = segLenSq > 0
      ? clampNumber(((x - x0) * dx + (y - y0) * dy) / segLenSq, 0, 1)
      : 0;
    const px = x0 + tSeg * dx;
    const py = y0 + tSeg * dy;
    const dist = Math.hypot(x - px, y - py);
    if (dist < bestDist) {
      bestDist = dist;
      bestProgress = (acc + tSeg * segLen) / total;
    }
    acc += segLen;
  }
  return clampNumber(bestProgress, 0, 1);
}

/**
 * Ponto ao longo da polilinha; `progress` em 0–1 proporcional ao comprimento acumulado.
 */
export function getPointAtProgress(path: Array<[number, number]>, progress: number): [number, number] {
  if (path.length === 0) return [0, 0];
  if (path.length === 1) return [...path[0]] as [number, number];
  const t = clampNumber(progress, 0, 1);
  const total = polylineLength(path);
  const target = t * total;
  let acc = 0;
  for (let i = 1; i < path.length; i += 1) {
    const [x0, y0] = path[i - 1];
    const [x1, y1] = path[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (acc + seg >= target || i === path.length - 1) {
      const u = seg > 0 ? clampNumber((target - acc) / seg, 0, 1) : 0;
      return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
    }
    acc += seg;
  }
  return [...path[path.length - 1]] as [number, number];
}

function tangentAngleAtProgress(path: Array<[number, number]>, progress: number): number {
  const t = clampNumber(progress, 0, 1);
  const [cx, cy] = getPointAtProgress(path, t);
  const [px, py] = getPointAtProgress(path, clampNumber(t - 0.02, 0, 1));
  return (Math.atan2(cy - py, cx - px) * 180) / Math.PI;
}

function stableIdHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function cargoIndicatesDelay(cargo: Cargo): boolean {
  const risks = cargo.operationalRisks ?? [];
  return risks.some((r) => normalizeLocationKey(r).includes('atras'));
}

function mapCargoToTrackingStatus(cargo: Cargo): TrackingStatus {
  if (cargoIndicatesDelay(cargo)) return 'delayed';
  switch (cargo.status) {
    case 'delivered':
      return 'completed';
    case 'boarded':
      return 'inTransit';
    case 'reserved':
      return 'inOperation';
    default:
      return 'planned';
  }
}

function extractEtaSnippet(etaConfidence: string | undefined): string | undefined {
  if (!etaConfidence) return undefined;
  const [first] = etaConfidence.split('•');
  const trimmed = first?.trim();
  return trimmed || undefined;
}

function checkpointIndexFromId(id: string): 0 | 1 {
  return id.endsWith('cp-2') ? 1 : 0;
}

function buildNextMonitoredSegment(
  path: Array<[number, number]>,
  checkpoints: TrackingPoint[],
  currentPosition: TrackingPoint,
  river: string
): NextMonitoredSegment {
  const vx = currentPosition.coordinates[0];
  const vy = currentPosition.coordinates[1];
  const vt = closestPathProgressNormalized(path, vx, vy);

  type Waypoint = { t: number; ep: NextMonitoredEndpoint };
  const wps: Waypoint[] = [
    { t: 0, ep: { kind: 'origin' } satisfies NextMonitoredEndpoint },
    ...checkpoints
      .filter((cp) => cp.type === 'checkpoint')
      .map((cp) => ({
        t: closestPathProgressNormalized(path, cp.coordinates[0], cp.coordinates[1]),
        ep: { kind: 'checkpoint' as const, index: checkpointIndexFromId(cp.id) }
      })),
    { t: 1, ep: { kind: 'destination' } satisfies NextMonitoredEndpoint }
  ].sort((a, b) => a.t - b.t);

  if (wps.length < 3) {
    return {
      primaryRiver: river,
      from: { kind: 'origin' },
      to: { kind: 'destination' }
    };
  }

  const vtClamped = clampNumber(vt, 0, 1 - 1e-9);

  let segmentIndex = 0;
  for (let i = 0; i < wps.length - 1; i += 1) {
    if (vtClamped >= wps[i].t && vtClamped < wps[i + 1].t) {
      segmentIndex = i;
      break;
    }
    segmentIndex = wps.length - 2;
  }

  const fromIdx = clampNumber(segmentIndex + 1, 0, wps.length - 2);
  let toIdx = clampNumber(segmentIndex + 2, 0, wps.length - 1);
  if (toIdx <= fromIdx) {
    toIdx = wps.length - 1;
  }

  return {
    primaryRiver: river,
    from: wps[fromIdx].ep,
    to: wps[toIdx].ep
  };
}

function buildCheckpoints(path: Array<[number, number]>, cargoId: string): TrackingPoint[] {
  if (path.length < 4) return [];
  const i0 = Math.floor(path.length * 0.34);
  const i1 = Math.floor(path.length * 0.68);
  return [
    {
      id: `${cargoId}-cp-1`,
      label: '',
      type: 'checkpoint',
      coordinates: [...path[clampNumber(i0, 0, path.length - 1)]] as [number, number]
    },
    {
      id: `${cargoId}-cp-2`,
      label: '',
      type: 'checkpoint',
      coordinates: [...path[clampNumber(i1, 0, path.length - 1)]] as [number, number]
    }
  ];
}

/**
 * Sufixo lógico para tons de UI (cores no CSS Module do mapa).
 */
export function getTrackingStatusTone(status: TrackingStatus): string {
  return status;
}

/**
 * Monta o contrato a partir da carga mock (ou futura API): sem efeitos colaterais, sem APIs de browser.
 */
export function buildTrackingRoute(cargo: Cargo): TrackingRoute {
  const originPt = getPointFromLocation(cargo.origin);
  const destPt = getPointFromLocation(cargo.destination);
  const path = samplePathFromCubic(originPt, destPt, TRACKING_PATH_SAMPLE_SEGMENTS);
  const progress01 = getCargoRouteProgress01(cargo.status);
  const progressPct = clampProgress(Math.round(progress01 * 100));
  const vesselT = clampNumber(progress01, VESSEL_PATH_PROGRESS_MIN, VESSEL_PATH_PROGRESS_MAX);
  const vesselCoords = getPointAtProgress(path, vesselT);
  const vesselAngle = tangentAngleAtProgress(path, vesselT);
  const river = cargo.mainRiver || cargo.corridor || 'Rio Amazonas';
  const corridor = cargo.corridor || river;
  const hash = stableIdHash(cargo.id);
  const distanceKm = ROUTE_DISTANCE_BASE_KM + (hash % ROUTE_DISTANCE_SPREAD);
  const status = mapCargoToTrackingStatus(cargo);

  const origin: TrackingPoint = {
    id: `${cargo.id}-origin`,
    label: cargo.origin,
    type: 'origin',
    coordinates: [originPt.x, originPt.y],
    status
  };

  const destination: TrackingPoint = {
    id: `${cargo.id}-destination`,
    label: cargo.destination,
    type: 'destination',
    coordinates: [destPt.x, destPt.y],
    status
  };

  const currentPosition: TrackingPoint = {
    id: `${cargo.id}-vessel`,
    label: cargo.title,
    type: 'vessel',
    coordinates: vesselCoords,
    status
  };

  const checkpointsBuilt = buildCheckpoints(path, cargo.id);
  const nextMonitored = buildNextMonitoredSegment(path, checkpointsBuilt, currentPosition, river);

  return {
    id: `${cargo.id}-hydro-route`,
    cargoId: cargo.id,
    cargoLabel: cargo.title,
    origin,
    destination,
    currentPosition,
    corridor,
    river,
    progress: progressPct,
    distanceKm,
    eta: extractEtaSnippet(cargo.etaConfidence),
    status,
    checkpoints: checkpointsBuilt,
    path,
    vesselHeadingDeg: vesselAngle,
    nextMonitored
  };
}

export function getVesselHeadingDegrees(route: TrackingRoute): number {
  return route.vesselHeadingDeg ?? 0;
}

export function pathToSvgD(path: Array<[number, number]>): string {
  if (!path.length) return '';
  const [x0, y0] = path[0];
  let d = `M ${formatSvgNumber(x0)} ${formatSvgNumber(y0)}`;
  for (let i = 1; i < path.length; i += 1) {
    d += ` L ${formatSvgNumber(path[i][0])} ${formatSvgNumber(path[i][1])}`;
  }
  return d;
}
