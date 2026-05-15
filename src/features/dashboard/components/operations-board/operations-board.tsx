'use client';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Activity,
  AlertCircle,
  Anchor,
  ArrowRight,
  ArrowRightCircle,
  BadgeCheck,
  BadgePercent,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CloudRain,
  Coins,
  FileCheck2,
  FileText,
  FileWarning,
  Info,
  Layers,
  Leaf,
  ListChecks,
  MapPinned,
  MoreVertical,
  Navigation,
  PackageCheck,
  PiggyBank,
  Plus,
  Radar,
  ReceiptText,
  Search,
  ShieldCheck,
  Ship,
  SlidersHorizontal,
  Snowflake,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Wallet,
  Warehouse,
  Waves,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/core/i18n/navigation';
import type { Cargo, CargoStatus, Negotiation, TrackingEvent, Vessel } from '@/features/marketplace/domain/marketplace.types';
import { formatLocaleCurrency, formatLocaleNumber, formatLocalePercent, formatMockBrl } from '@/shared/i18n/mock-format';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { BottomSheet } from '@/shared/ui';
import { PriorityTab } from '@/features/dashboard/components/priority-tab/priority-tab';
import {
  buildTrackingRoute,
  getPointFromLocation
} from '@/features/dashboard/components/operations-board/tracking-map/hydro-route-tracking.helpers';
import {
  HydroRouteTrackingMapHeader,
  HydroRouteTrackingMapLegend,
  HydroRouteTrackingMapSvg
} from '@/features/dashboard/components/operations-board/tracking-map/hydro-route-tracking-map';
import { getVesselVisual } from '@/features/cargo-market/components/cargo-detail/cargo-vessel-visual';
import {
  cargoWaterwayTrackingByCargoId,
  getPrimaryWaterwayConstraint,
  getWaterwayOperationalLabel,
  waterwayCorridorsMock,
} from '@/features/waterway-tracking/waterway-compat';
import type { CargoWaterwayTrackingCompat as CargoWaterwayTracking } from '@/features/waterway-tracking/waterway-compat';
import styles from './operations-board.module.scss';

const PAGE_SIZE = 5;
const MOBILE_INITIAL_VISIBLE_COUNT = 8;
const MOBILE_VISIBLE_INCREMENT = 6;
const MOBILE_VIEWPORT_MAX_WIDTH = 860;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px)`;
const MOBILE_FILTER_SHEET_EXIT_MS = 220;
const MOBILE_FILTER_SHEET_SNAP_POINT: '92vh' = '92vh';
const DEFAULT_MOBILE_FILTER_GROUPS = {
  status: false,
  corridor: false,
  origin: false,
  destination: false,
  type: false,
  document: false,
} as const;

type DashboardTab = 'overview' | 'timeline' | 'documents' | 'cost' | 'priority';
type StatusFilter = 'all' | CargoStatus;
type AdvancedFilters = {
  corridor: string[];
  origin: string[];
  destination: string[];
  type: string[];
  document: string[];
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

type CargoListCardProps = {
  arrivalLabel: string;
  cargo: Cargo;
  confidenceLabel: string;
  etaLabel: string;
  isSelected: boolean;
  onClick: () => void;
  showMenu: boolean;
  statusLabel: string;
  vesselLabel: string;
  waterwayTracking?: CargoWaterwayTracking;
};

type MobileFilterOption = {
  label: string;
  value: string;
};

type MobileFilterGroupKey = keyof typeof DEFAULT_MOBILE_FILTER_GROUPS;

type MobileFilterGroupProps = {
  title: string;
  options: MobileFilterOption[];
  selectedValues: string[];
  expanded: boolean;
  onToggle: (value: string) => void;
  onExpandToggle: () => void;
};

function createDefaultAdvancedFilters(): AdvancedFilters {
  return {
    corridor: [],
    origin: [],
    destination: [],
    type: [],
    document: [],
  };
}

const emptyFilters: AdvancedFilters = createDefaultAdvancedFilters();

const tabs: Array<{ key: DashboardTab; labelKey: string }> = [
  { key: 'overview', labelKey: 'tabs.overview' },
  { key: 'timeline', labelKey: 'tabs.timeline' },
  { key: 'documents', labelKey: 'tabs.documents' },
  { key: 'cost', labelKey: 'tabs.cost' },
  { key: 'priority', labelKey: 'tabs.priority' }
];

type OverviewVesselVisual = ReturnType<typeof getVesselVisual>;

const DEFAULT_OVERVIEW_VESSEL_IMAGE = '/mock/vessels/cargo-vessel-real-water-01.webp';

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function getActiveCargoFiltersCount(query: string, statusFilter: StatusFilter, filters: AdvancedFilters) {
  return [
    query.trim() ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    filters.corridor.length,
    filters.origin.length,
    filters.destination.length,
    filters.type.length,
    filters.document.length,
  ].reduce((total, value) => total + value, 0);
}

function hasAppliedCargoFilters(query: string, statusFilter: StatusFilter, filters: AdvancedFilters) {
  return getActiveCargoFiltersCount(query, statusFilter, filters) > 0;
}

function renderMobileFilterGroup(
  title: string,
  options: MobileFilterOption[],
  selectedValues: string[],
  onToggle: (value: string) => void,
  controlClassName: string,
  expanded: boolean,
  onExpandToggle: () => void
) {
  if (!options.length) {
    return null;
  }

  return (
    <section className={styles.mobileFilterGroup} aria-label={title}>
      <button
        type="button"
        className={styles.mobileFilterGroupToggle}
        aria-expanded={expanded}
        onClick={onExpandToggle}
      >
        <span className={styles.mobileFilterGroupHeader}>
          <strong className={styles.mobileFilterGroupTitle}>{title}</strong>
          <span className={styles.mobileFilterGroupCount}>
            {selectedValues.length > 0 ? selectedValues.length : options.length}
          </span>
        </span>
        <ChevronDown
          className={cx(
            styles.mobileFilterGroupChevron,
            expanded && styles.mobileFilterGroupChevronExpanded
          )}
          size={18}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className={styles.mobileFilterChips} role="group" aria-label={title}>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                className={cx(
                  styles.mobileFilterOption,
                  isSelected && styles.mobileFilterOptionSelected
                )}
                aria-pressed={isSelected}
                onClick={() => onToggle(option.value)}
              >
                <span className={cx(styles.mobileFilterOptionMark, controlClassName)} aria-hidden="true">
                  <span className={styles.mobileFilterOptionMarkInner} />
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function MobileSingleFilterGroup({ title, options, selectedValues, expanded, onToggle, onExpandToggle }: MobileFilterGroupProps) {
  return renderMobileFilterGroup(title, options, selectedValues, onToggle, styles.mobileFilterOptionRadio, expanded, onExpandToggle);
}

function MobileMultiFilterGroup({ title, options, selectedValues, expanded, onToggle, onExpandToggle }: MobileFilterGroupProps) {
  return renderMobileFilterGroup(title, options, selectedValues, onToggle, styles.mobileFilterOptionCheckbox, expanded, onExpandToggle);
}

function overviewStatusClass(status: CargoStatus) {
  return cx(styles.overviewStatus, styles[`overviewStatus_${status}`]);
}

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

function CargoListCard({
  arrivalLabel,
  cargo,
  confidenceLabel,
  etaLabel,
  isSelected,
  onClick,
  showMenu,
  statusLabel,
  vesselLabel,
  waterwayTracking,
}: CargoListCardProps) {
  const progress = getCargoProgressPercent(cargo);
  const statusTone = cargo.status;
  const waterwayCorridor = waterwayTracking
    ? waterwayCorridorsMock.find((corridor) => corridor.id === waterwayTracking.corridorId)
    : undefined;
  const primaryWaterwayConstraint = getPrimaryWaterwayConstraint(waterwayTracking);
  const waterwayStatusLabel = waterwayTracking
    ? getWaterwayOperationalLabel(waterwayTracking.operationalStatus)
    : '';
  const waterwayRiskTone = primaryWaterwayConstraint?.severity ?? 'info';

  return (
    <button
      type="button"
      key={cargo.id}
      className={`hr-cargo-card ${isSelected ? 'is-selected' : ''}`}
      data-cargo-id={cargo.id}
      data-cargo-label={cargo.title}
      aria-label={`${cargo.id.toUpperCase()} ${cargo.title}`}
      onClick={onClick}
    >
      <div className="hr-cargo-card__header">
        <strong className="hr-cargo-card__code">{cargo.id.toUpperCase()}</strong>

        <div className="hr-cargo-card__actions">
          <span className={`hr-status-badge hr-status-badge--${statusTone}`}>
            {statusLabel}
          </span>
          {showMenu ? <MoreVertical size={18} className="hr-cargo-card__menu" /> : null}
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
        <span>{vesselLabel}</span>
      </div>

      {waterwayTracking ? (
        <div className="hr-cargo-card__waterway">
          <span className="hr-cargo-card__waterwayCorridor">
            <Waves size={14} aria-hidden="true" />
            <span>{waterwayCorridor?.name ?? waterwayTracking.originTerminal}</span>
          </span>

          <span className={`hr-cargo-card__waterwayRisk hr-cargo-card__waterwayRisk--${waterwayRiskTone}`}>
            {primaryWaterwayConstraint?.title ?? waterwayStatusLabel}
          </span>
        </div>
      ) : null}

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
          <span>{arrivalLabel}</span>
        ) : null}
      </div>
    </button>
  );
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function timelineStatusGlyph(status: TrackingEvent['status']) {
  if (status === 'done') return <CheckCircle2 size={15} strokeWidth={2.25} aria-hidden />;
  if (status === 'current') return <Activity size={15} strokeWidth={2.25} aria-hidden />;
  return <ArrowRightCircle size={15} strokeWidth={2.25} aria-hidden />;
}

function getTimelineIcon(event: TrackingEvent, index: number, iconSize = 22) {
  const source = getTimelineSource(event);

  if (event.kind === 'cargo_created' || source.includes('carga criada') || source.includes('coleta') || source.includes('lote')) {
    return <PackageCheck size={iconSize} />;
  }
  if (event.kind === 'documentation_pending' || source.includes('document') || source.includes('nota') || source.includes('romaneio')) {
    return <FileCheck2 size={iconSize} />;
  }
  if (event.kind === 'shipment_confirmed' || source.includes('janela') || source.includes('embarque') || source.includes('reserva')) {
    return <CalendarCheck size={iconSize} />;
  }
  if (event.kind === 'in_transit' || source.includes('transito') || source.includes('embarc') || source.includes('rota') || source.includes('rio')) {
    return <Radar size={iconSize} />;
  }
  if (event.kind === 'delivered' || source.includes('porto') || source.includes('atrac') || source.includes('destino')) {
    return <MapPinned size={iconSize} />;
  }

  return event.status === 'done' ? <Check size={iconSize} /> : index === 0 ? <Clock3 size={iconSize} /> : <Circle size={Math.max(14, iconSize - 6)} />;
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
  const svgUid = useId().replace(/:/g, '');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [layerMode, setLayerMode] = useState<'all' | 'route' | 'network'>('all');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<null | { name: string; point: { x: number; y: number }; note: string; category: string; tone?: string }>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1000, height: 470 });
  const dragState = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const modalViewportRef = useRef<HTMLDivElement | null>(null);

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
      const el = expanded ? modalViewportRef.current : viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
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

  const trackingRoute = useMemo(() => buildTrackingRoute(cargo), [cargo]);
  const progress01 = trackingRoute.progress / 100;
  const mainRiver = trackingRoute.river;
  const inTransitCount = Math.max(1, Math.round(progress01 * 18));
  const operationCount = Math.max(1, Math.round((1 - progress01) * 10));
  const layerLabel = layerMode === 'all' ? tBoard('map.layers.all') : layerMode === 'route' ? tBoard('map.layers.route') : tBoard('map.layers.network');

  const pointsOfInterest: Array<{ name: string; point: { x: number; y: number }; note: string; category: string; role?: 'state'; tone?: string }> = [
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

  const overlayPosition = (point: { x: number; y: number }, offsetX: number, offsetY: number) => ({
    left: `${clamp(point.x / 10 + offsetX, 1.4, 96.2)}%`,
    top: `${clamp(point.y / 4.7 + offsetY, 3, 93)}%`
  });

  const tooltipPosition = (point: { x: number; y: number }) => {
    const xPercent = point.x / 10;
    const yPercent = point.y / 4.7;
    const offsetX = xPercent > 80 ? -17.5 : xPercent < 18 ? 1.8 : -6.8;
    const offsetY = yPercent < 20 ? 2.4 : -8.1;
    return overlayPosition(point, offsetX, offsetY);
  };

  const shortOrigin = cargo.origin.split(',')[0];
  const shortDestination = cargo.destination.split(',')[0];
  const showNetwork = layerMode !== 'route';
  const showRoute = layerMode !== 'network';
  const showLabels = layerMode !== 'route';
  const routeEndpointNames = new Set([shortOrigin, shortDestination]);
  const labelItems = pointsOfInterest.filter((item) => !routeEndpointNames.has(item.name));
  const isCompactViewport = viewportSize.width <= 900;
  const routeSummaryStatus = getCargoStatusLabel(cargo.status, tCommon);

  const renderViewport = (mode: 'card' | 'modal') => {
    const isModal = mode === 'modal';
    const idSuffix = `${svgUid}-${mode}`;

    return (
      <div
        ref={isModal ? modalViewportRef : viewportRef}
        className={cx(
          styles.hydroRadarViewport,
          isModal && styles.hydroRadarViewportModal,
          isCompactViewport && styles.hydroRadarViewportCompact
        )}
      >
        <div className={styles.hydroRadarTopBar}>
          <div className={styles.hydroRadarStats}>
            <article className={styles.hydroRadarStat}>
              <Ship size={16} strokeWidth={2} aria-hidden />
              <span>{tBoard('map.inTransitCargoes')}</span>
              <strong>{inTransitCount}</strong>
            </article>
            <article className={styles.hydroRadarStat}>
              <Snowflake size={16} strokeWidth={2} aria-hidden />
              <span>{tBoard('map.inOperation')}</span>
              <strong>{operationCount}</strong>
            </article>
          </div>

          <div className={styles.hydroRadarTools}>
            <button
              type="button"
              className={styles.hydroRadarToolBtn}
              onClick={cycleLayers}
              title={tBoard('map.toggleLayers', { layer: layerLabel })}
            >
              <Layers size={18} strokeWidth={2} aria-hidden />
              <span>{tCommon('filter')}</span>
            </button>
            <button
              type="button"
              className={styles.hydroRadarIconBtn}
              aria-label={isModal ? tBoard('map.closeExpanded') : tBoard('map.expand')}
              onClick={toggleExpandedMap}
            >
              {isModal ? <X size={18} strokeWidth={2} /> : <Navigation size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <HydroRouteTrackingMapHeader route={trackingRoute} />

        <div className={styles.hydroRadarMapShell}>
          <div
            className={cx(
              styles.hydroRadarScene,
              zoomLevel > 1 && styles.hydroRadarSceneDraggable,
              isDragging && styles.hydroRadarSceneDragging
            )}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
          >
            <div className={styles.hydroRadarMapInner}>
              <HydroRouteTrackingMapSvg
                route={trackingRoute}
                layerMode={layerMode}
                poiGradientId={`${idSuffix}-dot`}
                svgDecoration={
                  <>
                    {showLabels ? (
                      <g className={styles.hydroRadarCityDots}>
                        {pointsOfInterest.map((item) => (
                          <g key={item.name} className={styles.hydroRadarCityDot}>
                            <circle cx={item.point.x} cy={item.point.y} r={item.role === 'state' ? 5.2 : 5} fill={`url(#${idSuffix}-dot)`} />
                            <circle cx={item.point.x} cy={item.point.y} r={item.role === 'state' ? 1.6 : 2} className={styles.hydroRadarCityDotCore} />
                          </g>
                        ))}
                      </g>
                    ) : null}
                    {showLabels
                      ? labelItems.map((item) => {
                        const placement = MAP_LABEL_POSITIONS[item.name] || { dx: 8, dy: item.role === 'state' ? -8 : -10, anchor: 'start' as const };
                        return (
                          <text
                            key={`label-${item.name}`}
                            x={item.point.x + placement.dx}
                            y={item.point.y + placement.dy}
                            textAnchor={placement.anchor}
                            className={cx(styles.hydroRadarMapLabel, item.role === 'state' && styles.hydroRadarMapLabelState)}
                          >
                            {item.name}
                          </text>
                        );
                      })
                      : null}
                  </>
                }
              >
                <div className={styles.hydroRadarOverlayLayer}>
                  {showLabels
                    ? pointsOfInterest.map((item) => (
                      <button
                        key={`poi-${item.name}`}
                        type="button"
                        className={styles.hydroRadarPoiHotspot}
                        style={overlayPosition(item.point, -1.35, -2.05)}
                        onPointerEnter={() => setHoveredPlace(item)}
                        onPointerMove={() => setHoveredPlace(item)}
                        onFocus={() => setHoveredPlace(item)}
                        onPointerLeave={() => setHoveredPlace((current) => (current?.name === item.name ? null : current))}
                        onBlur={() => setHoveredPlace((current) => (current?.name === item.name ? null : current))}
                        aria-label={`${item.name}: ${item.note}`}
                      />
                    ))
                    : null}
                  {hoveredPlace ? (
                    <div className={styles.hydroRadarTooltip} style={tooltipPosition(hoveredPlace.point)}>
                      <small>{hoveredPlace.category}</small>
                      <strong>{hoveredPlace.name}</strong>
                      <span>{hoveredPlace.note}</span>
                    </div>
                  ) : null}
                </div>
              </HydroRouteTrackingMapSvg>
            </div>
          </div>

          <div className={styles.hydroRadarZoomRail}>
            <button type="button" className={styles.hydroRadarZoomBtn} aria-label={tBoard('map.zoomIn')} onClick={() => changeZoom(0.18)}>
              +
            </button>
            <button type="button" className={styles.hydroRadarZoomBtn} aria-label={tBoard('map.zoomOut')} onClick={() => changeZoom(-0.18)}>
              −
            </button>
            <button type="button" className={styles.hydroRadarZoomBtn} aria-label={tBoard('map.resetView')} onClick={resetView}>
              ⌾
            </button>
          </div>
        </div>

        <HydroRouteTrackingMapLegend />

        <div className={styles.hydroRadarFooter}>
          <span>{tBoard('map.statusSummary', { river: mainRiver, status: routeSummaryStatus, layer: layerLabel, zoom: Math.round(zoomLevel * 100) })}</span>
        </div>

        {isModal ? (
          <div className={styles.hydroRadarFullscreenHint} aria-live="polite">
            <span>{tBoard('map.rotateHint')}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <section className={cx(styles.hydroRadarSection, expanded && styles.hydroRadarSectionExpanded)} aria-label={tBoard('map.radarSectionAria')}>
        {renderViewport('card')}
      </section>

      {expanded ? (
        <div className={styles.hydroRadarBackdrop} role="dialog" aria-modal="true" aria-label={tBoard('map.expanded')} onClick={closeExpandedMap}>
          <div className={styles.hydroRadarModal} onClick={(event) => event.stopPropagation()}>
            {renderViewport('modal')}
          </div>
        </div>
      ) : null}
    </>
  );
}


type DocumentRequirement = NonNullable<Cargo['requiredDocuments']>[number];

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

type DocumentVisualKind = 'nfe' | 'cte' | 'romaneio' | 'laudo' | 'generic';

function normalizeDocumentNameKey(name: string) {
  return name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function getDocumentVisualKind(name: string): DocumentVisualKind {
  const n = normalizeDocumentNameKey(name);
  if (n.includes('nf-e') || /\bnfe\b/.test(n) || n.includes('nota fiscal')) return 'nfe';
  if (n.includes('ct-e') || /\bcte\b/.test(n) || n.includes('conhecimento')) return 'cte';
  if (n.includes('romaneio')) return 'romaneio';
  if (n.includes('laudo') || n.includes('sanit')) return 'laudo';
  return 'generic';
}

function getDocumentStatusChip(status: DocumentRequirement['status'] | undefined, tBoard: BoardTranslator) {
  if (status === 'ok') return tBoard('documents.statusChip.ok');
  if (status === 'conditional') return tBoard('documents.statusChip.conditional');
  if (status === 'nextPhase') return tBoard('documents.statusChip.nextPhase');
  return tBoard('documents.statusChip.required');
}

function renderDocumentCardIcon(name: string, size = 24) {
  const kind = getDocumentVisualKind(name);
  const stroke = 2;
  switch (kind) {
    case 'nfe':
      return <ReceiptText size={size} strokeWidth={stroke} aria-hidden />;
    case 'cte':
      return <Truck size={size} strokeWidth={stroke} aria-hidden />;
    case 'romaneio':
      return <ListChecks size={size} strokeWidth={stroke} aria-hidden />;
    case 'laudo':
      return <ShieldCheck size={size} strokeWidth={stroke} aria-hidden />;
    default:
      return <FileCheck2 size={size} strokeWidth={stroke} aria-hidden />;
  }
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

type CostModel = ReturnType<typeof buildCostModel>;

function getCostDominantBreakdown(costModel: CostModel) {
  return costModel.breakdown.reduce((best, row) => (row.share > best.share ? row : best));
}

function getCostTimelineActiveIndex(progress: number) {
  if (progress <= 24) return 0;
  if (progress <= 48) return 1;
  if (progress <= 76) return 2;
  return 3;
}

function renderCostBreakdownIcon(key: string) {
  const size = 18;
  const stroke = 2;
  switch (key) {
    case 'riverTransport':
      return <Ship size={size} strokeWidth={stroke} aria-hidden />;
    case 'documentation':
      return <FileText size={size} strokeWidth={stroke} aria-hidden />;
    case 'insurance':
      return <Snowflake size={size} strokeWidth={stroke} aria-hidden />;
    case 'portOperation':
      return <Warehouse size={size} strokeWidth={stroke} aria-hidden />;
    case 'contingency':
      return <PiggyBank size={size} strokeWidth={stroke} aria-hidden />;
    default:
      return <CircleDollarSign size={size} strokeWidth={stroke} aria-hidden />;
  }
}

function renderCostTimelineIcon(stepKey: string) {
  const size = 17;
  const stroke = 2;
  switch (stepKey) {
    case 'quote':
      return <Search size={size} strokeWidth={stroke} aria-hidden />;
    case 'reserve':
      return <CalendarCheck size={size} strokeWidth={stroke} aria-hidden />;
    case 'operation':
      return <Ship size={size} strokeWidth={stroke} aria-hidden />;
    case 'delivery':
      return <PackageCheck size={size} strokeWidth={stroke} aria-hidden />;
    default:
      return <Activity size={size} strokeWidth={stroke} aria-hidden />;
  }
}

function renderCostAlertIcon(alertKey: string) {
  switch (alertKey) {
    case 'healthyMargin':
      return <BadgeCheck size={20} strokeWidth={2.1} aria-hidden />;
    case 'seasonalityRisk':
      return <CloudRain size={20} strokeWidth={2.1} aria-hidden />;
    case 'documentImpact':
      return <FileWarning size={20} strokeWidth={2.1} aria-hidden />;
    default:
      return <ShieldCheck size={20} strokeWidth={2.1} aria-hidden />;
  }
}

function CostSimulationChart({
  costModel,
  tBoard,
  locale,
  co2Label
}: {
  costModel: CostModel;
  tBoard: BoardTranslator;
  locale: string;
  co2Label: string;
}) {
  const gid = useId().replace(/:/g, '');
  const road = Math.max(1, costModel.roadEstimate);
  const river = costModel.total;
  const ratio = river / road;
  const savingsAbs = Math.max(0, road - river);
  const savingsPct = road > 0 ? savingsAbs / road : 0;

  const riverFmt = formatLocaleCurrency(locale, river);
  const roadFmt = formatLocaleCurrency(locale, road);
  const diffFmt = formatLocaleCurrency(locale, savingsAbs);
  const pctFmt = formatLocalePercent(locale, savingsPct, { maximumFractionDigits: 0 });

  const vbW = 720;
  const vbH = 260;
  const padL = 44;
  const padR = 20;
  const padT = 44;
  const padB = 68;
  const innerW = vbW - padL - padR;
  const innerH = vbH - padT - padB;

  const n = 9;
  const xs: number[] = [];
  const yRiver: number[] = [];
  const yRoad: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = padL + t * innerW;
    xs.push(x);
    yRiver.push(padT + 38 + t * innerH * 0.56 + (1 - ratio) * 44);
    yRoad.push(padT + 22 + t * innerH * 0.66 + (1 - ratio) * 26);
  }

  const lineToPath = (ys: number[]) => xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(' ');
  const riverD = lineToPath(yRiver);
  const roadD = lineToPath(yRoad);

  let economyD = `${roadD}`;
  for (let i = n - 1; i >= 0; i--) {
    economyD += ` L ${xs[i].toFixed(2)} ${yRiver[i].toFixed(2)}`;
  }
  economyD += ' Z';

  const stageXs = [0, 1, 2, 3].map((k) => padL + (k / 3) * innerW);
  const stageKeys = ['quote', 'reserve', 'operation', 'delivery'] as const;

  return (
    <figure className={styles.costSimPremium} aria-label={tBoard('cost.chart.aria')}>
      <header className={styles.costSimPremium__head}>
        <div className={styles.costSimPremium__headText}>
          <h3 id="hx-cost-chart-title" className={styles.costSimPremium__title}>
            {tBoard('cost.chart.title')}
          </h3>
          <p className={styles.costSimPremium__subtitle}>{tBoard('cost.chart.subtitle')}</p>
        </div>
        <span className={styles.costSimPremium__badge}>{tBoard('cost.chart.badgeSavings', { pct: pctFmt })}</span>
      </header>

      <div className={styles.costSimPremium__body}>
        <div className={styles.costSimPremium__svgWrap}>
          <svg
            className={styles.costSimPremium__svg}
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <linearGradient id={`${gid}-economy`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(116, 243, 107, 0.42)" />
                <stop offset="55%" stopColor="rgba(47, 224, 208, 0.22)" />
                <stop offset="100%" stopColor="rgba(47, 224, 208, 0.04)" />
              </linearGradient>
              <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width={vbW} height={vbH} rx="14" className={styles.costSimPremium__frame} />

            {[0, 0.25, 0.5, 0.75, 1].map((g) => {
              const y = padT + g * innerH;
              return <line key={g} className={styles.costSimPremium__gridH} x1={padL} x2={vbW - padR} y1={y} y2={y} />;
            })}

            {stageXs.map((sx) => (
              <line key={sx} className={styles.costSimPremium__gridV} x1={sx} x2={sx} y1={padT} y2={padT + innerH} />
            ))}

            <path d={economyD} fill={`url(#${gid}-economy)`} className={styles.costSimPremium__economyArea} />

            <path
              d={roadD}
              fill="none"
              className={styles.costSimPremium__lineRoad}
            />
            <path
              d={riverD}
              fill="none"
              className={styles.costSimPremium__lineRiver}
              pathLength={100}
              filter={`url(#${gid}-glow)`}
            />

            <circle cx={xs[n - 1]} cy={yRiver[n - 1]} r="6" className={styles.costSimPremium__dotRiver} />
            <circle cx={xs[n - 1]} cy={yRoad[n - 1]} r="5.5" className={styles.costSimPremium__dotRoad} />

            <text
              x={vbW - padR}
              y={yRiver[n - 1] + 5}
              textAnchor="end"
              className={styles.costSimPremium__endLabelRiver}
            >
              {riverFmt}
            </text>
            <text
              x={vbW - padR}
              y={yRoad[n - 1] - 10}
              textAnchor="end"
              className={styles.costSimPremium__endLabelRoad}
            >
              {roadFmt}
            </text>

            {stageXs.map((sx, k) => (
              <text key={stageKeys[k]} x={sx} y={vbH - 22} textAnchor="middle" className={styles.costSimPremium__axisLabel}>
                {tBoard(`cost.timeline.${stageKeys[k]}`)}
              </text>
            ))}
          </svg>

          <div className={styles.costSimPremium__floatCard} role="note">
            <strong className={styles.costSimPremium__floatTitle}>{tBoard('cost.chart.floatTitle')}</strong>
            <div className={styles.costSimPremium__floatRow}>
              <span className={styles.costSimPremium__swatchRiver} aria-hidden />
              <span>{tBoard('cost.chart.floatRiver', { value: riverFmt })}</span>
            </div>
            <div className={styles.costSimPremium__floatRow}>
              <span className={styles.costSimPremium__swatchRoad} aria-hidden />
              <span>{tBoard('cost.chart.floatRoad', { value: roadFmt })}</span>
            </div>
            <div className={styles.costSimPremium__floatRow}>
              <span className={styles.costSimPremium__swatchDiff} aria-hidden />
              <span className={styles.costSimPremium__floatDiff}>{tBoard('cost.chart.floatDiff', { value: diffFmt })}</span>
            </div>
          </div>
        </div>

        <div className={styles.costSimPremium__chips} role="group" aria-label={tBoard('cost.chart.floatTitle')}>
          <span className={styles.costSimPremium__chip}>
            <Ship size={13} strokeWidth={2} aria-hidden />
            {tBoard('cost.chart.chipRiver', { value: riverFmt })}
          </span>
          <span className={styles.costSimPremium__chip}>
            <Truck size={13} strokeWidth={2} aria-hidden />
            {tBoard('cost.chart.chipRoad', { value: roadFmt })}
          </span>
          <span className={cx(styles.costSimPremium__chip, styles.costSimPremium__chipSavings)}>
            <BadgePercent size={13} strokeWidth={2} aria-hidden />
            {tBoard('cost.chart.chipSavings', { value: diffFmt })}
          </span>
        </div>

        <div className={styles.costSimPremium__insight}>
          <span className={styles.costSimPremium__insightIcon} aria-hidden>
            <Leaf size={18} strokeWidth={2} />
          </span>
          <div>
            <strong>{tBoard('cost.chart.insightTitle')}</strong>
            <p>{tBoard('cost.chart.insightBody', { co2: co2Label })}</p>
          </div>
        </div>
      </div>

      <figcaption className={styles.costSimPremium__srOnly}>{tBoard('cost.chart.caption')}</figcaption>
    </figure>
  );
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
  const prefersReducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileFilterClosing, setIsMobileFilterClosing] = useState(false);
  const [expandedMobileFilterGroups, setExpandedMobileFilterGroups] = useState<Record<MobileFilterGroupKey, boolean>>(DEFAULT_MOBILE_FILTER_GROUPS);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [expandedTimelineEventId, setExpandedTimelineEventId] = useState<string | null>(null);
  const [expandedDocumentName, setExpandedDocumentName] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(cargoes[0]?.id ?? '');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(() => MOBILE_INITIAL_VISIBLE_COUNT);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const mobileListSentinelRef = useRef<HTMLDivElement | null>(null);
  const mobileFilterCloseTimerRef = useRef<number | null>(null);
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
        && (!advancedFilters.corridor.length || advancedFilters.corridor.includes(cargo.corridor ?? '') || advancedFilters.corridor.includes(cargo.mainRiver ?? ''))
        && (!advancedFilters.origin.length || advancedFilters.origin.includes(cargo.origin))
        && (!advancedFilters.destination.length || advancedFilters.destination.includes(cargo.destination))
        && (!advancedFilters.type.length || advancedFilters.type.includes(cargo.cargoType))
        && (!advancedFilters.document.length || advancedFilters.document.some((documentName) => docs.includes(documentName)));
    });
  }, [advancedFilters, query, statusFilter, visualCargoes]);

  const totalPages = Math.max(1, Math.ceil(filteredCargoes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageItems = filteredCargoes.slice(pageStart, pageEnd);
  const visibleMobileCargoes = filteredCargoes.slice(0, mobileVisibleCount);
  const hasMoreMobileCargoes = mobileVisibleCount < filteredCargoes.length;

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
  const timelineCurrentIndex = timelineItems.findIndex((event) => event.status === 'current');
  const timelineNextEvent =
    timelineCurrentIndex >= 0 && timelineCurrentIndex < timelineItems.length - 1
      ? timelineItems[timelineCurrentIndex + 1]
      : null;
  const selectedProgress = selectedCargo ? statusProgress(selectedCargo.status) : 0;
  const selectedDocumentItems = selectedCargo ? buildDocumentItems(selectedCargo, tBoard) : [];
  const docsReadyCount = selectedDocumentItems.filter((d) => d.status === 'ok').length;
  const arrivalEvent = getArrivalEvent(timelineItems);

  const docsCount = selectedCargo?.requiredDocuments?.length ?? selectedCargo?.documents?.length ?? 13;
  const docsTotal = Math.max(18, docsCount + 5);
  const documentReadiness = selectedCargo?.documentReadiness ?? Math.min(100, Math.round((docsCount / docsTotal) * 100));
  const pendingDocs = Math.max(0, docsTotal - docsCount);
  const activeFilters = getActiveCargoFiltersCount(query, statusFilter, advancedFilters);
  const hasAppliedFilters = hasAppliedCargoFilters(query, statusFilter, advancedFilters);
  const statusOptions = useMemo<MobileFilterOption[]>(() => ([
    { value: 'all', label: tBoard('statusFilters.all') },
    { value: 'open', label: tBoard('statusFilters.open') },
    { value: 'bidding', label: tBoard('statusFilters.bidding') },
    { value: 'contracting', label: tBoard('statusFilters.contracting') },
    { value: 'reserved', label: tBoard('statusFilters.reserved') },
    { value: 'boarded', label: tBoard('statusFilters.boarded') },
  ]), [tBoard]);

  function syncListViewport() {
    setCurrentPage(1);
    setMobileVisibleCount(MOBILE_INITIAL_VISIBLE_COUNT);
    listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function resetFilters() {
    setQuery('');
    setStatusFilter('all');
    setAdvancedFilters(createDefaultAdvancedFilters());
    syncListViewport();
  }

  function handleStatusFilterChange(nextStatus: StatusFilter) {
    syncListViewport();
    setStatusFilter(nextStatus);
  }

  function updateDesktopFilter(key: keyof AdvancedFilters, value: string) {
    syncListViewport();
    setAdvancedFilters((current) => ({
      ...current,
      [key]: value ? [value] : [],
    }));
  }

  function toggleMobileFilter(key: keyof AdvancedFilters, value: string, selection: 'multi' | 'single') {
    syncListViewport();
    setAdvancedFilters((current) => {
      const currentValues = current[key];

      if (selection === 'single') {
        return {
          ...current,
          [key]: currentValues.includes(value) ? [] : [value],
        };
      }

      return {
        ...current,
        [key]: currentValues.includes(value)
          ? currentValues.filter((currentValue) => currentValue !== value)
          : [...currentValues, value],
      };
    });
  }

  function goToPage(nextPage: number) {
    const targetPage = Math.max(1, Math.min(totalPages, nextPage));
    setCurrentPage(targetPage);
    listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();

    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || !hasMoreMobileCargoes || !mobileListSentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (!entry?.isIntersecting) {
        return;
      }

      setMobileVisibleCount((current) =>
        Math.min(filteredCargoes.length, current + MOBILE_VISIBLE_INCREMENT)
      );
    }, {
      root: null,
      rootMargin: '0px 0px 240px 0px',
      threshold: 0.1,
    });

    observer.observe(mobileListSentinelRef.current);
    return () => observer.disconnect();
  }, [filteredCargoes.length, hasMoreMobileCargoes, isMobileViewport]);

  useEffect(() => {
    return () => {
      if (mobileFilterCloseTimerRef.current !== null) {
        window.clearTimeout(mobileFilterCloseTimerRef.current);
      }
    };
  }, []);

  if (!selectedCargo) {
    return (
      <section className={isMobileViewport ? styles.mobileBoard : 'hx-dashboard hr-dashboard-grid'}>
        <div className={styles.emptyState} role="status">
          <AlertCircle size={22} aria-hidden="true" />
          <h3>{tBoard('list.emptyTitle')}</h3>
          <p>{tBoard('list.emptyDescription')}</p>
        </div>
      </section>
    );
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
  const costSavingsAbs = Math.max(0, costModel.roadEstimate - costModel.total);
  const costSavingsPct = costModel.roadEstimate > 0 ? costSavingsAbs / costModel.roadEstimate : 0;
  const dominantCostRow = getCostDominantBreakdown(costModel);
  const costTimelineActiveIndex = getCostTimelineActiveIndex(selectedProgress);
  const renderCargoCard = (cargo: Cargo) => {
    const isSelected = cargo.id === selectedCargo.id;
    const { etaLabel, confidenceLabel } = parseEtaMeta(cargo.etaConfidence, tBoard, tCommon);

    return (
      <CargoListCard
        key={cargo.id}
        arrivalLabel={cargo.window ? tBoard('misc.arrivalLabel', { value: cargo.window }) : ''}
        cargo={cargo}
        confidenceLabel={confidenceLabel}
        etaLabel={etaLabel}
        isSelected={isSelected}
        onClick={() => {
          setSelectedId(cargo.id);
          setExpandedTimelineEventId(null);
          setExpandedDocumentName(null);
        }}
        showMenu={!isMobileViewport}
        statusLabel={getCargoStatusLabel(cargo.status, tCommon)}
        vesselLabel={vesselName(cargo, negotiations, vessels)}
        waterwayTracking={cargoWaterwayTrackingByCargoId.get(cargo.id)}
      />
    );
  };

  function openMobileFilterSheet() {
    if (mobileFilterCloseTimerRef.current !== null) {
      window.clearTimeout(mobileFilterCloseTimerRef.current);
      mobileFilterCloseTimerRef.current = null;
    }

    setIsMobileFilterClosing(false);
    setDrawerOpen(true);
  }

  function closeMobileFilterSheet() {
    if (!drawerOpen || isMobileFilterClosing) {
      return;
    }

    setIsMobileFilterClosing(true);
    mobileFilterCloseTimerRef.current = window.setTimeout(() => {
      setDrawerOpen(false);
      setIsMobileFilterClosing(false);
      mobileFilterCloseTimerRef.current = null;
    }, MOBILE_FILTER_SHEET_EXIT_MS);
  }

  function handleMobileFilterSheetOpenChange(open: boolean) {
    if (open) {
      openMobileFilterSheet();
      return;
    }

    closeMobileFilterSheet();
  }

  function toggleMobileFilterGroup(group: MobileFilterGroupKey) {
    setExpandedMobileFilterGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }



  const filtersPanel = (
    <>
      {!isMobileViewport ? (
        <div className="hx-drawer-head">
          <div><small>{tBoard('filters.eyebrow')}</small><h2>{tBoard('filters.title')}</h2></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label={tBoard('filters.close')}>
            <X size={18} />
          </button>
        </div>
      ) : null}
      {!isMobileViewport ? (
        <div className="hx-drawer-count">
          <strong>{tBoard('filters.results', { count: filteredCargoes.length })}</strong>
          <span>{activeFilters ? tBoard('filters.activeCount', { count: activeFilters }) : tBoard('filters.inactive')}</span>
        </div>
      ) : null}
      <div className="hx-filter-grid">
        <FilterSelect label={tBoard('filters.corridor')} value={advancedFilters.corridor[0] ?? ''} options={options.corridor} onChange={(value) => updateDesktopFilter('corridor', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.origin')} value={advancedFilters.origin[0] ?? ''} options={options.origin} onChange={(value) => updateDesktopFilter('origin', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.destination')} value={advancedFilters.destination[0] ?? ''} options={options.destination} onChange={(value) => updateDesktopFilter('destination', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.cargoType')} value={advancedFilters.type[0] ?? ''} options={options.type} onChange={(value) => updateDesktopFilter('type', value)} allLabel={tBoard('filters.allOptions')} />
        <FilterSelect label={tBoard('filters.document')} value={advancedFilters.document[0] ?? ''} options={options.document} onChange={(value) => updateDesktopFilter('document', value)} allLabel={tBoard('filters.allOptions')} />
      </div>
    </>
  );
  const mobileFiltersPanel = (
    <div className={styles.mobileFiltersPanel}>
      <div className={styles.mobileFiltersMeta}>
        <span>{tBoard('filters.results', { count: filteredCargoes.length })}</span>
        <span aria-hidden="true">·</span>
        <span>{tBoard('filters.activeCount', { count: activeFilters })}</span>
      </div>

      <MobileSingleFilterGroup
        title={tBoard('filters.status')}
        options={statusOptions}
        selectedValues={[statusFilter]}
        expanded={expandedMobileFilterGroups.status}
        onToggle={(value) => handleStatusFilterChange(statusFilter === value ? 'all' : (value as StatusFilter))}
        onExpandToggle={() => toggleMobileFilterGroup('status')}
      />

      <MobileSingleFilterGroup
        title={tBoard('filters.corridor')}
        options={options.corridor.map((value) => ({ value, label: value }))}
        selectedValues={advancedFilters.corridor}
        expanded={expandedMobileFilterGroups.corridor}
        onToggle={(value) => toggleMobileFilter('corridor', value, 'single')}
        onExpandToggle={() => toggleMobileFilterGroup('corridor')}
      />

      <MobileMultiFilterGroup
        title={tBoard('filters.origin')}
        options={options.origin.map((value) => ({ value, label: value }))}
        selectedValues={advancedFilters.origin}
        expanded={expandedMobileFilterGroups.origin}
        onToggle={(value) => toggleMobileFilter('origin', value, 'multi')}
        onExpandToggle={() => toggleMobileFilterGroup('origin')}
      />

      <MobileMultiFilterGroup
        title={tBoard('filters.destination')}
        options={options.destination.map((value) => ({ value, label: value }))}
        selectedValues={advancedFilters.destination}
        expanded={expandedMobileFilterGroups.destination}
        onToggle={(value) => toggleMobileFilter('destination', value, 'multi')}
        onExpandToggle={() => toggleMobileFilterGroup('destination')}
      />

      <MobileMultiFilterGroup
        title={tBoard('filters.cargoType')}
        options={options.type.map((value) => ({ value, label: value }))}
        selectedValues={advancedFilters.type}
        expanded={expandedMobileFilterGroups.type}
        onToggle={(value) => toggleMobileFilter('type', value, 'multi')}
        onExpandToggle={() => toggleMobileFilterGroup('type')}
      />

      <MobileMultiFilterGroup
        title={tBoard('filters.document')}
        options={options.document.map((value) => ({ value, label: value }))}
        selectedValues={advancedFilters.document}
        expanded={expandedMobileFilterGroups.document}
        onToggle={(value) => toggleMobileFilter('document', value, 'multi')}
        onExpandToggle={() => toggleMobileFilterGroup('document')}
      />
    </div>
  );
  const mobileFilterSheet = (
    <BottomSheet
      open={drawerOpen}
      onOpenChange={handleMobileFilterSheetOpenChange}
      title={tBoard('filters.mobileTitle')}
      description={tBoard('filters.mobileDescription')}
      snapPoints={[MOBILE_FILTER_SHEET_SNAP_POINT]}
      variant="strong"
      closeAriaLabel={tBoard('filters.close')}
      className={cx(
        styles.mobileFilterSheet,
        isMobileFilterClosing && styles.mobileFilterSheetClosing
      )}
      bodyClassName={styles.mobileFilterSheetBody}
      footer={
        <div className={styles.filterSheetFooter}>
          <button type="button" className={styles.filterSheetFooterSecondary} onClick={resetFilters}>
            {tBoard('filters.mobileClearAction')}
          </button>
          <button type="button" className={styles.filterSheetFooterPrimary} onClick={closeMobileFilterSheet}>
            {tBoard('filters.mobileApplyActionCount', { count: filteredCargoes.length })}
          </button>
        </div>
      }
    >
      <div className={styles.filterSheetRoot} role="region" aria-label={tBoard('filters.advancedRegion')}>
        {mobileFiltersPanel}
      </div>
    </BottomSheet>
  );

  if (isMobileViewport) {
    return (
      <section className={styles.mobileBoard}>
        <div className={styles.mobileListShell}>
          <header className={styles.mobileHeader}>
            <div className={styles.mobileHeaderTop}>
              <div className={styles.mobileHeaderCopy}>
                <div className={styles.mobileHeaderMeta}>
                  <p>{tBoard('filters.results', { count: filteredCargoes.length })}</p>
                  {hasAppliedFilters ? (
                    <button
                      type="button"
                      className={styles.mobileClearFiltersButton}
                      onClick={resetFilters}
                    >
                      {tBoard('filters.mobileClearAction')}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={styles.mobileHeaderActions}>
                <button
                  type="button"
                  className={drawerOpen ? styles.mobileFilterButtonActive : styles.mobileFilterButton}
                  onClick={() => {
                    if (drawerOpen) {
                      closeMobileFilterSheet();
                      return;
                    }

                    openMobileFilterSheet();
                  }}
                  aria-label={activeFilters > 0 ? tBoard('filters.activeCount', { count: activeFilters }) : tBoard('list.filterAria')}
                  aria-expanded={drawerOpen}
                >
                  <SlidersHorizontal className={styles.cargoMobileFilterIcon} aria-hidden />
                  {activeFilters > 0 ? (
                    <span className={styles.mobileFilterBadge} aria-hidden>
                      {activeFilters}
                    </span>
                  ) : null}
                </button>

                <div className={styles.mobileAddLinkWrap}>
                  <Link href={intlAppPaths.cargos.publishCargo} className={styles.mobileAddLink}>
                    <Plus size={15} />
                    <span>{tBoard('list.newCargo')}</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.cargoSearchWrap}>
              <div className="hr-cargo-list-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                    setMobileVisibleCount(MOBILE_INITIAL_VISIBLE_COUNT);
                  }}
                  placeholder={tBoard('list.searchPlaceholder')}
                  aria-label={tBoard('list.searchAria')}
                />
              </div>
            </div>

            <div className={styles.mobileStatusScroller} aria-label={tBoard('tabs.aria')}>
              <button type="button" className={statusFilter === 'all' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('all')}>
                <Circle size={14} /> {tBoard('statusFilters.all')}
              </button>
              <button type="button" className={statusFilter === 'open' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('open')}>
                <ClipboardList size={14} /> {tBoard('statusFilters.open')}
              </button>
              <button type="button" className={statusFilter === 'bidding' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('bidding')}>
                <Clock3 size={14} /> {tBoard('statusFilters.bidding')}
              </button>
              <button type="button" className={statusFilter === 'contracting' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('contracting')}>
                <FileText size={14} /> {tBoard('statusFilters.contracting')}
              </button>
              <button type="button" className={statusFilter === 'reserved' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('reserved')}>
                <Anchor size={14} /> {tBoard('statusFilters.reserved')}
              </button>
              <button type="button" className={statusFilter === 'boarded' ? 'hr-cargo-status-chip is-active' : 'hr-cargo-status-chip'} onClick={() => handleStatusFilterChange('boarded')}>
                <Ship size={14} /> {tBoard('statusFilters.boarded')}
              </button>
            </div>
          </header>

          <div className={styles.mobileList} ref={listRef}>
            {visibleMobileCargoes.length ? (
              <AnimatePresence initial={!prefersReducedMotion} mode="popLayout">
                {visibleMobileCargoes.map((cargo) => (
                  <motion.div
                    key={cargo.id}
                    layout={!prefersReducedMotion}
                    className={styles.mobileCargoListItem}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {renderCargoCard(cargo)}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className={styles.emptyState} role="status">
                <AlertCircle size={22} aria-hidden="true" />
                <h3>
                  {hasAppliedFilters ? tBoard('list.emptyFilteredTitle') : tBoard('list.emptyTitle')}
                </h3>
                <p>
                  {hasAppliedFilters ? tBoard('list.emptyFilteredDescription') : tBoard('list.emptyDescription')}
                </p>
                {hasAppliedFilters ? (
                  <button type="button" onClick={resetFilters}>
                    {tBoard('list.clearFiltersAction')}
                  </button>
                ) : null}
              </div>
            )}

            {hasMoreMobileCargoes ? (
              <div ref={mobileListSentinelRef} className={styles.mobileListSentinel} aria-hidden />
            ) : null}
          </div>
        </div>

        {mobileFilterSheet}
      </section>
    );
  }

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
                className={cx(
                  drawerOpen ? 'hx-icon-button hx-filter-trigger is-active' : 'hx-icon-button hx-filter-trigger',
                  styles.desktopFilterButton
                )}
                onClick={() => setDrawerOpen((current) => !current)}
                aria-label={activeFilters > 0 ? tBoard('filters.activeCount', { count: activeFilters }) : tBoard('list.filterAria')}
                aria-expanded={drawerOpen}
              >
                <SlidersHorizontal className={styles.cargoMobileFilterIcon} aria-hidden />
                {activeFilters > 0 ? <span className={styles.desktopFilterBadge}>{activeFilters}</span> : null}
              </button>
              <Link href={intlAppPaths.cargos.publishCargo} className="hx-add-mini">
                <Plus size={15} />
                <span>{tBoard('list.newCargo')}</span>
              </Link>
            </div>
          </div>

          <div className={styles.cargoSearchWrap}>
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
          {pageItems.map((cargo) => renderCargoCard(cargo))}
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
            <div id="hx-panel-overview" role="tabpanel" aria-labelledby="hx-tab-overview" className={styles.overviewPanel}>
              <div className={styles.overviewGrid}>
                <section className={styles.heroCard} aria-label={tBoard('overview.vesselImageAria')}>
                  <div className={styles.heroMedia} data-treatment={selectedVesselVisual?.treatment ?? 'real-water-dark'}>
                    <Image
                      src={selectedVesselImage}
                      alt={selectedVesselVisual?.alt ?? `Embarcação associada à carga ${selectedCargo.id}`}
                      className={styles.heroImage}
                      loading="eager"
                      fill
                      unoptimized
                      sizes="(max-width: 860px) 100vw, 860px"
                      style={{ objectPosition: selectedVesselVisual?.objectPosition ?? 'center right' }}
                    />
                    <div className={styles.heroScrim} aria-hidden="true" />
                  </div>

                  <div className={styles.heroInner}>
                    <div className={styles.heroCopy}>
                      <div className={styles.idRow}>
                        <h2>{selectedCargo.id.toUpperCase()}</h2>
                        <span className={overviewStatusClass(selectedCargo.status)}>{getCargoStatusLabel(selectedCargo.status, tCommon)}</span>
                      </div>
                      <p className={styles.cargoTitle}>{selectedCargo.title}</p>

                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <span><Ship size={16} /> {tBoard('overview.vesselOperation')}</span>
                          <strong>{selectedVessel}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <span><Waves size={16} /> {tCommon('operator')}</span>
                          <strong>{selectedCarrier}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.routeBlock}>
                      <div className={styles.routeHead}>
                        <div><strong>{selectedCargo.origin}</strong><span>{tCommon('origin')}</span></div>
                        <b>{routeProgressLabel}</b>
                        <div><strong>{selectedCargo.destination}</strong><span>{tCommon('destination')}</span></div>
                      </div>
                      <div className={styles.routeTrack}>
                        <span className={styles.routeNode} aria-hidden="true" />
                        <div className={styles.routeLine}>
                          <span style={{ width: `${selectedProgress}%` }} />
                          <i style={{ left: `${selectedProgress}%` }} aria-hidden="true" />
                        </div>
                        <span className={cx(styles.routeNode, styles.routeNodeDest)} aria-hidden="true" />
                      </div>
                      <p>{tBoard('overview.estimatedDistance', { river: selectedRiver })}</p>
                    </div>
                  </div>
                </section>

                <aside className={styles.sideStack} aria-label={tBoard('overview.operationalIndicators')}>
                  <article className={styles.sideCard}>
                    <span className={cx(styles.sideIcon, styles.sideIconCyan)}><Anchor size={22} /></span>
                    <div className={styles.sideCopy}>
                      <small>{tBoard('overview.berthForecast')}</small>
                      <strong>{arrivalDateTime.dateLabel} {arrivalDateTime.timeLabel}</strong>
                      <p>{arrivalLocation}</p>
                      <b>{tBoard('overview.onSchedule')}</b>
                    </div>
                  </article>

                  <article className={styles.sideCard}>
                    <span className={cx(styles.sideIcon, styles.sideIconBlue)}><FileText size={22} /></span>
                    <div className={styles.sideCopy}>
                      <small>{tCommon('documents')}</small>
                      <strong>{docsCount} / {docsTotal}</strong>
                      <p>{tBoard('overview.pendingDocuments', { count: pendingDocs })}</p>
                      <div className={styles.sideProgressMeta}>
                        <span>{documentReadiness}%</span>
                        <b>{tBoard('overview.documentReadiness')}</b>
                      </div>
                      <div className={styles.sideProgress}><i style={{ width: `${documentReadiness}%` }} /></div>
                    </div>
                  </article>

                  <article className={styles.sideCard}>
                    <span className={cx(styles.sideIcon, styles.sideIconGold)}><CircleDollarSign size={22} /></span>
                    <div className={styles.sideCopy}>
                      <small>{tBoard('overview.estimatedCost')}</small>
                      <strong>{targetPriceLabel}</strong>
                      <p>{tBoard('overview.estimatedMargin')}</p>
                      <svg viewBox="0 0 120 32" className={styles.miniChart} aria-hidden="true">
                        <path d="M4 24 L20 20 L35 21 L50 16 L64 18 L78 12 L92 14 L116 4" />
                      </svg>
                    </div>
                  </article>

                  <article className={styles.sideCard}>
                    <span className={cx(styles.sideIcon, styles.sideIconGreen)}><Leaf size={22} /></span>
                    <div className={styles.sideCopy}>
                      <small>{tBoard('overview.co2Savings')}</small>
                      <strong>{selectedCargo.co2Saving}</strong>
                      <p>{tBoard('overview.roadComparison')}</p>
                      <svg viewBox="0 0 120 32" className={cx(styles.miniChart, styles.miniChartGreen)} aria-hidden="true">
                        <path d="M4 25 L18 27 L30 18 L46 21 L58 13 L72 19 L86 10 L102 13 L116 6" />
                      </svg>
                    </div>
                  </article>
                </aside>

                <section className={styles.metricStrip} aria-label={tBoard('overview.operationalIndicators')}>
                  <article className={styles.metricCard}>
                    <small>{tBoard('overview.etaArrival')}</small>
                    <strong>36–44h</strong>
                    <span>{arrivalDateTime.dateLabel} {arrivalDateTime.timeLabel}</span>
                  </article>
                  <article className={styles.metricCard}>
                    <small>{tBoard('overview.temperature')}</small>
                    <strong className={styles.metricValueBlue}><Snowflake size={20} /> -18 °C</strong>
                    <span>{tBoard('overview.idealRange')}</span>
                  </article>
                  <article className={styles.metricCard}>
                    <small>{tBoard('overview.documentReadiness')}</small>
                    <strong className={styles.metricValueCyan}><FileText size={18} /> {documentReadiness}%</strong>
                    <span>{tBoard('overview.documentsReadyRatio', { count: docsCount, total: docsTotal })}</span>
                  </article>
                  <article className={styles.metricCard}>
                    <small>{tBoard('overview.co2Savings')}</small>
                    <strong className={styles.metricValueGreen}><Leaf size={20} /> {selectedCargo.co2Saving}</strong>
                    <span>{tBoard('overview.roadComparison')}</span>
                  </article>
                </section>
              </div>
            </div>
          ) : null}

          {activeTab === 'timeline' ? (
            <div className={styles.timelineShell}>
              <div id="hx-panel-timeline" role="tabpanel" aria-labelledby="hx-tab-timeline" className="hx-timeline-game" aria-label={tBoard('timeline.aria')}>
                <header className="hx-timeline-game__hero">
                  <h2 className="hx-timeline-game__pageTitle">{tBoard('timeline.pageTitle')}</h2>
                  <p className="hx-timeline-game__pageSubtitle">{tBoard('timeline.pageSubtitle')}</p>
                </header>

                <div className="hx-timeline-game__summary">
                  <span className="hx-timeline-game__summaryIcon"><Navigation size={22} strokeWidth={2.1} aria-hidden /></span>
                  <div className="hx-timeline-game__summaryMain">
                    <strong>{tBoard('timeline.journey')}</strong>
                    <p className="hx-timeline-game__route">{selectedCargo.origin} → {selectedCargo.destination}</p>
                    <p className="hx-timeline-game__river">{selectedRiver}</p>
                    <i className="hx-timeline-game__progress"><b style={{ width: `${selectedProgress}%` }} /></i>
                  </div>
                  <div className="hx-timeline-game__pctCol">
                    <b>{selectedProgress}%</b>
                    <small>{tBoard('timeline.completedPhases', { completed: completedTimelineSteps, total: timelineItems.length })}</small>
                  </div>
                </div>

                {timelineCurrentIndex >= 0 ? (
                  <div className="hx-timeline-nowBand" role="status">
                    <span className="hx-timeline-nowBand__eyebrow">{tBoard('timeline.hereNow')}</span>
                    <p className="hx-timeline-nowBand__next">
                      {timelineNextEvent
                        ? tBoard('timeline.nextStep', { title: timelineNextEvent.title })
                        : tBoard('timeline.nextStepNone')}
                    </p>
                  </div>
                ) : null}

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
                        {event.status === 'current' ? (
                          <span className="hx-timeline-node__boat" aria-label={tBoard('timeline.boatAtCurrent')}>
                            <Ship size={22} strokeWidth={2.2} aria-hidden />
                          </span>
                        ) : null}
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
                          <span className="hx-timeline-node__icon">{getTimelineIcon(event, index, 26)}</span>
                          <span className="hx-timeline-node__copy">
                            <small>{phaseLabel}</small>
                            <strong>{event.title}</strong>
                            <em>{event.location} · {event.timestamp}</em>
                          </span>
                          <span className="hx-timeline-node__meta">
                            {event.status === 'current' ? (
                              <span className="hx-timeline-node__nowBadge">{tBoard('timeline.badgeNow')}</span>
                            ) : null}
                            <span className="hx-timeline-node__status" data-timeline-status={event.status}>
                              {timelineStatusGlyph(event.status)}
                              {getTimelineStatusLabel(event.status, tBoard)}
                            </span>
                            <span className="hx-timeline-node__xp">+{(index + 1) * 120} XP</span>
                          </span>
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
                            <div className="hx-timeline-node__footer hx-timeline-node__footer--mission">
                              <span>{tBoard('timeline.operationalMission')}</span>
                              <strong className="hx-timeline-mission-confirm">
                                <CheckCircle2 size={17} strokeWidth={2.25} aria-hidden />
                                {getTimelineChecklistLabel(event, index, tBoard)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'documents' ? (
            <div
              id="hx-panel-documents"
              role="tabpanel"
              aria-labelledby="hx-tab-documents"
              className={styles.documentsShell}
              aria-label={tBoard('documents.aria')}
            >
              <header className="hx-docs-game">
                <div className="hx-docs-game__heroText">
                  <h2 className="hx-docs-game__title">{tBoard('documents.pageTitle')}</h2>
                  <p className="hx-docs-game__subtitle">{tBoard('documents.pageSubtitle')}</p>
                </div>
                <div className="hx-docs-game__heroMeter" role="group" aria-label={tBoard('documents.progressAria')}>
                  <span className="hx-docs-game__heroIcon" aria-hidden>
                    <ClipboardCheck size={24} strokeWidth={2.1} />
                  </span>
                  <div className="hx-docs-game__meterCopy">
                    <p className="hx-docs-game__progressLine">
                      {tBoard('documents.progressSummary', { ready: docsReadyCount, total: docsTotal })}
                    </p>
                    <p className="hx-docs-game__readinessLine">
                      {tBoard('documents.readinessLine', { pct: documentReadiness })}
                    </p>
                    <span className="hx-docs-game__progressTrack" aria-hidden>
                      <i style={{ width: `${documentReadiness}%` }} />
                    </span>
                  </div>
                </div>
              </header>

              <div className="hx-documents-accordion">
                {selectedDocumentItems.map((document) => {
                  const isOpen = expandedDocumentName === document.name;
                  const statusChip = getDocumentStatusChip(document.status, tBoard);
                  const statusTone = getDocumentStatusTone(document.status);
                  const docKind = getDocumentVisualKind(document.name);
                  const kindClass = `hx-document-card--${docKind}`;

                  return (
                    <article
                      key={document.name}
                      className={`hx-document-card ${statusTone} ${kindClass} ${isOpen ? 'is-open' : ''}`.trim()}
                    >
                      <button
                        type="button"
                        className="hx-document-card__head"
                        onClick={() => setExpandedDocumentName(isOpen ? null : document.name)}
                        aria-expanded={isOpen}
                      >
                        <span className="hx-document-card__icon">{renderDocumentCardIcon(document.name, 24)}</span>
                        <span className="hx-document-card__copy">
                          <strong>{document.name}</strong>
                          <span className="hx-document-card__lede">{tBoard(`documents.shortDesc.${docKind}`)}</span>
                          <em className="hx-document-card__micro">{tBoard(`documents.microcopy.${docKind}`)}</em>
                        </span>
                        <span className="hx-document-card__status">{statusChip}</span>
                        <ChevronDown size={18} />
                      </button>

                      {isOpen ? (
                        <div className="hx-document-card__body">
                          <ul className="hx-document-card__facts" aria-label={tBoard('documents.factsAria')}>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <Info size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.whatIs')}</small>
                                <strong>{document.name}</strong>
                              </span>
                            </li>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <ClipboardCheck size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.whyMatters')}</small>
                                <strong>{tBoard(`documents.shortDesc.${docKind}`)}</strong>
                              </span>
                            </li>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <User size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.whoHandles')}</small>
                                <strong>{document.owner}</strong>
                              </span>
                            </li>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <CalendarClock size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.whenDue')}</small>
                                <strong>{document.due}</strong>
                              </span>
                            </li>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <AlertCircle size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.whatsMissing')}</small>
                                <strong>{document.evidence}</strong>
                              </span>
                            </li>
                            <li className="hx-document-card__fact">
                              <span className="hx-document-card__factIcon" aria-hidden>
                                <FileText size={16} strokeWidth={2.1} />
                              </span>
                              <span className="hx-document-card__factCopy">
                                <small>{tBoard('documents.panel.codeLabel')}</small>
                                <strong>{document.code}</strong>
                              </span>
                            </li>
                          </ul>
                          <p className="hx-document-card__valueLine">{tBoard('documents.valueLine')}</p>
                          <p className="hx-document-card__note">{document.note ?? tBoard('documents.defaultNote')}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === 'cost' ? (
            <div
              id="hx-panel-cost"
              role="tabpanel"
              aria-labelledby="hx-tab-cost"
              className={styles.costTabShell}
              aria-label={tBoard('cost.title')}
            >
              <header className="hx-cost-game__hero">
                <div className="hx-cost-game__heroIntro">
                  <h2 className="hx-cost-game__title">{tBoard('cost.pageTitle')}</h2>
                  <p className="hx-cost-game__subtitle">{tBoard('cost.pageSubtitle')}</p>
                </div>
                <div className="hx-cost-game__heroValue">
                  <span className="hx-cost-game__heroIcon" aria-hidden>
                    <CircleDollarSign size={28} strokeWidth={2.1} />
                  </span>
                  <div className="hx-cost-game__heroNumbers">
                    <small>{tBoard('cost.heroValueCaption')}</small>
                    <strong>{formatLocaleCurrency(locale, costModel.total)}</strong>
                  </div>
                </div>
                <p className="hx-cost-game__narrative">{tBoard('cost.narrativeLine')}</p>
              </header>

              <div className="hx-cost-game__summaryGrid">
                <article className="hx-cost-game-card hx-cost-game-card--cyan">
                  <span className="hx-cost-game-card__icon" aria-hidden>
                    <Wallet size={22} strokeWidth={2.1} />
                  </span>
                  <div className="hx-cost-game-card__body">
                    <small>{tBoard('cost.estimatedTotal')}</small>
                    <strong>{formatLocaleCurrency(locale, costModel.total)}</strong>
                    <p>{tBoard('cost.summaryMicro.estimatedTotal')}</p>
                  </div>
                </article>
                <article className="hx-cost-game-card hx-cost-game-card--blue">
                  <span className="hx-cost-game-card__icon" aria-hidden>
                    <BadgePercent size={22} strokeWidth={2.1} />
                  </span>
                  <div className="hx-cost-game-card__body">
                    <small>{tBoard('cost.margin')}</small>
                    <strong>{formatLocalePercent(locale, costModel.marginRate)}</strong>
                    <p>{tBoard('cost.summaryMicro.margin')}</p>
                  </div>
                </article>
                <article className="hx-cost-game-card hx-cost-game-card--green">
                  <span className="hx-cost-game-card__icon" aria-hidden>
                    <Leaf size={22} strokeWidth={2.1} />
                  </span>
                  <div className="hx-cost-game-card__body">
                    <small>{tBoard('cost.savings')}</small>
                    <strong>{formatLocalePercent(locale, costModel.savingsRate)}</strong>
                    <p>{tBoard('cost.summaryMicro.savings')}</p>
                  </div>
                </article>
                <article className="hx-cost-game-card hx-cost-game-card--split">
                  <span className="hx-cost-game-card__icon" aria-hidden>
                    <Coins size={22} strokeWidth={2.1} />
                  </span>
                  <div className="hx-cost-game-card__body">
                    <small>{tBoard('cost.perTon')}</small>
                    <strong>{formatLocaleCurrency(locale, costModel.costPerTon)}</strong>
                    <p>{tBoard('cost.summaryMicro.perTon')}</p>
                  </div>
                </article>
              </div>

              <div className="hx-cost-game__split">
                <section className="hx-cost-game__breakdown" aria-labelledby="hx-cost-breakdown-title">
                  <div className="hx-cost-game__sectionHead">
                    <h3 id="hx-cost-breakdown-title">{tBoard('cost.breakdownTitle')}</h3>
                    <span>{formatLocaleCurrency(locale, costModel.total)}</span>
                  </div>
                  <div className="hx-cost-br-list">
                    {costModel.breakdown.map((item) => {
                      const isDominant = item.key === dominantCostRow.key;
                      return (
                        <article
                          key={item.key}
                          className={`hx-cost-br-row ${isDominant ? 'hx-cost-br-row--dominant' : ''}`.trim()}
                        >
                          <span className="hx-cost-br-row__glyph">{renderCostBreakdownIcon(item.key)}</span>
                          <div className="hx-cost-br-row__main">
                            <div className="hx-cost-br-row__top">
                              <strong>{tBoard(`cost.${item.key}`)}</strong>
                              <span className="hx-cost-br-row__pct">
                                {formatLocalePercent(locale, item.share, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <span className="hx-cost-br-row__bar" aria-hidden>
                              <i className={item.tone} style={{ width: `${Math.max(8, Math.round(item.share * 100))}%` }} />
                            </span>
                            <small className="hx-cost-br-row__money">{formatLocaleCurrency(locale, item.value)}</small>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="hx-cost-game__chart">
                  <CostSimulationChart
                    costModel={costModel}
                    tBoard={tBoard}
                    locale={locale}
                    co2Label={selectedCargo.co2Saving}
                  />
                </section>
              </div>

              <section className="hx-cost-game__scoreboard" aria-labelledby="hx-cost-score-title">
                <div className="hx-cost-game__sectionHead">
                  <h3 id="hx-cost-score-title">{tBoard('cost.scoreboardTitle')}</h3>
                  <span className="hx-cost-game__badge">{tBoard('cost.scoreboardBadge')}</span>
                </div>
                <div className="hx-cost-score-grid">
                  <article className="hx-cost-score-tile hx-cost-score-tile--river">
                    <span className="hx-cost-score-tile__icon" aria-hidden>
                      <Ship size={24} strokeWidth={2.1} />
                    </span>
                    <small>{tBoard('cost.river')}</small>
                    <strong>{formatLocaleCurrency(locale, costModel.total)}</strong>
                  </article>
                  <article className="hx-cost-score-tile hx-cost-score-tile--road">
                    <span className="hx-cost-score-tile__icon" aria-hidden>
                      <Truck size={24} strokeWidth={2.1} />
                    </span>
                    <small>{tBoard('cost.road')}</small>
                    <strong>{formatLocaleCurrency(locale, costModel.roadEstimate)}</strong>
                  </article>
                  <article className="hx-cost-score-tile hx-cost-score-tile--eco">
                    <span className="hx-cost-score-tile__icon" aria-hidden>
                      <TrendingDown size={22} strokeWidth={2.1} />
                    </span>
                    <small>{tBoard('cost.economyLabel')}</small>
                    <strong>{formatLocaleCurrency(locale, costSavingsAbs)}</strong>
                    <em>{selectedCargo.co2Saving}</em>
                  </article>
                </div>
              </section>

              <section className="hx-cost-game__timeline" aria-labelledby="hx-cost-tl-title">
                <div className="hx-cost-game__sectionHead">
                  <div>
                    <h3 id="hx-cost-tl-title">{tBoard('cost.timelineTitle')}</h3>
                    <p className="hx-cost-game__timelineLead">{tBoard('cost.timelineNarrative')}</p>
                  </div>
                </div>
                <div className="hx-cost-tl-track">
                  {costModel.timeline.map((step, index) => {
                    const isCurrent = index === costTimelineActiveIndex;
                    return (
                      <article key={step.key} className={`hx-cost-tl-step ${isCurrent ? 'hx-cost-tl-step--current' : ''}`.trim()}>
                        <span className="hx-cost-tl-step__icon">{renderCostTimelineIcon(step.key)}</span>
                        <div className="hx-cost-tl-step__copy">
                          <div className="hx-cost-tl-step__head">
                            <strong>{tBoard(`cost.timeline.${step.key}`)}</strong>
                            {isCurrent ? <span className="hx-cost-tl-step__pill">{tBoard('cost.stepCurrent')}</span> : null}
                          </div>
                          <span className="hx-cost-tl-step__meter" aria-hidden>
                            <i style={{ width: `${Math.round(step.progress * 100)}%` }} />
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="hx-cost-game__alerts" aria-labelledby="hx-cost-alerts-title">
                <div className="hx-cost-game__sectionHead hx-cost-game__sectionHead--stack">
                  <h3 id="hx-cost-alerts-title">{tBoard('cost.alertsTitle')}</h3>
                  <p>{tBoard('cost.alertsSubtitle')}</p>
                </div>
                <div className="hx-cost-alert-deck">
                  {costModel.alerts.map((alert) => (
                    <article key={alert.key} className={`hx-cost-alert-card ${alert.tone}`.trim()}>
                      <span className="hx-cost-alert-card__icon">{renderCostAlertIcon(alert.key)}</span>
                      <div className="hx-cost-alert-card__copy">
                        <strong>{tBoard(`cost.${alert.key}`)}</strong>
                        <p>{tBoard(`cost.${alert.detailKey}`)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === 'priority' ? (
            <div id="hx-panel-priority" role="tabpanel" aria-labelledby="hx-tab-priority" className={styles.priorityTabShell}>
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

      {isMobileViewport ? mobileFilterSheet : null}

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
        snapPoints={['75vh']}
        variant="strong"
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
