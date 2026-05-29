'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { MobileCargoListFilters, MobileCargoListItem } from '@/features/cargo/domain/cargo-list.types';
import { LiquidGlassBottomDock } from '@/shared/design-system/primitives/liquid-glass-bottom-dock';
import { LiquidGlassSheet } from '@/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet';
import styles from './mobile-cargo-list-lab.module.scss';

/** Body/html class — locks admin shell scroll while the lab sheet is open (dev route only). */
export const MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS = 'hx-mobile-cargo-list-lab-sheet-open';

export function applyMobileCargoListLabSheetScrollLock(active: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  const className = MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS;

  if (active) {
    html.classList.add(className);
    body.classList.add(className);
    return;
  }

  html.classList.remove(className);
  body.classList.remove(className);
}

function useLabSheetScrollLock(open: boolean): void {
  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    applyMobileCargoListLabSheetScrollLock(true);
    return () => applyMobileCargoListLabSheetScrollLock(false);
  }, [open]);
}

function focusSheetCloseButton(rootSelector: string, closeLabel: string): void {
  const closeButton = document.querySelector<HTMLButtonElement>(
    `${rootSelector} [data-open="true"] button[aria-label="${closeLabel}"]`,
  );
  closeButton?.focus({ preventScroll: true });
}

type MobileCargoListLabProps = {
  locale: string;
  items: MobileCargoListItem[];
  filters: MobileCargoListFilters;
  totalCount: number;
};

export type MobileCargoListLabItem = {
  id: string;
  displayCode: string;
  statusLabel: string;
  title: string;
  origin: string;
  destination: string;
  etaLabel?: string;
  operationLabel?: string;
  warningLabel?: string;
  status: MobileCargoListItem['status'];
  needsAttention: boolean;
};

export type MobileCargoLabHeroSummary = {
  activeCount: number;
  attentionCount: number;
  openCount: number;
  nextEtaLabel?: string;
};

export type MobileCargoAdvancedFilters = {
  attentionOnly: boolean;
  origins: string[];
  destinations: string[];
};

type MobileCargoStatusFilter = 'all' | 'open' | 'quote' | 'operation' | 'attention';
type MobileCargoLabDockId = 'cargas' | 'attention' | 'map';
type LabSheetKind = 'none' | 'actions' | 'filters' | 'map-hint';
type CargoActionId = 'overview' | 'journey' | 'documents' | 'costs' | 'priority';

const SCROLL_COMPACT_THRESHOLD_PX = 28;
const EMPTY_ADVANCED_FILTERS: MobileCargoAdvancedFilters = {
  attentionOnly: false,
  origins: [],
  destinations: [],
};

type CargoActionItem = {
  id: CargoActionId;
  label: string;
  description?: string;
  disabled?: boolean;
  comingSoon?: boolean;
};

const LAB_UI_MARKER_PATTERN = /\s*\((mock|dev|fixture)\)\s*/gi;

const STATUS_FILTER_OPTIONS = [
  { id: 'all', labelKey: 'filters.all' },
  { id: 'open', labelKey: 'filters.open' },
  { id: 'quote', labelKey: 'filters.quote' },
  { id: 'operation', labelKey: 'filters.operation' },
  { id: 'attention', labelKey: 'filters.attention' },
] as const;

function normalizeValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Remove marcadores técnicos de fixtures na UI da lab. */
export function sanitizeMobileCargoLabDisplayText(value: string): string {
  return value.replace(LAB_UI_MARKER_PATTERN, ' ').replace(/\s{2,}/g, ' ').trim();
}

/** Normaliza ETA exibida na lab sem alterar fixtures de origem. */
export function formatLabEtaLabel(etaLabel?: string): string | undefined {
  if (!etaLabel?.trim()) {
    return undefined;
  }

  const trimmed = etaLabel.trim();
  const withoutDuplicatePrefix = trimmed.replace(/^ETA\s+ETA\s+/i, 'ETA ');
  if (/^eta\b/i.test(withoutDuplicatePrefix)) {
    return withoutDuplicatePrefix;
  }

  return `ETA ${withoutDuplicatePrefix}`;
}

function mapItemToLabItem(item: MobileCargoListItem, statusLabel: string): MobileCargoListLabItem {
  return {
    id: item.id,
    displayCode: item.displayId,
    statusLabel,
    title: sanitizeMobileCargoLabDisplayText(item.title),
    origin: item.origin,
    destination: item.destination,
    etaLabel: formatLabEtaLabel(item.etaLabel),
    operationLabel: item.operationLabel,
    warningLabel: item.alertLabel,
    status: item.status,
    needsAttention: item.needsAttention,
  };
}

function matchesStatusFilter(item: MobileCargoListItem, status: MobileCargoStatusFilter): boolean {
  const normalizedStatus = normalizeValue(item.status);
  const normalizedWarning = normalizeValue(item.alertLabel ?? '');

  if (status === 'all') {
    return true;
  }

  if (status === 'attention') {
    return item.needsAttention || normalizedWarning.includes('aten');
  }

  if (status === 'open') {
    return normalizedStatus.includes('open');
  }

  if (status === 'quote') {
    return normalizedStatus.includes('bidding') || normalizedStatus.includes('contracting');
  }

  return (
    normalizedStatus.includes('reserved') ||
    normalizedStatus.includes('boarded') ||
    normalizedStatus.includes('delivered')
  );
}

function matchesAdvancedFilters(
  item: MobileCargoListItem,
  advanced: MobileCargoAdvancedFilters,
): boolean {
  if (advanced.attentionOnly) {
    const normalizedWarning = normalizeValue(item.alertLabel ?? '');
    if (!item.needsAttention && !normalizedWarning.includes('aten')) {
      return false;
    }
  }

  if (advanced.origins.length > 0 && !advanced.origins.includes(item.origin)) {
    return false;
  }

  if (advanced.destinations.length > 0 && !advanced.destinations.includes(item.destination)) {
    return false;
  }

  return true;
}

function isActiveOperationStatus(status: string): boolean {
  const normalized = normalizeValue(status);
  return (
    normalized.includes('reserved') ||
    normalized.includes('boarded') ||
    normalized.includes('bidding') ||
    normalized.includes('contracting')
  );
}

export function computeMobileCargoLabHeroSummary(
  items: MobileCargoListItem[],
): MobileCargoLabHeroSummary {
  const activeCount = items.filter((item) => isActiveOperationStatus(item.status)).length;
  const attentionCount = items.filter(
    (item) => item.needsAttention || normalizeValue(item.alertLabel ?? '').includes('aten'),
  ).length;
  const openCount = items.filter((item) => normalizeValue(item.status).includes('open')).length;
  const nextEtaLabel = items.find((item) => item.etaLabel?.trim())?.etaLabel;

  return {
    activeCount,
    attentionCount,
    openCount,
    nextEtaLabel,
  };
}

export function getUniqueCargoLocations(items: MobileCargoListItem[]): {
  origins: string[];
  destinations: string[];
} {
  const origins = [...new Set(items.map((item) => item.origin))].sort((a, b) => a.localeCompare(b));
  const destinations = [...new Set(items.map((item) => item.destination))].sort((a, b) =>
    a.localeCompare(b),
  );
  return { origins, destinations };
}

export function countMobileCargoActiveFilters(
  query: string,
  status: MobileCargoStatusFilter,
  advanced: MobileCargoAdvancedFilters,
): number {
  let count = 0;
  if (query.trim().length > 0) {
    count += 1;
  }
  if (status !== 'all') {
    count += 1;
  }
  if (advanced.attentionOnly) {
    count += 1;
  }
  if (advanced.origins.length > 0) {
    count += 1;
  }
  if (advanced.destinations.length > 0) {
    count += 1;
  }
  return count;
}

export function filterMobileCargoList(
  items: MobileCargoListItem[],
  query: string,
  status: MobileCargoStatusFilter,
  advanced: MobileCargoAdvancedFilters = EMPTY_ADVANCED_FILTERS,
): MobileCargoListItem[] {
  const normalizedQuery = normalizeValue(query);

  return items.filter((item) => {
    if (!matchesStatusFilter(item, status)) {
      return false;
    }

    if (!matchesAdvancedFilters(item, advanced)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      item.displayId,
      item.title,
      item.origin,
      item.destination,
      item.status,
      item.etaLabel ?? '',
      item.operationLabel ?? '',
      item.alertLabel ?? '',
    ]
      .map(normalizeValue)
      .join(' ');

    return haystack.includes(normalizedQuery);
  });
}

export function getStatusFilterOptions(items: MobileCargoListItem[]): MobileCargoStatusFilter[] {
  const statuses = new Set(items.map((item) => normalizeValue(item.status)));
  const hasAttention = items.some(
    (item) => item.needsAttention || normalizeValue(item.alertLabel ?? '').includes('aten'),
  );
  const hasOpen = Array.from(statuses).some((status) => status.includes('open'));
  const hasQuote = Array.from(statuses).some(
    (status) => status.includes('bidding') || status.includes('contracting'),
  );
  const hasOperation = Array.from(statuses).some(
    (status) =>
      status.includes('reserved') || status.includes('boarded') || status.includes('delivered'),
  );

  const available: MobileCargoStatusFilter[] = ['all'];
  if (hasOpen) available.push('open');
  if (hasQuote) available.push('quote');
  if (hasOperation) available.push('operation');
  if (hasAttention) available.push('attention');
  return available;
}

export function buildMobileCargoOverviewMapHref(locale: string, cargoId: string): string {
  return `/${locale}/cargas/${cargoId}/mapa`;
}

function FilterSlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M3 5.25h12M5.25 9h7.5M7.5 12.75h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12.75" cy="5.25" r="1.25" fill="currentColor" />
      <circle cx="6.75" cy="9" r="1.25" fill="currentColor" />
      <circle cx="10.5" cy="12.75" r="1.25" fill="currentColor" />
    </svg>
  );
}

function DockCargasIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 6.5h12M4 10h12M4 13.5h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DockAttentionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 4.5 16.5 15H3.5L10 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.25" r="0.75" fill="currentColor" />
    </svg>
  );
}

function DockMapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7 4.5 4 5.5v10l3-1 6 2 3-1V5.5l-3 1-6-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 3.5v12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function getCargoActionItems(selectedCargo: MobileCargoListLabItem | null): CargoActionItem[] {
  const hasSelectedCargo = selectedCargo != null;
  return [
    { id: 'overview', label: 'Visão geral', disabled: !hasSelectedCargo },
    { id: 'journey', label: 'Jornada', disabled: true, comingSoon: true },
    { id: 'documents', label: 'Documentos', disabled: true, comingSoon: true },
    { id: 'costs', label: 'Custos', disabled: true, comingSoon: true },
    { id: 'priority', label: 'Prioridade', disabled: true, comingSoon: true },
  ];
}

export function MobileCargoLabHero({
  summary,
  totalCount,
  eyebrow,
  subtitle,
  activeLabel,
  attentionLabel,
  openLabel,
}: {
  summary: MobileCargoLabHeroSummary;
  totalCount: number;
  eyebrow: string;
  subtitle: string;
  activeLabel: string;
  attentionLabel: string;
  openLabel: string;
}) {
  return (
    <section className={styles.heroSurface} data-testid="cargo-lab-hero">
      <div className={styles.heroInner}>
        <div className={styles.heroLead}>
          <p className={styles.heroEyebrow}>{eyebrow}</p>
          <p className={styles.heroTotal} aria-label={String(totalCount)}>
            {totalCount}
          </p>
          <p className={styles.heroSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.heroMetricsRow} data-testid="cargo-lab-hero-metrics">
          <span className={styles.heroMetricPill}>
            <span className={styles.heroMetricValue}>{summary.activeCount}</span>
            <span className={styles.heroMetricLabel}>{activeLabel}</span>
          </span>
          <span
            className={styles.heroMetricPill}
            data-attention={summary.attentionCount > 0 ? 'true' : undefined}
          >
            <span className={styles.heroMetricValue}>{summary.attentionCount}</span>
            <span className={styles.heroMetricLabel}>{attentionLabel}</span>
          </span>
          <span className={styles.heroMetricPill}>
            <span className={styles.heroMetricValue}>{summary.openCount}</span>
            <span className={styles.heroMetricLabel}>{openLabel}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function MobileCargoFilterButton({
  activeCount,
  ariaLabel,
  onClick,
  className,
  buttonRef,
}: {
  activeCount: number;
  ariaLabel: string;
  onClick: () => void;
  className: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      aria-label={ariaLabel}
      data-testid="cargo-lab-filter-button"
      onClick={onClick}
    >
      <span className={styles.filterButtonIcon} aria-hidden>
        <FilterSlidersIcon />
      </span>
      {activeCount > 0 ? (
        <span className={styles.filterButtonBadge} data-testid="cargo-lab-filter-badge">
          {activeCount}
        </span>
      ) : null}
    </button>
  );
}

export function MobileCargoLabCard({
  item,
  onPress,
  routeOriginLabel = 'Origem',
  routeDestinationLabel = 'Destino',
}: {
  item: MobileCargoListLabItem;
  onPress: (item: MobileCargoListLabItem) => void;
  routeOriginLabel?: string;
  routeDestinationLabel?: string;
}) {
  return (
    <article className={styles.cardSurface}>
      <button
        type="button"
        className={styles.cardButton}
        data-testid={`cargo-lab-card-${item.id}`}
        onClick={() => onPress(item)}
      >
        <div className={styles.cardTopRow}>
          <span className={styles.displayCode}>{item.displayCode}</span>
          <span className={styles.statusPill}>{item.statusLabel}</span>
        </div>
        <h2 className={styles.cardTitle}>{item.title}</h2>
        <div className={styles.cardRouteBlock}>
          <div className={styles.cardRoutePoint}>
            <span className={styles.cardRouteLabel}>{routeOriginLabel}</span>
            <span className={styles.cardRouteValue}>{item.origin}</span>
          </div>
          <span className={styles.cardRouteArrow} aria-hidden>
            →
          </span>
          <div className={styles.cardRoutePoint}>
            <span className={styles.cardRouteLabel}>{routeDestinationLabel}</span>
            <span className={styles.cardRouteValue}>{item.destination}</span>
          </div>
        </div>
        {item.etaLabel ? (
          <p className={styles.cardMeta}>{item.etaLabel}</p>
        ) : null}
        {item.warningLabel ? <p className={styles.warningPill}>{item.warningLabel}</p> : null}
      </button>
    </article>
  );
}

export function MobileCargoLabEmptyState({
  title,
  description,
  clearLabel,
  onClear,
}: {
  title: string;
  description: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <section className={styles.emptyStateSurface}>
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>{title}</h2>
        <p className={styles.emptyDescription}>{description}</p>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          {clearLabel}
        </button>
      </div>
    </section>
  );
}

export function MobileCargoListLab({
  locale,
  items,
  filters: _filters,
  totalCount,
}: MobileCargoListLabProps) {
  const router = useRouter();
  const t = useTranslations('pages.devMobileCargoListLab');
  const tCommon = useTranslations('common');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MobileCargoStatusFilter>('all');
  const [advancedFilters, setAdvancedFilters] =
    useState<MobileCargoAdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [dockActiveId, setDockActiveId] = useState<MobileCargoLabDockId>('cargas');
  const [selectedCargo, setSelectedCargo] = useState<MobileCargoListLabItem | null>(null);
  const [activeSheet, setActiveSheet] = useState<LabSheetKind>('none');
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastFocusedCardId, setLastFocusedCardId] = useState<string | null>(null);

  const filtersRef = useRef<HTMLDivElement>(null);
  const listScrollerRef = useRef<HTMLDivElement>(null);
  const headerFilterButtonRef = useRef<HTMLButtonElement>(null);
  const compactFilterButtonRef = useRef<HTMLButtonElement>(null);
  const lastFilterTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sheetRootSelector = '[data-testid="mobile-cargo-list-lab"]';

  const isActionSheetOpen = activeSheet === 'actions';
  const isFilterSheetOpen = activeSheet === 'filters';
  const isMapHintOpen = activeSheet === 'map-hint';
  const isAnySheetOpen = activeSheet !== 'none';

  useLabSheetScrollLock(isAnySheetOpen);

  const closeLabel = t('actionSheet.close');

  useEffect(() => {
    if (isActionSheetOpen) {
      const frame = window.requestAnimationFrame(() => {
        focusSheetCloseButton(sheetRootSelector, closeLabel);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (lastFocusedCardId) {
      const cardButton = document.querySelector<HTMLButtonElement>(
        `[data-testid="cargo-lab-card-${lastFocusedCardId}"]`,
      );
      cardButton?.focus({ preventScroll: true });
    }

    return undefined;
  }, [closeLabel, isActionSheetOpen, lastFocusedCardId]);

  useEffect(() => {
    if (isFilterSheetOpen) {
      const frame = window.requestAnimationFrame(() => {
        focusSheetCloseButton(sheetRootSelector, closeLabel);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    lastFilterTriggerRef.current?.focus({ preventScroll: true });
    return undefined;
  }, [closeLabel, isFilterSheetOpen]);

  useEffect(() => {
    if (!isMapHintOpen) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      focusSheetCloseButton(sheetRootSelector, closeLabel);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [closeLabel, isMapHintOpen]);

  const handleScrollerScroll = useCallback(() => {
    const scroller = listScrollerRef.current;
    if (!scroller) {
      return;
    }
    setIsScrolled(scroller.scrollTop > SCROLL_COMPACT_THRESHOLD_PX);
  }, []);

  const filteredItems = useMemo(
    () => filterMobileCargoList(items, query, statusFilter, advancedFilters),
    [advancedFilters, items, query, statusFilter],
  );

  const statusOptions = useMemo(() => getStatusFilterOptions(items), [items]);
  const locationOptions = useMemo(() => getUniqueCargoLocations(items), [items]);
  const activeFilterCount = useMemo(
    () => countMobileCargoActiveFilters(query, statusFilter, advancedFilters),
    [advancedFilters, query, statusFilter],
  );
  const hasActiveFilters = activeFilterCount > 0;

  const handleClearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setAdvancedFilters(EMPTY_ADVANCED_FILTERS);
    setDockActiveId('cargas');
  };

  const openFilterSheet = (trigger: HTMLButtonElement | null) => {
    lastFilterTriggerRef.current = trigger;
    setActiveSheet('filters');
  };

  const handleFilterShortcut = () => {
    openFilterSheet(headerFilterButtonRef.current);
  };

  const handleCompactFilterShortcut = () => {
    openFilterSheet(compactFilterButtonRef.current);
  };

  const scrollListToTop = () => {
    listScrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChipChange = (next: MobileCargoStatusFilter) => {
    setStatusFilter(next);
    setDockActiveId(next === 'attention' ? 'attention' : 'cargas');
    if (next === 'attention') {
      setAdvancedFilters((current) => ({ ...current, attentionOnly: true }));
    } else if (next !== 'all') {
      setAdvancedFilters((current) => ({ ...current, attentionOnly: false }));
    }
  };

  const handleDockChange = (nextId: string) => {
    const dockId = nextId as MobileCargoLabDockId;
    setDockActiveId(dockId);

    if (dockId === 'cargas') {
      handleClearFilters();
      scrollListToTop();
      return;
    }

    if (dockId === 'attention') {
      setStatusFilter('attention');
      setAdvancedFilters((current) => ({ ...current, attentionOnly: true }));
      filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (dockId === 'map') {
      if (selectedCargo) {
        router.push(buildMobileCargoOverviewMapHref(locale, selectedCargo.id));
        return;
      }
      setActiveSheet('map-hint');
    }
  };

  const toggleLocationFilter = (
    kind: 'origins' | 'destinations',
    value: string,
  ) => {
    setAdvancedFilters((current) => {
      const currentValues = current[kind];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];
      return { ...current, [kind]: nextValues };
    });
  };

  const filterChipItems = STATUS_FILTER_OPTIONS.map((option) => ({
    id: option.id,
    label: t(option.labelKey),
    disabled: !statusOptions.includes(option.id as MobileCargoStatusFilter),
  }));

  const actionItems = getCargoActionItems(selectedCargo).map((action) => {
    if (action.id === 'overview') {
      return {
        ...action,
        label: t('actionSheet.overviewTitle'),
        description: t('actionSheet.overviewDescription'),
      };
    }
    if (action.id === 'journey') {
      return {
        ...action,
        label: t('actionSheet.journeyTitle'),
        description: t('actionSheet.journeyDescription'),
      };
    }
    if (action.id === 'documents') {
      return {
        ...action,
        label: t('actionSheet.documentsTitle'),
        description: t('actionSheet.documentsDescription'),
      };
    }
    if (action.id === 'costs') {
      return {
        ...action,
        label: t('actionSheet.costsTitle'),
        description: t('actionSheet.costsDescription'),
      };
    }
    return { ...action, label: t('actionSheet.priorityTitle') };
  });

  const listItems = filteredItems.map((item) => {
    let statusLabel: string = item.status;
    try {
      statusLabel = tCommon(`cargoStatus.${item.status}`);
    } catch {
      statusLabel = item.status;
    }
    return mapItemToLabItem(item, statusLabel);
  });

  const headerSubtitle = t('subtitle', { total: totalCount });

  const handleActionClick = (action: CargoActionItem) => {
    if (action.disabled || action.comingSoon || !selectedCargo) {
      return;
    }

    if (action.id === 'overview') {
      router.push(buildMobileCargoOverviewMapHref(locale, selectedCargo.id));
      setActiveSheet('none');
    }
  };

  const handleActionSheetClose = () => {
    setActiveSheet('none');
  };

  const handleFilterSheetClose = () => {
    setActiveSheet('none');
  };

  const handleMapHintClose = () => {
    setActiveSheet('none');
  };

  const sheetTitle = selectedCargo?.title ?? t('actionSheet.selectedSubtitle');

  const dockItems = [
    { id: 'cargas', label: t('dock.cargas'), icon: <DockCargasIcon /> },
    { id: 'attention', label: t('dock.attention'), icon: <DockAttentionIcon /> },
    {
      id: 'map',
      label: t('dock.map'),
      icon: <DockMapIcon />,
      disabled: !selectedCargo,
    },
  ];

  return (
    <div
      className={styles.root}
      data-theme="dark"
      data-hydro-theme="dark"
      data-sheet-open={isAnySheetOpen ? 'true' : undefined}
      data-scroll-locked={isAnySheetOpen ? 'true' : undefined}
      data-scrolled={isScrolled ? 'true' : undefined}
      data-testid="mobile-cargo-list-lab"
    >
      <header
        className={styles.compactHeader}
        data-visible={isScrolled ? 'true' : 'false'}
        hidden={!isScrolled || isAnySheetOpen}
        data-testid="cargo-lab-compact-header"
      >
        <div className={styles.compactHeaderInner}>
          <span className={styles.compactHeaderSpacer} aria-hidden />
          <h1 className={styles.compactTitle}>{t('title')}</h1>
          <MobileCargoFilterButton
            buttonRef={compactFilterButtonRef}
            activeCount={activeFilterCount}
            ariaLabel={t('filterShortcutAria')}
            className={styles.compactFilterButton}
            onClick={handleCompactFilterShortcut}
          />
        </div>
      </header>

      <main className={styles.viewport} inert={isAnySheetOpen ? true : undefined}>
        <section className={styles.listSection} aria-label={t('listAria')}>
          <div
            ref={listScrollerRef}
            className={styles.listScroller}
            data-testid="cargo-lab-list-scroller"
            onScroll={handleScrollerScroll}
          >
            <header className={styles.header} data-testid="cargo-lab-header">
              <div className={styles.headerRow}>
                <div className={styles.titleBlock}>
                  <h1 className={styles.largeTitle}>{t('title')}</h1>
                  <p className={styles.subtitle}>{headerSubtitle}</p>
                </div>
                <MobileCargoFilterButton
                  buttonRef={headerFilterButtonRef}
                  activeCount={activeFilterCount}
                  ariaLabel={t('filterShortcutAria')}
                  className={styles.headerFilterButton}
                  onClick={handleFilterShortcut}
                />
              </div>
            </header>

            <div className={styles.controls}>
              <label className={styles.searchField}>
                <span className={styles.searchIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="7.75" cy="7.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M12 12L16 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  className={styles.searchInput}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAria')}
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query.trim().length > 0 ? (
                  <button
                    type="button"
                    className={styles.searchClearButton}
                    aria-label={t('searchClearAria')}
                    onClick={() => setQuery('')}
                  >
                    <span aria-hidden>×</span>
                  </button>
                ) : null}
              </label>

              <div
                ref={filtersRef}
                className={styles.filterScroll}
                data-testid="cargo-lab-filter-scroll"
                role="tablist"
                aria-label={t('filtersAria')}
              >
                <div className={styles.filterChips}>
                  {filterChipItems.map((chip) => {
                    const isActive = statusFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={styles.filterChip}
                        data-active={isActive ? 'true' : undefined}
                        disabled={chip.disabled}
                        onClick={() =>
                          handleStatusChipChange(chip.id as MobileCargoStatusFilter)
                        }
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {listItems.length === 0 ? (
              <MobileCargoLabEmptyState
                title={hasActiveFilters ? t('emptyFilteredTitle') : t('emptyTitle')}
                description={
                  hasActiveFilters ? t('emptyFilteredDescription') : t('emptyDescription')
                }
                clearLabel={t('clearFiltersAction')}
                onClear={handleClearFilters}
              />
            ) : (
              <div className={styles.list} data-testid="cargo-lab-list">
                {listItems.map((item) => (
                  <MobileCargoLabCard
                    key={item.id}
                    item={item}
                    routeOriginLabel={t('routeOrigin')}
                    routeDestinationLabel={t('routeDestination')}
                    onPress={(cardItem) => {
                      setSelectedCargo(cardItem);
                      setLastFocusedCardId(cardItem.id);
                      setActiveSheet('actions');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {!isAnySheetOpen ? (
        <div className={styles.dockHost} data-testid="cargo-lab-bottom-dock">
          <LiquidGlassBottomDock
            items={dockItems}
            activeId={dockActiveId}
            tone="dark"
            aria-label={t('dock.aria')}
            onChange={handleDockChange}
          />
        </div>
      ) : null}

      <LiquidGlassSheet
        open={isActionSheetOpen}
        tone="dark"
        placement="bottom"
        draggable
        defaultSnapPoint="content"
        snapPoints={['content']}
        closeLabel={t('actionSheet.close')}
        onClose={handleActionSheetClose}
        className={styles.sheetOverlay}
        contentClassName={styles.sheetContent}
      >
        <header className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>{sheetTitle}</h2>
          {selectedCargo ? (
            <p className={styles.sheetSubtitle}>
              <span className={styles.sheetLeadCode}>{selectedCargo.displayCode}</span>
              <span className={styles.sheetLeadDot} aria-hidden>
                ·
              </span>
              <span>{selectedCargo.statusLabel}</span>
            </p>
          ) : null}
        </header>

        <div className={styles.sheetActionGroup}>
          <div className={styles.sheetList}>
            {actionItems.map((action, index) => {
              const isOverview = action.id === 'overview';
              const isDisabled = Boolean(action.disabled || action.comingSoon);
              const isLast = index === actionItems.length - 1;
              return (
                <button
                  key={action.id}
                  type="button"
                  className={styles.sheetRow}
                  data-overview={isOverview && !isDisabled ? 'true' : undefined}
                  data-last={isLast ? 'true' : undefined}
                  onClick={() => handleActionClick(action)}
                  disabled={isDisabled}
                  aria-disabled={isDisabled || undefined}
                >
                  <span className={styles.sheetRowCopy}>
                    <span className={styles.sheetRowLabel}>{action.label}</span>
                    {action.description ? (
                      <span className={styles.sheetRowDescription}>{action.description}</span>
                    ) : null}
                  </span>
                  {action.comingSoon ? (
                    <span className={styles.sheetRowHint}>{t('actionSheet.comingSoon')}</span>
                  ) : isOverview && !isDisabled ? (
                    <span className={styles.sheetRowChevron} aria-hidden>
                      ›
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </LiquidGlassSheet>

      <LiquidGlassSheet
        open={isFilterSheetOpen}
        tone="dark"
        placement="bottom"
        draggable={false}
        closeLabel={t('actionSheet.close')}
        onClose={handleFilterSheetClose}
        className={styles.sheetOverlay}
        contentClassName={styles.sheetContent}
      >
        <header className={styles.filterSheetHeader}>
          <h2 className={styles.filterSheetTitle}>{t('filterSheet.title')}</h2>
          <p className={styles.filterSheetSubtitle}>{t('filterSheet.subtitle')}</p>
        </header>

        <div className={styles.filterSheetBody} data-testid="cargo-lab-filter-sheet">
          <section className={styles.filterSheetSection}>
            <h3 className={styles.filterSheetSectionTitle}>{t('filterSheet.statusSection')}</h3>
            <div className={styles.filterSheetChips}>
              {filterChipItems.map((chip) => {
                const isActive = statusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={styles.filterSheetChip}
                    data-active={isActive ? 'true' : undefined}
                    disabled={chip.disabled}
                    onClick={() => handleStatusChipChange(chip.id as MobileCargoStatusFilter)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.filterSheetSection}>
            <h3 className={styles.filterSheetSectionTitle}>{t('filterSheet.attentionSection')}</h3>
            <button
              type="button"
              className={styles.filterSheetToggle}
              data-active={advancedFilters.attentionOnly ? 'true' : undefined}
              onClick={() =>
                setAdvancedFilters((current) => ({
                  ...current,
                  attentionOnly: !current.attentionOnly,
                }))
              }
            >
              {t('filterSheet.attentionOnly')}
            </button>
          </section>

          {locationOptions.origins.length > 0 ? (
            <section className={styles.filterSheetSection}>
              <h3 className={styles.filterSheetSectionTitle}>{t('filterSheet.originSection')}</h3>
              <div className={styles.filterSheetChips}>
                {locationOptions.origins.map((origin) => {
                  const isActive = advancedFilters.origins.includes(origin);
                  return (
                    <button
                      key={origin}
                      type="button"
                      className={styles.filterSheetChip}
                      data-active={isActive ? 'true' : undefined}
                      onClick={() => toggleLocationFilter('origins', origin)}
                    >
                      {origin}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {locationOptions.destinations.length > 0 ? (
            <section className={styles.filterSheetSection}>
              <h3 className={styles.filterSheetSectionTitle}>
                {t('filterSheet.destinationSection')}
              </h3>
              <div className={styles.filterSheetChips}>
                {locationOptions.destinations.map((destination) => {
                  const isActive = advancedFilters.destinations.includes(destination);
                  return (
                    <button
                      key={destination}
                      type="button"
                      className={styles.filterSheetChip}
                      data-active={isActive ? 'true' : undefined}
                      onClick={() => toggleLocationFilter('destinations', destination)}
                    >
                      {destination}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className={styles.filterSheetFooter}>
            <button
              type="button"
              className={styles.filterSheetClearButton}
              onClick={handleClearFilters}
            >
              {t('filterSheet.clear')}
            </button>
          </div>
        </div>
      </LiquidGlassSheet>

      <LiquidGlassSheet
        open={isMapHintOpen}
        tone="dark"
        placement="bottom"
        draggable={false}
        closeLabel={t('actionSheet.close')}
        onClose={handleMapHintClose}
        className={styles.sheetOverlay}
        contentClassName={styles.sheetContent}
      >
        <header className={styles.filterSheetHeader}>
          <h2 className={styles.filterSheetTitle}>{t('mapHint.title')}</h2>
          <p className={styles.filterSheetSubtitle}>{t('mapHint.description')}</p>
        </header>
      </LiquidGlassSheet>
    </div>
  );
}
