'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Anchor,
  CalendarDays,
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Filter,
  Layers,
  Leaf,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Search,
  Ship,
  Snowflake,
  TrendingUp,
  Waves,
  X
} from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import type { Cargo, CargoStatus, Negotiation, TrackingEvent, Vessel } from '@/features/marketplace/domain/marketplace.types';
import { formatLocaleCurrency, formatLocaleNumber, formatLocalePercent, formatMockBrl } from '@/shared/i18n/mock-format';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';
import { PriorityTab } from '@/features/dashboard/components/priority-tab/priority-tab';
import { getVesselVisual } from '@/features/cargo-market/components/cargo-detail/cargo-vessel-visual';

const PAGE_SIZE = 5;

type DashboardTab = 'overview' | 'timeline' | 'documents' | 'cost' | 'priority';
type StatusFilter = 'all' | CargoStatus;
type AdvancedFilters = {
  corridor: string;
  origin: string;
  destination: string;
  type: string;
  document: string;
};

type TranslationValues = Record<string, string | number | Date>;
type BoardTranslator = (key: string, values?: TranslationValues) => string;
type CommonTranslator = (key: string, values?: TranslationValues) => string;

type OperationsBoardProps = {
  cargoes: Cargo[];
  negotiations: Negotiation[];
  trackingEvents: TrackingEvent[];
  vessels: Vessel[];
  locale: string;
  initialTab?: DashboardTab;
};

const emptyFilters: AdvancedFilters = {
  corridor: '',
  origin: '',
  destination: '',
  type: '',
  document: ''
};

const tabs: Array<{ key: DashboardTab; labelKey: string }> = [
  { key: 'overview', labelKey: 'tabs.overview' },
  { key: 'timeline', labelKey: 'tabs.timeline' },
  { key: 'documents', labelKey: 'tabs.documents' },
  { key: 'cost', labelKey: 'tabs.cost' },
  { key: 'priority', labelKey: 'tabs.priority' }
];

type OverviewVesselVisual = ReturnType<typeof getVesselVisual>;

const DEFAULT_OVERVIEW_VESSEL_IMAGE = '/mock/vessels/cargo-vessel-real-water-01.webp';


type MapPoint = { x: number; y: number };
type CubicRoute = {
  start: MapPoint;
  controlA: MapPoint;
  controlB: MapPoint;
  end: MapPoint;
  path: string;
};

const LOCATION_COORDINATES: Record<string, MapPoint> = {
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

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function codeFromLocation(value: string) {
  const first = value.split(',')[0]?.trim() ?? value;
  return first
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function statusProgress(status: CargoStatus) {
  switch (status) {
    case 'open': return 15;
    case 'bidding': return 25;
    case 'contracting': return 35;
    case 'reserved': return 40;
    case 'boarded': return 65;
    case 'delivered': return 100;
    default: return 35;
  }
}

function getCargoStatusLabel(status: CargoStatus, tCommon: (key: string) => string) {
  return tCommon(`cargoStatus.${status}`);
}

function getCargoStatusTone(status: CargoStatus) {
  const tones: Record<string, string> = {
    boarded: 'boarded',
    reserved: 'reserved',
    contracting: 'contracting',
    bidding: 'bidding',
    open: 'open',
    delivered: 'delivered'
  };
  return tones[status] ?? 'open';
}

function getCargoProgressTone(status: CargoStatus) {
  return getCargoStatusTone(status);
}

function getCargoProgressPercent(cargo: Cargo) {
  return statusProgress(cargo.status);
}

function formatEtaLabel(value: string | undefined, tBoard: BoardTranslator) {
  if (!value) return tBoard('misc.etaMissing');
  const trimmed = value.trim();
  return trimmed.toLowerCase().startsWith('eta') ? trimmed : `ETA ${trimmed}`;
}

function translateEtaConfidence(value: string, tCommon: (key: string) => string) {
  const normalized = normalize(value);
  if (normalized.includes('alta')) return tCommon('predictability.high');
  if (normalized.includes('sazonal') || normalized.includes('seasonal')) return tCommon('predictability.seasonal');
  if (normalized.includes('media') || normalized.includes('medium')) return tCommon('predictability.medium');
  return value;
}

function parseEtaMeta(
  value: string | undefined,
  tBoard: BoardTranslator,
  tCommon: CommonTranslator
) {
  if (!value) {
    return {
      etaLabel: formatEtaLabel(undefined, tBoard),
      confidenceLabel: ''
    };
  }

  const [etaPartRaw, ...rest] = value.split('•');
  const etaPart = etaPartRaw?.trim() ?? '';
  const confidencePart = rest.join('•').trim();

  return {
    etaLabel: formatEtaLabel(etaPart || value, tBoard),
    confidenceLabel: confidencePart ? translateEtaConfidence(confidencePart, tCommon) : ''
  };
}

function buildVisualCargoPool(cargoes: Cargo[]) {
  if (cargoes.length >= 20) {
    return cargoes.slice(0, 20);
  }

  const targetSize = Math.max(20, cargoes.length);
  const statusRotation: CargoStatus[] = ['open', 'bidding', 'contracting', 'reserved', 'boarded', 'delivered'];

  return Array.from({ length: targetSize }, (_, index) => {
    const base = cargoes[index % cargoes.length];
    const duplicate = index >= cargoes.length;
    const sequence = String(index + 1).padStart(5, '0');
    const status = statusRotation[index % statusRotation.length];

    if (!duplicate) {
      return base;
    }

    return {
      ...base,
      id: `hyd-2026-${sequence}`,
      status,
      title: `${base.title} ${Math.floor(index / cargoes.length) + 1}`,
      etaConfidence: [
        'ETA 36–44h • confiança média',
        'ETA 4–6 dias • confiança média',
        'ETA 52–72h • sazonal',
        'ETA 30–42h • alta confiança'
      ][index % 4]
    };
  });
}

function getLegacyStatusTone(status: CargoStatus) {
  const legacy: Record<CargoStatus, string> = {
    boarded: 'is-transit',
    reserved: 'is-operation',
    contracting: 'is-contracting',
    bidding: 'is-quote',
    open: 'is-open',
    delivered: 'is-delivered'
  };
  return legacy[status];
}

function formatMoney(locale: string, value: string) {
  return formatMockBrl(locale, value) || value.replace('R$', 'R$ ').replace(/\s+/g, ' ').trim();
}

function parseMoney(value: string) {
  const match = value.match(/(\d[\d.,]*)/);
  if (!match) return 0;
  const numeric = Number(match[1].replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : 0;
}

function riverName(cargo: Cargo) {
  return cargo.mainRiver || cargo.corridor || 'Rio Amazonas';
}

function mapProgressByStatus(status: CargoStatus) {
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveKnownPoint(location: string) {
  const key = normalize(location).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (LOCATION_COORDINATES[key]) {
    return LOCATION_COORDINATES[key];
  }
  const withoutState = key.replace(/\b[a-z]{2}\b/g, '').replace(/\s+/g, ' ').trim();
  if (LOCATION_COORDINATES[withoutState]) {
    return LOCATION_COORDINATES[withoutState];
  }
  return null;
}

function fallbackPoint(location: string): MapPoint {
  const source = normalize(location);
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  const x = 140 + (positive % 760);
  const y = 90 + (Math.floor(positive / 13) % 270);
  return { x, y };
}

function getPointFromLocation(location: string): MapPoint {
  return resolveKnownPoint(location) ?? fallbackPoint(location);
}

function buildRoute(origin: MapPoint, destination: MapPoint): CubicRoute {
  const start = origin;
  const end = destination;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const curvature = clamp(distance * 0.22, 58, 130);
  const riverBias = end.y < start.y ? -0.9 : 0.9;

  const controlA = {
    x: start.x + dx * 0.3 + normalX * curvature * riverBias,
    y: start.y + dy * 0.24 + normalY * curvature * riverBias
  };
  const controlB = {
    x: start.x + dx * 0.72 - normalX * curvature * (riverBias * 0.76),
    y: start.y + dy * 0.78 - normalY * curvature * (riverBias * 0.76)
  };

  return {
    start,
    controlA,
    controlB,
    end,
    path: `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`
  };
}

function pointInCubicBezier(route: CubicRoute, t: number): MapPoint {
  const safeT = clamp(t, 0, 1);
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

function tangentAngleInBezier(route: CubicRoute, t: number) {
  const safeT = clamp(t, 0.02, 1);
  const inv = 1 - safeT;
  const dx = 3 * (inv ** 2) * (route.controlA.x - route.start.x)
    + 6 * inv * safeT * (route.controlB.x - route.controlA.x)
    + 3 * (safeT ** 2) * (route.end.x - route.controlB.x);
  const dy = 3 * (inv ** 2) * (route.controlA.y - route.start.y)
    + 6 * inv * safeT * (route.controlB.y - route.controlA.y)
    + 3 * (safeT ** 2) * (route.end.y - route.controlB.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function parseStateTag(location: string) {
  const match = location.match(/,\s*([A-Za-z]{2})\b/);
  return match?.[1]?.toUpperCase() ?? '';
}

type LabelPlacement = { dx: number; dy: number; anchor?: 'start' | 'middle' | 'end' };

const MAP_LABEL_POSITIONS: Record<string, LabelPlacement> = {
  Manaus: { dx: 10, dy: -10, anchor: 'start' },
  Parintins: { dx: 10, dy: -10, anchor: 'start' },
  Óbidos: { dx: -8, dy: -18, anchor: 'end' },
  Juruti: { dx: 10, dy: -12, anchor: 'start' },
  Santarém: { dx: 10, dy: -14, anchor: 'start' },
  Alenquer: { dx: -12, dy: -30, anchor: 'end' },
  'Monte Alegre': { dx: 0, dy: -18, anchor: 'middle' },
  Prainha: { dx: 0, dy: 18, anchor: 'middle' },
  Breves: { dx: 8, dy: -14, anchor: 'start' },
  Abaetetuba: { dx: 8, dy: 16, anchor: 'start' },
  Barcarena: { dx: 8, dy: 16, anchor: 'start' },
  Belém: { dx: 12, dy: -14, anchor: 'start' },
  Macapá: { dx: 12, dy: -10, anchor: 'start' },
  Itaituba: { dx: 8, dy: -14, anchor: 'start' },
  Altamira: { dx: 10, dy: -14, anchor: 'start' },
  PARÁ: { dx: 10, dy: 16, anchor: 'start' },
  AMAZONAS: { dx: 10, dy: -16, anchor: 'start' }
};

function vesselName(cargo: Cargo, negotiations: Negotiation[], vessels: Vessel[]) {
  const negotiation = negotiations.find((item) => item.cargoId === cargo.id || item.cargoTitle === cargo.title);
  const vessel = vessels.find((item) => item.id === negotiation?.vesselId || item.name === negotiation?.vesselName);
  return vessel?.name || negotiation?.vesselName || cargo.serviceType || 'Frio Tapajós';
}

function carrierName(cargo: Cargo, negotiations: Negotiation[], vessels: Vessel[]) {
  const negotiation = negotiations.find((item) => item.cargoId === cargo.id || item.cargoTitle === cargo.title);
  const vessel = vessels.find((item) => item.id === negotiation?.vesselId || item.name === negotiation?.vesselName);
  return vessel?.owner || negotiation?.parties?.[1] || 'FrioRios';
}

function cargoType(cargo: Cargo) {
  return cargo.cargoType || 'Refrigerada';
}


function getTimelineSource(event: TrackingEvent) {
  return normalize(`${event.kind ?? ''} ${event.title} ${event.description} ${event.location}`);
}

function getTimelinePhaseLabel(event: TrackingEvent, index: number, tBoard: BoardTranslator) {
  const source = getTimelineSource(event);

  if (event.kind === 'cargo_created' || source.includes('carga criada') || source.includes('solicit')) return tBoard('timeline.phase.planning');
  if (event.kind === 'documentation_pending' || source.includes('document')) return tBoard('timeline.phase.compliance');
  if (event.kind === 'shipment_confirmed' || source.includes('janela') || source.includes('embarque')) return tBoard('timeline.phase.operation');
  if (event.kind === 'in_transit' || source.includes('navega') || source.includes('transito') || source.includes('rio')) return tBoard('timeline.phase.monitoring');
  if (event.kind === 'delivered' || source.includes('atrac') || source.includes('porto') || source.includes('destino')) return tBoard('timeline.phase.arrival');

  return tBoard('timeline.phaseFallback', { index: index + 1 });
}

function getTimelineStatusLabel(status: TrackingEvent['status'], tBoard: (key: string) => string) {
  if (status === 'done') return tBoard('timeline.status.done');
  if (status === 'current') return tBoard('timeline.status.current');
  return tBoard('timeline.status.pending');
}

function getTimelineIcon(event: TrackingEvent, index: number) {
  const source = getTimelineSource(event);

  if (event.kind === 'cargo_created' || source.includes('carga criada') || source.includes('coleta') || source.includes('lote')) return <Package size={18} />;
  if (event.kind === 'documentation_pending' || source.includes('document') || source.includes('nota') || source.includes('romaneio')) return <ClipboardList size={18} />;
  if (event.kind === 'shipment_confirmed' || source.includes('janela') || source.includes('embarque') || source.includes('reserva')) return <CalendarDays size={18} />;
  if (event.kind === 'in_transit' || source.includes('transito') || source.includes('embarc') || source.includes('rota') || source.includes('rio')) return <Ship size={18} />;
  if (event.kind === 'delivered' || source.includes('porto') || source.includes('atrac') || source.includes('destino')) return <Anchor size={18} />;

  return event.status === 'done' ? <Check size={18} /> : index === 0 ? <Clock3 size={18} /> : <Circle size={16} />;
}

function getTimelineTone(event: TrackingEvent, index: number) {
  if (event.status === 'current') return 'is-current';
  if (event.status === 'done' && index < 2) return 'is-success';

  const source = getTimelineSource(event);
  if (source.includes('rio') || source.includes('navega') || source.includes('transito')) return 'is-water';
  if (source.includes('atrac') || source.includes('janela') || source.includes('porto')) return 'is-warning';

  return event.status === 'done' ? 'is-success' : 'is-muted';
}

function getTimelineChecklistLabel(event: TrackingEvent, index: number, tBoard: (key: string) => string) {
  const source = getTimelineSource(event);

  if (event.kind === 'cargo_created' || source.includes('carga criada')) return tBoard('timeline.checklist.planning');
  if (event.kind === 'documentation_pending' || source.includes('document')) return tBoard('timeline.checklist.compliance');
  if (event.kind === 'shipment_confirmed' || source.includes('janela') || source.includes('embarque')) return tBoard('timeline.checklist.operation');
  if (event.kind === 'in_transit' || source.includes('navega') || source.includes('transito')) return tBoard('timeline.checklist.monitoring');
  if (event.kind === 'delivered' || source.includes('atrac') || source.includes('porto')) return tBoard('timeline.checklist.arrival');

  return index < 2 ? tBoard('timeline.checklist.done') : tBoard('timeline.checklist.ongoing');
}

function getTimelineHighlights(
  event: TrackingEvent,
  cargo: Cargo,
  index: number,
  tBoard: BoardTranslator,
  tCommon: CommonTranslator
) {
  const phase = getTimelinePhaseLabel(event, index, tBoard);
  const status = getTimelineStatusLabel(event.status, tBoard);
  const source = getTimelineSource(event);
  const secondaryLabel = source.includes('document')
    ? tBoard('timeline.labels.package')
    : source.includes('janela') || source.includes('embarque')
      ? tBoard('timeline.labels.terminal')
      : source.includes('navega') || source.includes('transito')
        ? tBoard('timeline.labels.corridor')
        : source.includes('atrac') || source.includes('porto')
          ? tBoard('timeline.labels.destination')
          : tBoard('timeline.labels.origin');
  const secondaryValue = source.includes('document')
    ? tBoard('misc.docsCount', { count: cargo.requiredDocuments?.length ?? cargo.documents?.length ?? 13 })
    : source.includes('janela') || source.includes('embarque')
      ? cargo.origin
      : source.includes('navega') || source.includes('transito')
        ? (cargo.mainRiver ?? cargo.corridor ?? 'Corredor fluvial')
        : source.includes('atrac') || source.includes('porto')
          ? cargo.destination
          : cargo.origin;

  return [
    { label: tCommon('status'), value: status },
    { label: tBoard('timeline.labels.stage'), value: phase },
    { label: secondaryLabel, value: secondaryValue }
  ];
}

function getTimelineTags(event: TrackingEvent, cargo: Cargo, index: number, tBoard: BoardTranslator) {
  const phase = getTimelinePhaseLabel(event, index, tBoard);

  return [
    phase,
    event.location,
    event.status === 'done' ? tBoard('timeline.tags.xpCollected') : event.status === 'current' ? tBoard('timeline.tags.activeOperation') : tBoard('timeline.tags.operationalQueue'),
    cargo.cargoType
  ].filter(Boolean).slice(0, 4);
}

function buildTimelineFallback(cargo: Cargo, tBoard: BoardTranslator): TrackingEvent[] {
  const origin = cargo.origin;
  const destination = cargo.destination;
  const river = cargo.mainRiver ?? cargo.corridor ?? 'Rio Amazonas';

  return [
    {
      id: `${cargo.id}-planned`,
      cargoId: cargo.id,
      title: tBoard('timeline.fallback.createdTitle'),
      location: origin,
      timestamp: tBoard('timeline.fallback.createdTimestamp'),
      description: tBoard('timeline.fallback.createdDescription', { river }),
      status: 'done',
      kind: 'cargo_created'
    },
    {
      id: `${cargo.id}-docs`,
      cargoId: cargo.id,
      title: tBoard('timeline.fallback.documentsTitle'),
      location: tBoard('timeline.fallback.documentsLocation'),
      timestamp: tBoard('timeline.fallback.documentsTimestamp'),
      description: tBoard('timeline.fallback.documentsDescription'),
      status: 'done',
      kind: 'documentation_pending'
    },
    {
      id: `${cargo.id}-boarding`,
      cargoId: cargo.id,
      title: tBoard('timeline.fallback.boardingTitle'),
      location: origin,
      timestamp: tBoard('timeline.fallback.boardingTimestamp'),
      description: tBoard('timeline.fallback.boardingDescription'),
      status: 'current',
      kind: 'shipment_confirmed'
    },
    {
      id: `${cargo.id}-route`,
      cargoId: cargo.id,
      title: tBoard('timeline.fallback.routeTitle'),
      location: river,
      timestamp: tBoard('timeline.fallback.routeTimestamp'),
      description: tBoard('timeline.fallback.routeDescription', { destination }),
      status: 'pending',
      kind: 'in_transit'
    },
    {
      id: `${cargo.id}-arrival`,
      cargoId: cargo.id,
      title: tBoard('timeline.fallback.arrivalTitle'),
      location: destination,
      timestamp: '06/06/2026 08:30',
      description: tBoard('timeline.fallback.arrivalDescription'),
      status: 'pending',
      kind: 'delivered'
    }
  ];
}


function HydroMapPanel({
  cargo,
  tBoard,
  tCommon
}: {
  cargo: Cargo;
  tBoard: BoardTranslator;
  tCommon: CommonTranslator;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [layerMode, setLayerMode] = useState<'all' | 'route' | 'network'>('all');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<null | { name: string; point: MapPoint; note: string; category: string; tone?: string }>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1000, height: 470 });
  const dragState = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!expanded) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setViewportSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const timer = window.setTimeout(updateSize, 80);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.clearTimeout(timer);
    };
  }, [expanded]);

  const originPoint = getPointFromLocation(cargo.origin);
  const destinationPoint = getPointFromLocation(cargo.destination);
  const route = buildRoute(originPoint, destinationPoint);
  const progress = mapProgressByStatus(cargo.status);
  const routeMidPoint = pointInCubicBezier(route, 0.5);
  const directionPoint = pointInCubicBezier(route, clamp(progress + 0.08, 0.18, 0.92));
  const directionAngle = tangentAngleInBezier(route, clamp(progress + 0.08, 0.18, 0.92));
  const mainRiver = cargo.mainRiver || cargo.corridor || 'Rio Amazonas';
  const inTransitCount = Math.max(1, Math.round(progress * 18));
  const operationCount = Math.max(1, Math.round((1 - progress) * 10));
  const layerLabel = layerMode === 'all' ? tBoard('map.layers.all') : layerMode === 'route' ? tBoard('map.layers.route') : tBoard('map.layers.network');
  const vesselProgress = clamp(progress, 0.14, 0.86);
  const vesselDisplayPoint = pointInCubicBezier(route, vesselProgress);
  const vesselDisplayAngle = tangentAngleInBezier(route, vesselProgress);

  const pointsOfInterest: Array<{ name: string; point: MapPoint; note: string; category: string; role?: 'state'; tone?: string }> = [
    { name: 'Manaus', point: getPointFromLocation('Manaus, AM'), note: 'Capital amazonense, principal polo logístico do Médio Amazonas.', category: 'Cidade-polo', tone: 'city' },
    { name: 'Parintins', point: { x: 430, y: 202 }, note: 'Referência fluvial entre Manaus e Santarém.', category: 'Cidade regional', tone: 'city' },
    { name: 'Óbidos', point: getPointFromLocation('Óbidos, PA'), note: 'Trecho estreito do Rio Amazonas com monitoramento de calado.', category: 'Ponto de monitoramento', tone: 'warning' },
    { name: 'Juruti', point: { x: 520, y: 260 }, note: 'Acesso a terminais e comunidades do Baixo Amazonas.', category: 'Canal local', tone: 'city' },
    { name: 'Santarém', point: getPointFromLocation('Santarém, PA'), note: 'Entrocamento entre Amazonas e Tapajós, forte operação portuária.', category: 'Hub hidroviário', tone: 'hub' },
    { name: 'Alenquer', point: { x: 566, y: 216 }, note: 'Margem norte com navegação regional.', category: 'Canal local', tone: 'city' },
    { name: 'Monte Alegre', point: { x: 648, y: 220 }, note: 'Ponto intermediário da rota para leste.', category: 'Cidade regional', tone: 'city' },
    { name: 'Prainha', point: { x: 694, y: 232 }, note: 'Trecho de passagem com navegação sazonal.', category: 'Trecho operacional', tone: 'city' },
    { name: 'Breves', point: getPointFromLocation('Breves, PA'), note: 'Conexão com os furos do Marajó e canais interiores.', category: 'Canal regional', tone: 'city' },
    { name: 'Abaetetuba', point: getPointFromLocation('Abaetetuba, PA'), note: 'Acesso aos rios Tocantins e Moju.', category: 'Conexão secundária', tone: 'city' },
    { name: 'Barcarena', point: { x: 892, y: 244 }, note: 'Área industrial e portuária próxima a Belém.', category: 'Terminal portuário', tone: 'hub' },
    { name: 'Belém', point: getPointFromLocation('Belém, PA'), note: 'Porta de saída da carga para a malha metropolitana e exportação.', category: 'Terminal portuário', tone: 'hub' },
    { name: 'Macapá', point: getPointFromLocation('Macapá, AP'), note: 'Ligação pelo canal Norte e margem do Amazonas.', category: 'Capital regional', tone: 'city' },
    { name: 'Itaituba', point: getPointFromLocation('Itaituba, PA'), note: 'Corredor do Tapajós para carga do interior.', category: 'Corredor logístico', tone: 'city' },
    { name: 'Altamira', point: getPointFromLocation('Altamira, PA'), note: 'Influência da bacia do Xingu na malha regional.', category: 'Influência regional', tone: 'city' },
    { name: 'PARÁ', point: { x: 790, y: 352 }, note: 'Margem leste da rota amazônica.', category: 'Região', role: 'state', tone: 'state' },
    { name: 'AMAZONAS', point: { x: 178, y: 300 }, note: 'Trecho oeste da bacia hidrográfica.', category: 'Região', role: 'state', tone: 'state' }
  ];

  const cycleLayers = () => {
    setLayerMode((current) => {
      if (current === 'all') return 'route';
      if (current === 'route') return 'network';
      return 'all';
    });
  };

  const maxPanX = Math.max(0, ((viewportSize.width * zoomLevel) - viewportSize.width) / 2 + 24);
  const maxPanY = Math.max(0, ((viewportSize.height * zoomLevel) - viewportSize.height) / 2 + 16);

  const resetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const closeExpandedMap = () => {
    setExpanded(false);
    resetView();
    setHoveredPlace(null);
  };

  const toggleExpandedMap = () => {
    if (expanded) {
      closeExpandedMap();
      return;
    }
    resetView();
    setHoveredPlace(null);
    setExpanded(true);
  };

  const changeZoom = (delta: number) => {
    setZoomLevel((current) => {
      const next = clamp(Number((current + delta).toFixed(2)), 1, 2.6);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((currentPan) => ({
          x: clamp(currentPan.x, -Math.max(0, ((viewportSize.width * next) - viewportSize.width) / 2 + 24), Math.max(0, ((viewportSize.width * next) - viewportSize.width) / 2 + 24)),
          y: clamp(currentPan.y, -Math.max(0, ((viewportSize.height * next) - viewportSize.height) / 2 + 16), Math.max(0, ((viewportSize.height * next) - viewportSize.height) / 2 + 16))
        }));
      }
      return next;
    });
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    if (zoomLevel <= 1) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const nextX = clamp(dragState.current.originX + (event.clientX - dragState.current.startX), -maxPanX, maxPanX);
    const nextY = clamp(dragState.current.originY + (event.clientY - dragState.current.startY), -maxPanY, maxPanY);
    setPan({ x: nextX, y: nextY });
  };

  const endDrag = () => {
    dragState.current.active = false;
    setIsDragging(false);
  };

  const overlayPosition = (point: MapPoint, offsetX: number, offsetY: number) => ({
    left: `${clamp(point.x / 10 + offsetX, 1.4, 96.2)}%`,
    top: `${clamp(point.y / 4.7 + offsetY, 3, 93)}%`
  });

  const tooltipPosition = (point: MapPoint) => {
    const xPercent = point.x / 10;
    const yPercent = point.y / 4.7;
    const offsetX = xPercent > 80 ? -17.5 : xPercent < 18 ? 1.8 : -6.8;
    const offsetY = yPercent < 20 ? 2.4 : -8.1;
    return overlayPosition(point, offsetX, offsetY);
  };

  const shortOrigin = cargo.origin.split(',')[0];
  const shortDestination = cargo.destination.split(',')[0];
  const isRouteForward = destinationPoint.x >= originPoint.x;
  const originMarkerOffset = isRouteForward ? { x: 1.2, y: 2.2 } : { x: -8.6, y: 2.1 };
  const destinationMarkerOffset = isRouteForward ? { x: 1.1, y: -7.4 } : { x: -8.4, y: -7.2 };
  const routeChipOffset = isRouteForward ? { x: -5.8, y: -13.4 } : { x: -9.6, y: -13.4 };
  const showNetwork = layerMode !== 'route';
  const showRoute = layerMode !== 'network';
  const showLabels = layerMode !== 'route';
  const routeEndpointNames = new Set([shortOrigin, shortDestination]);
  const labelItems = pointsOfInterest.filter((item) => !routeEndpointNames.has(item.name));
  const isCompactViewport = viewportSize.width <= 900;
  const routeSummaryStatus = getCargoStatusLabel(cargo.status, tCommon);

  const renderViewport = (mode: 'card' | 'modal') => {
    const isModal = mode === 'modal';

    return (
      <div ref={viewportRef} className={`hx-map-viewport ${isModal ? 'is-modal' : ''} ${isCompactViewport ? 'is-compact' : ''}`}>
        <div className="hx-map-stats">
          <article><Ship size={14} /><span>{tBoard('map.inTransitCargoes')}</span><strong>{inTransitCount}</strong></article>
          <article><Snowflake size={14} /><span>{tBoard('map.inOperation')}</span><strong>{operationCount}</strong></article>
        </div>

        <div className="hx-map-tools">
          <button type="button" onClick={cycleLayers} title={tBoard('map.toggleLayers', { layer: layerLabel })}><Layers size={16} /> {tCommon('filter')}</button>
          <button type="button" aria-label={isModal ? tBoard('map.closeExpanded') : tBoard('map.expand')} onClick={toggleExpandedMap}>{isModal ? <X size={16} /> : '↗'}</button>
        </div>

        <div className="hx-map-controls">
          <button type="button" aria-label={tBoard('map.zoomIn')} onClick={() => changeZoom(0.18)}>+</button>
          <button type="button" aria-label={tBoard('map.zoomOut')} onClick={() => changeZoom(-0.18)}>−</button>
          <button type="button" aria-label={tBoard('map.resetView')} onClick={resetView}>⌾</button>
        </div>

        <div
          className={`hx-map-scene ${zoomLevel > 1 ? 'is-draggable' : ''} ${isDragging ? 'is-dragging' : ''}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          <svg className="hx-amazon-map" viewBox="0 0 1000 470" preserveAspectRatio="none" aria-label={tBoard('map.waterwayMap')}>
            <defs>
              <filter id="hxRouteGlowMonoV14">
                <feGaussianBlur stdDeviation="2.8" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0" result="softGlow" />
                <feMerge>
                  <feMergeNode in="softGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="hxRouteBandV14" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(195, 236, 234, .58)" />
                <stop offset=".48" stopColor="rgba(255,255,255,.98)" />
                <stop offset="1" stopColor="rgba(195, 236, 234, .58)" />
              </linearGradient>
              <radialGradient id="hxPointGlowV14" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="rgba(255,255,255,.95)" />
                <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            <g className="hx-map-grid">
              {Array.from({ length: 16 }, (_, index) => <line key={`v-${index}`} x1={index * 70} x2={index * 70} y1="0" y2="470" />)}
              {Array.from({ length: 9 }, (_, index) => <line key={`h-${index}`} x1="0" x2="1000" y1={index * 58} y2={index * 58} />)}
            </g>

            {showNetwork ? (
              <>
                <g className="hx-map-water-areas">
                  <path style={{ fill: 'color-mix(in srgb, var(--hx-blue) 12%, transparent)', stroke: 'color-mix(in srgb, var(--hx-map-line, var(--hx-blue)) 20%, transparent)', strokeWidth: 1.2 }} d="M18 306 C104 262 194 228 296 212 C398 194 514 190 612 194 C728 198 842 178 986 122 L986 166 C842 214 732 236 624 234 C520 232 410 240 316 260 C210 282 118 314 18 356 Z" />
                  <path style={{ fill: 'color-mix(in srgb, var(--hx-blue) 9%, transparent)', stroke: 'color-mix(in srgb, var(--hx-map-line, var(--hx-blue)) 16%, transparent)', strokeWidth: 1.1 }} d="M18 170 C116 146 198 136 278 138 C366 140 432 160 486 194 C550 234 630 226 706 194 C792 158 882 116 986 78 L986 116 C884 154 796 188 714 220 C634 252 544 262 476 230 C424 206 360 194 278 194 C202 194 122 208 18 238 Z" />
                  <path style={{ fill: 'color-mix(in srgb, var(--hx-blue) 7%, transparent)', stroke: 'color-mix(in srgb, var(--hx-map-line, var(--hx-blue)) 14%, transparent)', strokeWidth: 1 }} d="M170 360 C246 332 308 318 366 326 C426 334 474 326 536 288 C598 248 652 204 720 160 L742 176 C674 222 620 270 560 312 C490 360 424 380 356 374 C290 368 236 372 170 392 Z" />
                </g>
                <g className="hx-river-network hx-river-network--secondary">
                  <path d="M242 138 C292 154 338 182 384 226 C430 270 480 292 544 286 C604 280 674 242 742 186" />
                  <path d="M504 60 C528 112 562 146 612 154 C680 164 756 154 834 110" />
                  <path d="M258 206 C284 248 292 290 300 330 C306 364 328 394 376 414" />
                  <path d="M636 216 C680 254 728 306 790 356 C846 402 914 420 990 420" />
                  <path d="M120 98 C220 86 328 98 406 142 C468 176 548 182 628 168 C710 154 804 112 930 64" />
                  <path d="M146 422 C232 388 314 374 394 384 C476 394 560 370 640 316 C716 264 786 198 868 154" />
                </g>
              </>
            ) : null}

            {showLabels ? (
              <g className="hx-city-dots">
                {pointsOfInterest.map((item) => (
                  <g key={item.name} className={`is-${item.tone || 'city'}`}>
                    <circle cx={item.point.x} cy={item.point.y} r={item.role === 'state' ? 4.4 : 4.1} fill="url(#hxPointGlowV14)" />
                    <circle cx={item.point.x} cy={item.point.y} r={item.role === 'state' ? 1.4 : 1.8} />
                  </g>
                ))}
              </g>
            ) : null}

            {showRoute ? (
              <>
                <path className="hx-route-tail" d={route.path} />
                <path className="hx-active-route" filter="url(#hxRouteGlowMonoV14)" d={route.path} />
              </>
            ) : null}

            {showLabels ? labelItems.map((item) => {
              const placement = MAP_LABEL_POSITIONS[item.name] || { dx: 8, dy: item.role === 'state' ? -8 : -10, anchor: 'start' as const };
              return (
                <text
                  key={`label-${item.name}`}
                  x={item.point.x + placement.dx}
                  y={item.point.y + placement.dy}
                  textAnchor={placement.anchor}
                  className={item.role === 'state' ? 'hx-map-state-label' : ''}
                >
                  {item.name}
                </text>
              );
            }) : null}
          </svg>

          {showRoute ? (
            <>
              <div className="hx-map-route-chip" style={overlayPosition(routeMidPoint, routeChipOffset.x, routeChipOffset.y)}>
                <span>{mainRiver}</span>
                <strong>{shortOrigin} → {shortDestination}</strong>
              </div>

              <button type="button" className="hx-map-marker hx-map-marker--origin" style={overlayPosition(originPoint, originMarkerOffset.x, originMarkerOffset.y)} title={tBoard('map.originTitle', { location: cargo.origin })}>
                <Anchor size={11} />
                <span>{shortOrigin}</span>
              </button>

              <button type="button" className="hx-map-marker hx-map-marker--destination" style={overlayPosition(destinationPoint, destinationMarkerOffset.x, destinationMarkerOffset.y)} title={tBoard('map.destinationTitle', { location: cargo.destination })}>
                <MapPin size={11} />
                <span>{shortDestination}</span>
              </button>

              <div className="hx-map-direction-badge" style={{ ...overlayPosition(directionPoint, -1.05, -2.45), transform: `rotate(${directionAngle}deg)` }} aria-hidden="true">
                <ArrowRight size={11} />
              </div>

              <div
                className="hx-map-vessel"
                style={{
                  left: `${vesselDisplayPoint.x / 10}%`,
                  top: `${vesselDisplayPoint.y / 4.7}%`,
                  transform: `translate(-50%, -50%) rotate(${vesselDisplayAngle}deg)`
                }}
                aria-label={tBoard('map.vesselTransit', { origin: cargo.origin, destination: cargo.destination })}
              >
                <svg viewBox="0 0 126 44" role="presentation">
                  <path d="M8 28 L86 28 L114 23 L106 35 L18 36 Z" className="hx-vessel-hull" />
                  <rect x="36" y="12" width="22" height="8" rx="1.4" className="hx-vessel-cabin" />
                  <rect x="61" y="11" width="18" height="9" rx="1.2" className="hx-vessel-container" />
                  <rect x="82" y="10" width="15" height="10" rx="1.2" className="hx-vessel-container is-alt" />
                  <path d="M114 22 L124 18 L124 27 Z" className="hx-vessel-arrow" />
                </svg>
              </div>
            </>
          ) : null}

          {showLabels ? pointsOfInterest.map((item) => (
            <button
              key={`poi-${item.name}`}
              type="button"
              className="hx-map-poi-hotspot"
              style={overlayPosition(item.point, -1.35, -2.05)}
              onPointerEnter={() => setHoveredPlace(item)}
              onPointerMove={() => setHoveredPlace(item)}
              onFocus={() => setHoveredPlace(item)}
              onPointerLeave={() => setHoveredPlace((current) => (current?.name === item.name ? null : current))}
              onBlur={() => setHoveredPlace((current) => (current?.name === item.name ? null : current))}
              aria-label={`${item.name}: ${item.note}`}
            />
          )) : null}

          {hoveredPlace ? (
            <div className="hx-map-tooltip" style={tooltipPosition(hoveredPlace.point)}>
              <small>{hoveredPlace.category}</small>
              <strong>{hoveredPlace.name}</strong>
              <span>{hoveredPlace.note}</span>
            </div>
          ) : null}
        </div>

        <div className="hx-map-legend">
          <span>{tBoard('map.legend')}</span>
          <i className="is-transit" /> {tBoard('statusFilters.boarded')}
          <i className="is-operation" /> {tBoard('statusFilters.reserved')}
          <i className="is-late" /> {tBoard('map.delayed')}
          <i className="is-planned" /> {tBoard('map.planned')}
        </div>

        <div className="hx-map-caption">
          <strong>{cargo.origin} → {cargo.destination}</strong>
          <span>{tBoard('map.statusSummary', { river: mainRiver, status: routeSummaryStatus, layer: layerLabel, zoom: Math.round(zoomLevel * 100) })}</span>
        </div>

        <div className="hx-map-route-summary" aria-label={tBoard('map.fullRoute')}>
          <span>{tBoard('map.fullRoute')}</span>
          <strong>{shortOrigin} → {shortDestination}</strong>
          <small>{routeSummaryStatus} · {Math.round(progress * 100)}% · {tBoard('map.legend')}</small>
        </div>

        {isModal ? (
          <div className="hx-map-fullscreen-hint" aria-live="polite">
            <span>{tBoard('map.rotateHint')}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <section className={`hx-map-card hx-map-card--hydro ${expanded ? 'is-expanded' : ''}`}>
        {renderViewport('card')}
      </section>

      {expanded ? (
        <div className="hx-map-modal-backdrop" role="dialog" aria-modal="true" aria-label={tBoard('map.expanded')} onClick={closeExpandedMap}>
          <div className="hx-map-modal" onClick={(event) => event.stopPropagation()}>
            {renderViewport('modal')}
          </div>
        </div>
      ) : null}
    </>
  );
}


type DocumentRequirement = NonNullable<Cargo['requiredDocuments']>[number];

function getDocumentStatusLabel(status: DocumentRequirement['status'] | undefined, tCommon: (key: string) => string) {
  if (status === 'ok') return tCommon('documentStatus.ok');
  if (status === 'conditional') return tCommon('documentStatus.conditional');
  if (status === 'nextPhase') return tCommon('documentStatus.nextPhase');
  return tCommon('documentStatus.required');
}

function getDocumentStatusTone(status?: DocumentRequirement['status']) {
  if (status === 'ok') return 'is-ok';
  if (status === 'conditional') return 'is-conditional';
  if (status === 'nextPhase') return 'is-next';
  return 'is-required';
}

function buildDocumentItems(cargo: Cargo, tBoard: BoardTranslator) {
  const baseDocs = cargo.requiredDocuments?.length
    ? cargo.requiredDocuments
    : (cargo.documents ?? []).map((name) => ({
        name,
        status: 'required' as const,
        note: tBoard('documents.defaultNote')
      }));

  const fallbackDocs = baseDocs.length ? baseDocs : [
    {
      name: 'NF-e',
      status: 'required' as const,
      note: tBoard('documents.fallback.fiscal')
    },
    {
      name: 'CT-e',
      status: 'nextPhase' as const,
      note: tBoard('documents.fallback.cte')
    },
    {
      name: 'Romaneio',
      status: 'required' as const,
      note: tBoard('documents.fallback.manifest')
    },
    {
      name: 'Laudo sanitário',
      status: 'conditional' as const,
      note: tBoard('documents.fallback.health')
    }
  ];

  return fallbackDocs.map((document, index) => ({
    ...document,
    code: document.name
      .replace(/\s+/g, '-')
      .replace(/[^\p{Letter}\p{Number}-]/gu, '')
      .slice(0, 18)
      .toUpperCase(),
    owner: index % 2 === 0 ? tBoard('documents.ownerShipper') : tBoard('documents.ownerCarrier'),
    due: index < 2 ? tBoard('documents.dueBooking') : tBoard('documents.dueBerthing'),
    evidence: document.status === 'ok' ? tBoard('documents.evidenceChecked') : document.status === 'nextPhase' ? tBoard('documents.evidenceWaitContract') : tBoard('documents.evidencePending')
  }));
}

function getArrivalEvent(timelineItems: TrackingEvent[]) {
  return timelineItems.find((event) => {
    const source = getTimelineSource(event);
    return event.kind === 'delivered' || source.includes('atrac') || source.includes('porto') || source.includes('destino');
  }) ?? timelineItems[timelineItems.length - 1] ?? null;
}

function splitDateTimeLabel(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(.*?)(?:\s*[•-]\s*|\s+)(\d{1,2}:\d{2})$/);
  if (!match) {
    return { dateLabel: trimmed, timeLabel: '' };
  }

  return {
    dateLabel: match[1]?.trim() ?? trimmed,
    timeLabel: match[2] ?? ''
  };
}

function buildCostModel(cargo: Cargo) {
  const total = parseMoney(cargo.targetPrice);
  const marginRate = 0.18;
  const savingsRate = 0.24;
  const riverTransport = Math.round(total * 0.56);
  const documentation = Math.round(total * 0.08);
  const insurance = Math.round(total * 0.1);
  const portOperation = Math.round(total * 0.16);
  const contingency = Math.max(0, total - riverTransport - documentation - insurance - portOperation);
  const roadEstimate = Math.round(total / (1 - savingsRate));
  const costPerTon = Math.round(total / Math.max(1, parseFloat(cargo.volume.replace(',', '.')) || 28));
  const alerts = [
    {
      tone: 'is-good',
      key: 'healthyMargin',
      detailKey: 'healthyMarginDetail'
    },
    {
      tone: cargo.predictability === 'seasonal' ? 'is-warning' : 'is-neutral',
      key: 'seasonalityRisk',
      detailKey: cargo.predictability === 'seasonal' ? 'seasonalityRiskDetailHigh' : 'seasonalityRiskDetailLow'
    },
    {
      tone: (cargo.documentReadiness ?? 72) < 80 ? 'is-warning' : 'is-neutral',
      key: 'documentImpact',
      detailKey: (cargo.documentReadiness ?? 72) < 80 ? 'documentImpactDetailHigh' : 'documentImpactDetailLow'
    }
  ] as const;

  return {
    total,
    marginRate,
    savingsRate,
    roadEstimate,
    costPerTon,
    breakdown: [
      { key: 'riverTransport', value: riverTransport, share: riverTransport / total, tone: 'is-cyan' },
      { key: 'documentation', value: documentation, share: documentation / total, tone: 'is-blue' },
      { key: 'insurance', value: insurance, share: insurance / total, tone: 'is-green' },
      { key: 'portOperation', value: portOperation, share: portOperation / total, tone: 'is-yellow' },
      { key: 'contingency', value: contingency, share: contingency / total, tone: 'is-muted' }
    ],
    timeline: [
      { key: 'quote', progress: 0.18 },
      { key: 'reserve', progress: 0.4 },
      { key: 'operation', progress: 0.72 },
      { key: 'delivery', progress: 1 }
    ],
    alerts
  };
}


export function OperationsBoard({
  cargoes,
  negotiations,
  trackingEvents,
  vessels,
  locale,
  initialTab = 'overview'
}: OperationsBoardProps) {
  const tCommon = useTranslations('common');
  const tBoard = useTranslations('operationsBoard');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [expandedTimelineEventId, setExpandedTimelineEventId] = useState<string | null>(null);
  const [expandedDocumentName, setExpandedDocumentName] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(cargoes[0]?.id ?? '');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const visualCargoes = useMemo(() => buildVisualCargoPool(cargoes), [cargoes]);
  const vesselVisualMap = useMemo(
    () =>
      Object.fromEntries(
        visualCargoes.map((cargo) => [cargo.id, getVesselVisual(cargo)])
      ) as Record<string, OverviewVesselVisual>,
    [visualCargoes]
  );

  const options = useMemo(() => ({
    corridor: unique(visualCargoes.map((cargo) => cargo.corridor ?? cargo.mainRiver ?? '')),
    origin: unique(visualCargoes.map((cargo) => cargo.origin)),
    destination: unique(visualCargoes.map((cargo) => cargo.destination)),
    type: unique(visualCargoes.map((cargo) => cargo.cargoType)),
    document: unique(visualCargoes.flatMap((cargo) => cargo.requiredDocuments?.map((doc) => doc.name) ?? cargo.documents ?? []))
  }), [visualCargoes]);

  const filteredCargoes = useMemo(() => {
    return visualCargoes.filter((cargo) => {
      const searchable = normalize([
        cargo.id,
        cargo.title,
        cargo.origin,
        cargo.destination,
        cargo.corridor ?? '',
        cargo.mainRiver ?? '',
        cargo.cargoType,
        cargo.producer ?? '',
        cargo.serviceType ?? ''
      ].join(' '));
      const docs = cargo.requiredDocuments?.map((doc) => doc.name) ?? cargo.documents ?? [];

      return (!query || searchable.includes(normalize(query)))
        && (statusFilter === 'all' || cargo.status === statusFilter)
        && (!advancedFilters.corridor || cargo.corridor === advancedFilters.corridor || cargo.mainRiver === advancedFilters.corridor)
        && (!advancedFilters.origin || cargo.origin === advancedFilters.origin)
        && (!advancedFilters.destination || cargo.destination === advancedFilters.destination)
        && (!advancedFilters.type || cargo.cargoType === advancedFilters.type)
        && (!advancedFilters.document || docs.includes(advancedFilters.document));
    });
  }, [advancedFilters, query, statusFilter, visualCargoes]);

  const totalPages = Math.max(1, Math.ceil(filteredCargoes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageItems = filteredCargoes.slice(pageStart, pageEnd);

  const selectedCargoId = filteredCargoes.some((cargo) => cargo.id === selectedId)
    ? selectedId
    : (filteredCargoes[0]?.id ?? selectedId);
  const selectedCargo = filteredCargoes.find((cargo) => cargo.id === selectedCargoId) ?? pageItems[0] ?? visualCargoes[0] ?? null;
  const selectedEvents = trackingEvents.filter((event) => event.cargoId === selectedCargo?.id);
  const selectedVesselVisual = selectedCargo
    ? (vesselVisualMap[selectedCargo.id] ?? getVesselVisual(selectedCargo))
    : null;
  const selectedVesselImage = selectedVesselVisual?.src ?? DEFAULT_OVERVIEW_VESSEL_IMAGE;
  const timelineItems = selectedCargo
    ? (selectedEvents.length ? selectedEvents : buildTimelineFallback(selectedCargo, tBoard))
    : trackingEvents.slice(0, 5);
  const completedTimelineSteps = timelineItems.filter((event) => event.status === 'done').length;
  const selectedProgress = selectedCargo ? statusProgress(selectedCargo.status) : 0;
  const selectedDocumentItems = selectedCargo ? buildDocumentItems(selectedCargo, tBoard) : [];
  const arrivalEvent = getArrivalEvent(timelineItems);

  const docsCount = selectedCargo?.requiredDocuments?.length ?? selectedCargo?.documents?.length ?? 13;
  const docsTotal = Math.max(18, docsCount + 5);
  const documentReadiness = selectedCargo?.documentReadiness ?? Math.min(100, Math.round((docsCount / docsTotal) * 100));
  const pendingDocs = Math.max(0, docsTotal - docsCount);
  const activeFilters = [
    statusFilter !== 'all',
    advancedFilters.corridor,
    advancedFilters.origin,
    advancedFilters.destination,
    advancedFilters.type,
    advancedFilters.document
  ].filter(Boolean).length;

  function updateFilter(key: keyof AdvancedFilters, value: string) {
    setCurrentPage(1);
    setAdvancedFilters((current) => ({ ...current, [key]: value }));
    listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function resetFilters() {
    setQuery('');
    setStatusFilter('all');
    setAdvancedFilters(emptyFilters);
    setCurrentPage(1);
    listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goToPage(nextPage: number) {
    const targetPage = Math.max(1, Math.min(totalPages, nextPage));
    setCurrentPage(targetPage);
    listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth <= 860);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!selectedCargo) {
    return <section className="hx-dashboard hr-dashboard-grid"><div className="hx-empty-state">{tBoard('list.empty')}</div></section>;
  }

  const selectedVessel = vesselName(selectedCargo, negotiations, vessels);
  const selectedCarrier = carrierName(selectedCargo, negotiations, vessels);
  const selectedRiver = riverName(selectedCargo);
  const arrivalTimestamp = arrivalEvent?.timestamp ?? '06/06/2026 08:30';
  const arrivalLocation = arrivalEvent?.location ?? selectedCargo.destination;
  const arrivalDateTime = splitDateTimeLabel(arrivalTimestamp);
  const targetPriceLabel = formatMoney(locale, selectedCargo.targetPrice);
  const routeProgressLabel = tBoard('overview.routeProgress', { progress: selectedProgress });
  const costModel = buildCostModel(selectedCargo);
  const filtersPanel = (
    <>
      <div className="hx-drawer-head">
        <div><small>{tBoard('filters.eyebrow')}</small><h2>{tBoard('filters.title')}</h2></div>
        {!isMobileViewport ? (
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label={tBoard('filters.close')}>
            <X size={18} />
          </button>
        ) : null}
      </div>
      <div className="hx-drawer-count">
        <strong>{tBoard('filters.results', { count: filteredCargoes.length })}</strong>
        <span>{activeFilters ? tBoard('filters.activeCount', { count: activeFilters }) : tBoard('filters.inactive')}</span>
      </div>
      <div className="hx-filter-grid">
        <FilterSelect label={tBoard('filters.corridor')} value={advancedFilters.corridor} options={options.corridor} onChange={(value) => updateFilter('corridor', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.origin')} value={advancedFilters.origin} options={options.origin} onChange={(value) => updateFilter('origin', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.destination')} value={advancedFilters.destination} options={options.destination} onChange={(value) => updateFilter('destination', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.cargoType')} value={advancedFilters.type} options={options.type} onChange={(value) => updateFilter('type', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.document')} value={advancedFilters.document} options={options.document} onChange={(value) => updateFilter('document', value)} allLabel={tBoard('filters.allOptions')} />
      </div>
    </>
  );

  return (
    <section className="hx-dashboard hr-dashboard-grid">
      <aside className="hr-cargo-list-column">
        <section className="hx-cargo-panel hr-cargo-list-panel">
        <div className="hx-panel-head hr-cargo-list-header">
          <div className="hr-cargo-list-title-row">
            <div className="hr-cargo-list-title-wrap">
              <h2>{tBoard('list.title')}</h2>
              <span className="hr-cargo-list-count">{filteredCargoes.length}</span>
            </div>
            <div className="hx-panel-actions hr-cargo-list-actions">
              <button
                type="button"
                className={drawerOpen ? 'hx-icon-button hx-filter-trigger is-active' : 'hx-icon-button hx-filter-trigger'}
                onClick={() => setDrawerOpen((current) => !current)}
                aria-label={tBoard('list.filterAria')}
                aria-expanded={drawerOpen}
              >
                <Filter size={17} />
                {activeFilters ? <b>{activeFilters}</b> : null}
              </button>
              <Link href={intlAppPaths.cargos.publishCargo} className="hx-add-mini">
                <Plus size={15} />
                <span>{tBoard('list.newCargo')}</span>
              </Link>
            </div>
          </div>

          <div className="hr-cargo-list-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
                listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
              }}
              placeholder={tBoard('list.searchPlaceholder')}
              aria-label={tBoard('list.searchAria')}
            />
          </div>

          <div className="hr-cargo-status-filters">
            <button type="button" className={statusFilter === 'all' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
              <Circle size={14} /> {tBoard('statusFilters.all')}
            </button>
            <button type="button" className={statusFilter === 'open' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('open'); setCurrentPage(1); }}>
              <ClipboardList size={14} /> {tBoard('statusFilters.open')}
            </button>
            <button type="button" className={statusFilter === 'bidding' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('bidding'); setCurrentPage(1); }}>
              <Clock3 size={14} /> {tBoard('statusFilters.bidding')}
            </button>
            <button type="button" className={statusFilter === 'contracting' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('contracting'); setCurrentPage(1); }}>
              <FileText size={14} /> {tBoard('statusFilters.contracting')}
            </button>
            <button type="button" className={statusFilter === 'reserved' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('reserved'); setCurrentPage(1); }}>
              <Anchor size={14} /> {tBoard('statusFilters.reserved')}
            </button>
            <button type="button" className={statusFilter === 'boarded' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => { setStatusFilter('boarded'); setCurrentPage(1); }}>
              <Ship size={14} /> {tBoard('statusFilters.boarded')}
            </button>
          </div>
          </div>

          {drawerOpen && !isMobileViewport ? (
            <div className="hx-filter-panel hx-filter-panel--desktop" role="region" aria-label={tBoard('filters.advancedRegion')}>
              {filtersPanel}
              <div className="hx-filter-panel__actions">
                <button type="button" onClick={resetFilters}>{tCommon('clear')}</button>
              </div>
            </div>
          ) : null}

        <div className="hx-cargo-list hr-cargo-list-body" ref={listRef}>
          {pageItems.map((cargo) => {
            const progress = getCargoProgressPercent(cargo);
            const isSelected = cargo.id === selectedCargo.id;
            const statusTone = cargo.status;
            const arrivalLabel = cargo.window || '';
            const { etaLabel, confidenceLabel } = parseEtaMeta(cargo.etaConfidence, tBoard, tCommon);
            return (
              <button
                type="button"
                key={cargo.id}
                className={`hr-cargo-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedId(cargo.id);
                  setExpandedTimelineEventId(null);
                  setExpandedDocumentName(null);
                }}
              >
                <div className="hr-cargo-card__header">
                  <strong className="hr-cargo-card__code">{cargo.id.toUpperCase()}</strong>

                  <div className="hr-cargo-card__actions">
                    <span className={`hr-status-badge hr-status-badge--${statusTone}`}>
                      {getCargoStatusLabel(cargo.status, tCommon)}
                    </span>
                    <MoreVertical size={18} className="hr-cargo-card__menu" />
                  </div>
                </div>

                <p className="hr-cargo-card__title">{cargo.title}</p>

                <div className="hr-cargo-card__route">
                  <span className="hr-cargo-card__city">
                    <span className="hr-cargo-card__dot" />
                    <span>{cargo.origin}</span>
                  </span>

                  <ArrowRight size={18} className="hr-cargo-card__arrow" />

                  <span className="hr-cargo-card__city">
                    <span>{cargo.destination}</span>
                  </span>
                </div>

                <div className="hr-cargo-card__operator">
                  <Ship size={18} />
                  <span>{vesselName(cargo, negotiations, vessels)}</span>
                </div>

                <div className="hr-cargo-card__progress">
                  <div className="hr-cargo-card__track">
                    <span
                      className={`hr-cargo-card__fill hr-cargo-card__fill--${statusTone}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <strong className="hr-cargo-card__progressValue">{progress}%</strong>
                </div>

                <div className="hr-cargo-card__footer">
                  <span>
                    <CalendarDays size={14} />
                    {etaLabel}
                  </span>

                  {confidenceLabel ? (
                    <span>{confidenceLabel}</span>
                  ) : null}

                  {arrivalLabel ? (
                    <span>{tBoard('misc.arrivalLabel', { value: arrivalLabel })}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="hx-list-footer hr-cargo-list-footer">
          <span>{tBoard('list.showing', { pageCount: pageItems.length, totalCount: filteredCargoes.length })}</span>
          <div className="hx-pagination-controls">
            <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1}>{tCommon('previous')}</button>
            <small>{tCommon('pageIndicator', { current: safePage, total: totalPages })}</small>
            <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}>{tCommon('next')}</button>
          </div>
        </div>
        </section>
      </aside>

      <main className="hx-center-column hr-dashboard-center">
        <HydroMapPanel cargo={selectedCargo} tBoard={tBoard} tCommon={tCommon} />

        <section className="hx-detail-card">
          <div className="hx-tabs" role="tablist" aria-label={tBoard('tabs.aria')}>
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={activeTab === tab.key ? 'is-active' : ''}
                id={`hx-tab-${tab.key}`}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`hx-panel-${tab.key}`}
                tabIndex={activeTab === tab.key ? 0 : -1}
                onClick={() => {
                  setActiveTab(tab.key);
                  setExpandedTimelineEventId(null);
                  setExpandedDocumentName(null);
                }}
              >
                {tBoard(tab.labelKey)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' ? (
            <div id="hx-panel-overview" role="tabpanel" aria-labelledby="hx-tab-overview" className="hx-overview hx-overview--split">
              <section className="hx-overview-main-card">
                <div className="hx-overview-hero">
                  <div className="hx-overview-info">
                    <div className="hx-overview-kicker-row">
                      <span className="hx-overview-kicker">{selectedCargo.cargoType}</span>
                      <span className="hx-overview-kicker">{selectedRiver}</span>
                    </div>
                    <div className="hx-title-row">
                      <h2>{selectedCargo.id.toUpperCase()}</h2>
                      <span className={`hx-status ${getLegacyStatusTone(selectedCargo.status)}`}>{getCargoStatusLabel(selectedCargo.status, tCommon)}</span>
                    </div>
                    <p>{selectedCargo.title}</p>

                    <div className="hx-operation-meta">
                      <span><Ship size={16} /> <em>{tBoard('overview.vesselOperation')}</em> <b>{selectedVessel}</b></span>
                      <span><Waves size={16} /> <em>{tCommon('operator')}</em> <b>{selectedCarrier}</b></span>
                    </div>
                  </div>

                  <div
                    className="hx-vessel-photo hx-vessel-photo--editorial"
                    data-treatment={selectedVesselVisual?.treatment ?? 'real-water-dark'}
                    aria-label={tBoard('overview.vesselImageAria')}
                  >
                    <div className="hx-vessel-photo__river" aria-hidden="true" />
                    <div className="hx-vessel-photo__media">
                      <Image
                        src={selectedVesselImage}
                        alt={selectedVesselVisual?.alt ?? `Embarcação associada à carga ${selectedCargo.id}`}
                        className="hx-vessel-photo__image"
                        width={560}
                        height={280}
                        style={{ objectPosition: selectedVesselVisual?.objectPosition ?? 'center right' }}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                <div className="hx-route-progress">
                  <div className="hx-route-points">
                    <div><strong>{selectedCargo.origin}</strong><span>{tCommon('origin')}</span></div>
                    <b>{routeProgressLabel}</b>
                    <div><strong>{selectedCargo.destination}</strong><span>{tCommon('destination')}</span></div>
                  </div>
                  <div className="hx-route-track">
                    <span className="hx-route-track__node hx-route-track__node--origin" aria-hidden="true" />
                    <div className="hx-long-progress">
                      <span style={{ width: `${selectedProgress}%` }} />
                      <i style={{ left: `${selectedProgress}%` }} aria-hidden="true" />
                    </div>
                    <span className="hx-route-track__node hx-route-track__node--dest" aria-hidden="true" />
                  </div>
                  <p>{tBoard('overview.estimatedDistance', { river: selectedRiver })}</p>
                </div>

                <div className="hx-bottom-kpis">
                  <article>
                    <small>{tBoard('overview.etaArrival')}</small>
                    <strong className="hx-nowrap">36–44h</strong>
                    <span className="hx-arrival-inline">
                      {arrivalDateTime.dateLabel ? <span className="hx-arrival-inline__date">{arrivalDateTime.dateLabel}</span> : null}
                      {arrivalDateTime.timeLabel ? <span className="hx-arrival-inline__time">{arrivalDateTime.timeLabel}</span> : null}
                    </span>
                  </article>
                  <article><small>{tBoard('overview.temperature')}</small><strong><Snowflake size={22} /> -18 °C</strong><span>{tBoard('overview.idealRange')}</span></article>
                  <article><small>{tBoard('overview.documentReadiness')}</small><strong><FileText size={20} /> <span className="hx-nowrap">{documentReadiness}%</span></strong><span>{docsCount} de {docsTotal} {tCommon('documents').toLowerCase()}</span></article>
                  <article><small>{tBoard('overview.co2Savings')}</small><strong><Leaf size={22} /> <span className="hx-nowrap">{selectedCargo.co2Saving}</span></strong><span>{tBoard('overview.roadComparison')}</span></article>
                </div>
              </section>

              <aside className="hx-overview-side-cards" aria-label={tBoard('overview.operationalIndicators')}>
                <article className="hx-side-metric hx-side-metric--arrival">
                  <span className="hx-side-metric__icon"><Anchor size={24} /></span>
                  <div className="hx-arrival-copy">
                    <small>{tBoard('overview.berthForecast')}</small>
                    <div className="hx-arrival-inline">
                      {arrivalDateTime.dateLabel ? <strong>{arrivalDateTime.dateLabel}</strong> : null}
                      {arrivalDateTime.timeLabel ? <span className="hx-arrival-inline__time">{arrivalDateTime.timeLabel}</span> : null}
                    </div>
                    <p>{arrivalLocation}</p>
                  </div>
                  <b>{tBoard('overview.onSchedule')}</b>
                </article>

                <article className="hx-side-metric hx-side-metric--documents">
                  <span className="hx-side-metric__icon"><FileText size={24} /></span>
                  <div>
                    <small>{tCommon('documents')}</small>
                    <strong><span>{docsCount}</span> / {docsTotal}</strong>
                    <p>{tBoard('overview.pendingDocuments', { count: pendingDocs })}</p>
                    <div className="hx-side-progress"><i style={{ width: `${documentReadiness}%` }} /></div>
                  </div>
                  <b>{documentReadiness}%</b>
                </article>

                <article className="hx-side-metric hx-side-metric--cost">
                  <span className="hx-side-metric__icon"><CircleDollarSign size={24} /></span>
                  <div>
                    <small>{tBoard('overview.estimatedCost')}</small>
                    <strong className="hx-nowrap">{targetPriceLabel}</strong>
                    <p>{tBoard('overview.estimatedMargin')}</p>
                  </div>
                  <svg className="hx-side-sparkline" viewBox="0 0 120 54" aria-hidden="true">
                    <polyline points="6,42 20,40 34,36 48,32 62,28 76,24 90,20 104,15 116,12" />
                    <g><circle cx="6" cy="42" /><circle cx="34" cy="36" /><circle cx="62" cy="28" /><circle cx="90" cy="20" /><circle cx="116" cy="12" /></g>
                  </svg>
                </article>

                <article className="hx-side-metric hx-side-metric--co2">
                  <span className="hx-side-metric__icon"><Leaf size={24} /></span>
                  <div>
                    <small>{tBoard('overview.co2Savings')}</small>
                    <strong className="hx-nowrap">{selectedCargo.co2Saving}</strong>
                    <p>{tBoard('overview.avoidedCo2')}</p>
                  </div>
                  <svg className="hx-side-sparkline" viewBox="0 0 120 54" aria-hidden="true">
                    <polyline points="6,42 20,39 34,35 48,31 62,26 76,22 90,18 104,14 116,10" />
                    <g><circle cx="6" cy="42" /><circle cx="34" cy="35" /><circle cx="62" cy="26" /><circle cx="90" cy="18" /><circle cx="116" cy="10" /></g>
                  </svg>
                </article>
              </aside>
            </div>
          ) : null}

          {activeTab === 'timeline' ? (
            <div id="hx-panel-timeline" role="tabpanel" aria-labelledby="hx-tab-timeline" className="hx-timeline-game" aria-label={tBoard('timeline.aria')}>
              <div className="hx-timeline-game__summary">
                <span><Ship size={18} /></span>
                <div>
                  <strong>{tBoard('timeline.journey')}</strong>
                  <p>{selectedCargo.origin} → {selectedCargo.destination} · {selectedRiver}</p>
                  <i className="hx-timeline-game__progress"><b style={{ width: `${selectedProgress}%` }} /></i>
                </div>
                <b>{selectedProgress}%</b>
                <small>{tBoard('timeline.completedPhases', { completed: completedTimelineSteps, total: timelineItems.length })}</small>
              </div>

              <div className="hx-timeline-track">
                {timelineItems.map((event, index) => {
                  const isOpen = expandedTimelineEventId === event.id;
                  const phaseLabel = getTimelinePhaseLabel(event, index, tBoard);
                  const highlights = getTimelineHighlights(event, selectedCargo, index, tBoard, tCommon);
                  const tags = getTimelineTags(event, selectedCargo, index, tBoard);
                  const timelineTone = getTimelineTone(event, index);

                  return (
                    <article key={event.id} className={`hx-timeline-node ${timelineTone} ${isOpen ? 'is-open' : ''}`}>
                      <div className="hx-timeline-node__rail">
                        <span className="hx-timeline-node__step">{String(index + 1).padStart(2, '0')}</span>
                        {index < timelineItems.length - 1 ? <i aria-hidden="true" /> : null}
                      </div>

                      <div className="hx-timeline-node__card">
                        <button
                          type="button"
                          className="hx-timeline-node__head"
                          onClick={() => setExpandedTimelineEventId(isOpen ? null : event.id)}
                          aria-expanded={isOpen}
                          aria-controls={`hx-timeline-body-${event.id}`}
                        >
                          <span className="hx-timeline-node__icon">{getTimelineIcon(event, index)}</span>
                          <span className="hx-timeline-node__copy">
                            <small>{phaseLabel}</small>
                            <strong>{event.title}</strong>
                            <em>{event.location} · {event.timestamp}</em>
                          </span>
                          <span className="hx-timeline-node__status">{getTimelineStatusLabel(event.status, tBoard)}</span>
                          <span className="hx-timeline-node__xp">+{(index + 1) * 120} XP</span>
                          <ChevronDown size={18} />
                        </button>

                        <div
                          id={`hx-timeline-body-${event.id}`}
                          className={isOpen ? 'hx-timeline-node__body-wrap is-open' : 'hx-timeline-node__body-wrap'}
                          aria-hidden={isOpen ? undefined : true}
                        >
                          <div className="hx-timeline-node__body">
                            <p>{event.description}</p>
                            <div className="hx-timeline-node__stats">
                              {highlights.map((item) => (
                                <span key={`${event.id}-${item.label}`}>
                                  <small>{item.label}</small>
                                  <strong>{item.value}</strong>
                                </span>
                              ))}
                            </div>
                            <ul className="hx-timeline-node__tags" aria-label={tBoard('timeline.contextAria')}>
                              {tags.map((tag) => <li key={`${event.id}-${tag}`}>{tag}</li>)}
                            </ul>
                            <div className="hx-timeline-node__footer">
                              <span>{tBoard('timeline.operationalMission')}</span>
                              <strong>{getTimelineChecklistLabel(event, index, tBoard)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === 'documents' ? (
            <div id="hx-panel-documents" role="tabpanel" aria-labelledby="hx-tab-documents" className="hx-documents-accordion" aria-label={tBoard('documents.aria')}>
              {selectedDocumentItems.map((document) => {
                const isOpen = expandedDocumentName === document.name;
                const statusLabel = getDocumentStatusLabel(document.status, tCommon);
                const statusTone = getDocumentStatusTone(document.status);

                return (
                  <article key={document.name} className={`hx-document-card ${statusTone} ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="hx-document-card__head"
                      onClick={() => setExpandedDocumentName(isOpen ? null : document.name)}
                      aria-expanded={isOpen}
                    >
                      <span className="hx-document-card__icon"><FileText size={18} /></span>
                      <span className="hx-document-card__copy">
                        <strong>{document.name}</strong>
                        <em>{document.note ?? tBoard('documents.defaultNote')}</em>
                      </span>
                      <span className="hx-document-card__status">{statusLabel}</span>
                      <ChevronDown size={18} />
                    </button>

                    {isOpen ? (
                      <div className="hx-document-card__body">
                        <div className="hx-document-card__meta">
                          <span><small>{tBoard('documents.code')}</small><strong>{document.code}</strong></span>
                          <span><small>{tBoard('documents.owner')}</small><strong>{document.owner}</strong></span>
                          <span><small>{tBoard('documents.due')}</small><strong>{document.due}</strong></span>
                          <span><small>{tBoard('documents.evidence')}</small><strong>{document.evidence}</strong></span>
                        </div>
                        <p>{document.note ?? tBoard('documents.defaultNote')}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}

          {activeTab === 'cost' ? (
            <div id="hx-panel-cost" role="tabpanel" aria-labelledby="hx-tab-cost" className="hx-cost-board">
              <div className="hx-cost-board__hero">
                <article className="hx-cost-summary-card is-primary">
                  <small>{tBoard('cost.estimatedTotal')}</small>
                  <strong>{formatLocaleCurrency(locale, costModel.total)}</strong>
                  <p>{tBoard('cost.title')}</p>
                </article>
                <article className="hx-cost-summary-card">
                  <small>{tBoard('cost.margin')}</small>
                  <strong>{formatLocalePercent(locale, costModel.marginRate)}</strong>
                  <p>{tBoard('cost.marginDetail')}</p>
                </article>
                <article className="hx-cost-summary-card is-success">
                  <small>{tBoard('cost.savings')}</small>
                  <strong>{formatLocalePercent(locale, costModel.savingsRate)}</strong>
                  <p>{tBoard('cost.savingsDetail')}</p>
                </article>
                <article className="hx-cost-summary-card">
                  <small>{tBoard('cost.perTon')}</small>
                  <strong>{formatLocaleCurrency(locale, costModel.costPerTon)}</strong>
                  <p>{tBoard('cost.perTonDetail')}</p>
                </article>
              </div>

              <div className="hx-cost-board__grid">
                <section className="hx-cost-panel">
                  <div className="hx-cost-panel__head">
                    <strong>{tBoard('cost.breakdown')}</strong>
                    <span>{formatLocaleCurrency(locale, costModel.total)}</span>
                  </div>
                  <div className="hx-cost-breakdown">
                    {costModel.breakdown.map((item) => (
                      <article key={item.key} className="hx-cost-breakdown__row">
                        <div className="hx-cost-breakdown__copy">
                          <strong>{tBoard(`cost.${item.key}`)}</strong>
                          <small>{formatLocaleCurrency(locale, item.value)}</small>
                        </div>
                        <div className="hx-cost-breakdown__bar" aria-hidden="true">
                          <i className={item.tone} style={{ width: `${Math.max(10, Math.round(item.share * 100))}%` }} />
                        </div>
                        <span>{formatLocalePercent(locale, item.share, { maximumFractionDigits: 0 })}</span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="hx-cost-panel">
                  <div className="hx-cost-panel__head">
                    <strong>{tBoard('cost.comparison')}</strong>
                    <span>{selectedCargo.co2Saving}</span>
                  </div>
                  <div className="hx-cost-comparison">
                    <article>
                      <small>{tBoard('cost.river')}</small>
                      <strong>{formatLocaleCurrency(locale, costModel.total)}</strong>
                    </article>
                    <article>
                      <small>{tBoard('cost.road')}</small>
                      <strong>{formatLocaleCurrency(locale, costModel.roadEstimate)}</strong>
                    </article>
                    <article>
                      <small>{tBoard('cost.co2Savings')}</small>
                      <strong>{selectedCargo.co2Saving}</strong>
                    </article>
                  </div>
                  <div className="hx-cost-trend" aria-hidden="true">
                    <svg viewBox="0 0 160 64">
                      <polyline points="6,45 26,42 46,38 66,33 86,28 106,24 126,18 154,12" />
                      <path d="M6 55 C28 50 52 48 72 42 C92 36 120 28 154 18 L154 60 L6 60 Z" />
                    </svg>
                  </div>
                </section>
              </div>

              <div className="hx-cost-board__grid">
                <section className="hx-cost-panel">
                  <div className="hx-cost-panel__head">
                    <strong>{tBoard('cost.costTimeline')}</strong>
                    <span>{tBoard('cost.timelineHint')}</span>
                  </div>
                  <div className="hx-cost-milestones">
                    {costModel.timeline.map((step, index) => (
                      <article key={step.key}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{tBoard(`cost.timeline.${step.key}`)}</strong>
                          <i><b style={{ width: `${Math.round(step.progress * 100)}%` }} /></i>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="hx-cost-panel">
                  <div className="hx-cost-panel__head">
                    <strong>{tBoard('cost.alerts')}</strong>
                    <span>{tBoard('cost.alertsHint')}</span>
                  </div>
                  <div className="hx-cost-alerts">
                    {costModel.alerts.map((alert) => (
                      <article key={alert.key} className={alert.tone}>
                        <strong>{tBoard(`cost.${alert.key}`)}</strong>
                        <p>{tBoard(`cost.${alert.detailKey}`)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {activeTab === 'priority' ? (
            <div id="hx-panel-priority" role="tabpanel" aria-labelledby="hx-tab-priority">
              <PriorityTab cargo={selectedCargo} />
            </div>
          ) : null}
        </section>
      </main>

      <aside className="hx-right-rail hr-dashboard-right">
        <article className="hx-rail-card">
          <span><Anchor size={20} /></span>
          <div className="hx-arrival-copy">
            <small>{tBoard('overview.berthForecast')}</small>
            <div className="hx-arrival-inline">
              {arrivalDateTime.dateLabel ? <strong>{arrivalDateTime.dateLabel}</strong> : null}
              {arrivalDateTime.timeLabel ? <span className="hx-arrival-inline__time">{arrivalDateTime.timeLabel}</span> : null}
            </div>
            <p>{arrivalLocation} <b>{tBoard('overview.onSchedule')}</b></p>
          </div>
        </article>
        <article className="hx-rail-card">
          <span><FileText size={20} /></span>
          <div>
            <small>{tCommon('documents')}</small>
            <strong>{docsCount} <em>/ {docsTotal}</em></strong>
            <p>{tBoard('overview.pendingDocuments', { count: pendingDocs })}</p>
            <i className="hx-rail-progress"><b style={{ width: `${documentReadiness}%` }} /></i>
          </div>
        </article>
        <article className="hx-rail-card">
          <span><CircleDollarSign size={20} /></span>
          <div>
            <small>{tBoard('overview.estimatedCost')}</small>
            <strong className="hx-nowrap">{targetPriceLabel}</strong>
            <p>{tBoard('overview.estimatedMargin')}</p>
            <svg viewBox="0 0 120 32" className="hx-mini-chart" aria-hidden="true">
              <path d="M4 24 L20 20 L35 21 L50 16 L64 18 L78 12 L92 14 L116 4" />
            </svg>
          </div>
        </article>
        <article className="hx-rail-card">
          <span><Leaf size={20} /></span>
          <div>
            <small>{tBoard('overview.co2Savings')}</small>
            <strong className="hx-nowrap">{selectedCargo.co2Saving}</strong>
            <p>{tBoard('rightRail.avoidanceCompact')}</p>
            <svg viewBox="0 0 120 32" className="hx-mini-chart is-green" aria-hidden="true">
              <path d="M4 25 L18 27 L30 18 L46 21 L58 13 L72 19 L86 10 L102 13 L116 6" />
            </svg>
          </div>
        </article>
      </aside>

      <BottomSheet
        open={drawerOpen && isMobileViewport}
        onOpenChange={setDrawerOpen}
        title={tBoard('filters.mobileTitle')}
        description={tBoard('filters.mobileDescription')}
        snapPoints={["90vh"]}
      >
        <div className="hx-filter-drawer hx-filter-drawer--mobile" role="region" aria-label={tBoard('filters.advancedRegion')}>
          {filtersPanel}
        </div>
      </BottomSheet>

    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth <= 860);
    updateViewport();

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
      setPickerOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        setPickerOpen(false);
      }
    }

    window.addEventListener('resize', updateViewport);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const entries = ['', ...options];

  return (
    <div className={open ? 'hx-filter-select is-open' : 'hx-filter-select'} ref={rootRef}>
      <span>{label}</span>
      <button
        type="button"
        className="hx-filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isMobileViewport ? pickerOpen : open}
        onClick={() => {
          if (isMobileViewport) {
            setOpen(false);
            setPickerOpen(true);
            return;
          }
          setOpen((current) => !current);
        }}
      >
        <strong>{value || allLabel}</strong>
        <ChevronDown size={18} />
      </button>

      {open && !isMobileViewport ? (
        <div className="hx-filter-select__menu" role="listbox" aria-label={label}>
          {entries.map((optionValue) => {
            const selected = value === optionValue;
            const labelText = optionValue || allLabel;
            return (
              <button
                type="button"
                key={optionValue || '__all'}
                className={selected ? 'hx-filter-select__option is-selected' : 'hx-filter-select__option'}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <span>{labelText}</span>
                {selected ? <Check size={18} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <BottomSheet
        open={pickerOpen && isMobileViewport}
        onOpenChange={setPickerOpen}
        title={label}
        description={allLabel}
        snapPoints={["90vh"]}
      >
        <div className="hx-filter-select__picker" role="listbox" aria-label={label}>
          {entries.map((optionValue) => {
            const selected = value === optionValue;
            const labelText = optionValue || allLabel;
            return (
              <button
                type="button"
                key={optionValue || '__all'}
                className={selected ? 'hx-filter-select__picker-option is-selected' : 'hx-filter-select__picker-option'}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(optionValue);
                  setPickerOpen(false);
                }}
              >
                <span>{labelText}</span>
                {selected ? <Check size={18} /> : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
