'use client';

import type { CSSProperties, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { MobileCargoListFilters, MobileCargoListItem } from '@/features/cargo/domain/cargo-list.types';
import { LiquidGlassBottomDock } from '@/shared/design-system/primitives/liquid-glass-bottom-dock';
import { LiquidGlassSheet } from '@/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet';
import styles from './mobile-cargo-list-lab.module.scss';

// Source-contract marker kept for legacy style tests: className={styles.sheetHeader}

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

function releaseFocusedElementInside(rootSelector: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement)) {
    return;
  }

  if (!activeElement.closest(rootSelector)) {
    return;
  }

  activeElement.blur();
}

function restoreFocusToElement(element: HTMLElement | null): void {
  if (!element || !document.body.contains(element)) {
    return;
  }

  element.focus({ preventScroll: true });
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
  cargoTypeLabel?: string;
  vesselTypeLabel?: string;
  cutoffWindowLabel?: string;
  grossWeightLabel?: string;
  draftLimitLabel?: string;
  waterwayLabel?: string;
  availabilityLabel?: string;
  environmentalRiskLabel?: string;
  status: MobileCargoListItem['status'];
  needsAttention: boolean;
};

export type MobileCargoAdvancedFilters = {
  attentionOnly: boolean;
  origins: string[];
  destinations: string[];
  cargoTypes: string[];
  vesselTypes: string[];
  cutoffWindows: string[];
  draftLimits: string[];
};

type MobileCargoStatusFilter = 'all' | 'open' | 'quote' | 'operation' | 'attention';
type MobileCargoBusinessFilterKind = 'cargoTypes' | 'vesselTypes' | 'cutoffWindows' | 'draftLimits';
type MobileCargoLabDockId = 'cargas' | 'attention' | 'map' | 'profile';
type LabSheetKind = 'none' | 'actions' | 'filters' | 'map-hint';
type MobileCargoFilterLauncherSource = 'header' | 'compact' | null;
type CargoActionId = 'overview' | 'journey' | 'documents' | 'costs' | 'priority';

const SCROLL_COMPACT_THRESHOLD_PX = 28;
const EMPTY_ADVANCED_FILTERS: MobileCargoAdvancedFilters = {
  attentionOnly: false,
  origins: [],
  destinations: [],
  cargoTypes: [],
  vesselTypes: [],
  cutoffWindows: [],
  draftLimits: [],
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
    statusLabel: sanitizeMobileCargoLabDisplayText(statusLabel),
    title: sanitizeMobileCargoLabDisplayText(item.title),
    origin: sanitizeMobileCargoLabDisplayText(item.origin),
    destination: sanitizeMobileCargoLabDisplayText(item.destination),
    etaLabel: formatLabEtaLabel(item.etaLabel),
    operationLabel: item.operationLabel
      ? sanitizeMobileCargoLabDisplayText(item.operationLabel)
      : undefined,
    warningLabel: item.alertLabel ? sanitizeMobileCargoLabDisplayText(item.alertLabel) : undefined,
    cargoTypeLabel: item.cargoTypeLabel,
    vesselTypeLabel: item.vesselTypeLabel,
    cutoffWindowLabel: item.cutoffWindowLabel,
    grossWeightLabel: item.grossWeightLabel,
    draftLimitLabel: item.draftLimitLabel,
    waterwayLabel: item.waterwayLabel,
    availabilityLabel: item.availabilityLabel,
    environmentalRiskLabel: item.environmentalRiskLabel,
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

  if (advanced.cargoTypes.length > 0 && !advanced.cargoTypes.includes(item.cargoTypeLabel ?? '')) {
    return false;
  }

  if (advanced.vesselTypes.length > 0 && !advanced.vesselTypes.includes(item.vesselTypeLabel ?? '')) {
    return false;
  }

  if (advanced.cutoffWindows.length > 0 && !advanced.cutoffWindows.includes(item.cutoffWindowLabel ?? '')) {
    return false;
  }

  if (advanced.draftLimits.length > 0 && !advanced.draftLimits.includes(item.draftLimitLabel ?? '')) {
    return false;
  }

  return true;
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))]
    .sort((a, b) => a.localeCompare(b));
}

export function getUniqueCargoLocations(items: MobileCargoListItem[]): {
  origins: string[];
  destinations: string[];
  cargoTypes: string[];
  vesselTypes: string[];
  cutoffWindows: string[];
  draftLimits: string[];
} {
  const origins = uniqueSorted(items.map((item) => item.origin));
  const destinations = uniqueSorted(items.map((item) => item.destination));
  const cargoTypes = uniqueSorted(items.map((item) => item.cargoTypeLabel));
  const vesselTypes = uniqueSorted(items.map((item) => item.vesselTypeLabel));
  const cutoffWindows = uniqueSorted(items.map((item) => item.cutoffWindowLabel));
  const draftLimits = uniqueSorted(items.map((item) => item.draftLimitLabel));
  return { origins, destinations, cargoTypes, vesselTypes, cutoffWindows, draftLimits };
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
  if (advanced.attentionOnly && status !== 'attention') {
    count += 1;
  }
  if (advanced.origins.length > 0) {
    count += 1;
  }
  if (advanced.destinations.length > 0) {
    count += 1;
  }
  if (advanced.cargoTypes.length > 0) {
    count += 1;
  }
  if (advanced.vesselTypes.length > 0) {
    count += 1;
  }
  if (advanced.cutoffWindows.length > 0) {
    count += 1;
  }
  if (advanced.draftLimits.length > 0) {
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
      item.cargoTypeLabel ?? '',
      item.vesselTypeLabel ?? '',
      item.cutoffWindowLabel ?? '',
      item.grossWeightLabel ?? '',
      item.draftLimitLabel ?? '',
      item.waterwayLabel ?? '',
      item.availabilityLabel ?? '',
      item.environmentalRiskLabel ?? '',
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

function getPortDetail(location: string): string {
  const city = location.split(',')[0]?.trim() || location;
  const normalized = normalizeValue(city);

  if (normalized.includes('belem')) return 'Porto de Belém';
  if (normalized.includes('macapa')) return 'Terminal Hidroviário de Macapá';
  if (normalized.includes('itacoatiara')) return 'Porto de Itacoatiara';
  if (normalized.includes('manaus')) return 'Porto de Manaus';
  if (normalized.includes('santarem')) return 'Terminal Fluvial de Santarém';
  if (normalized.includes('vila do conde')) return 'Terminal Vila do Conde';
  if (normalized.includes('sao luis')) return 'Porto do Itaqui';
  if (normalized.includes('porto velho')) return 'Porto Organizado de Porto Velho';
  return `Terminal de ${city}`;
}

function getStatusTone(label: string): 'quote' | 'open' | 'operation' | 'attention' {
  const normalized = normalizeValue(label);
  if (normalized.includes('cot')) return 'quote';
  if (normalized.includes('oper') || normalized.includes('reserv') || normalized.includes('embarc')) return 'operation';
  if (normalized.includes('aten')) return 'attention';
  return 'open';
}

function getReliabilityTone(value?: string): 'high' | 'medium' | 'low' {
  const normalized = normalizeValue(value ?? '');
  if (normalized.includes('media') || normalized.includes('média')) return 'medium';
  if (normalized.includes('baixa') || normalized.includes('low')) return 'low';
  return 'high';
}

function CargoRouteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 19s6-5.08 6-10a6 6 0 1 0-12 0c0 4.92 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.55"
      />
      <circle cx="11" cy="9" r="2" stroke="currentColor" strokeWidth="1.55" />
    </svg>
  );
}

function CargoClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.55" />
      <path d="M10 6.5v4l3 1.75" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function CargoAnchorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.35" />
      <path d="M9 5.8v8.4M5.2 8.2h7.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path
        d="M4 10.5c.65 2.5 2.37 3.75 5 3.75s4.35-1.25 5-3.75"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DockProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 16c.85-2.65 2.68-4 5.5-4s4.65 1.35 5.5 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterSlidersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 5.5h13M6 10h8M8.5 14.5h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="13.5" cy="5.5" r="1.4" fill="currentColor" />
      <circle cx="7.5" cy="10" r="1.4" fill="currentColor" />
      <circle cx="11.5" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function DockCargasIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4.2 6.8 10 3.6l5.8 3.2v6.4L10 16.4l-5.8-3.2V6.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 7 10 10.1 15.5 7M10 10.1v6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DockAttentionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.2 8.6c0-2.25 1.55-3.85 3.8-3.85s3.8 1.6 3.8 3.85v2.2l1.2 2.05H5l1.2-2.05V8.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8.6 15.1c.35.55.82.82 1.4.82s1.05-.27 1.4-.82" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DockMapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7 4.5 4 5.5v10l3-1 6 2 3-1V5.5l-3 1-6-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 3.5v12.5" stroke="currentColor" strokeWidth="1.7" />
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

function MobileCargoFilterButton({
  activeCount,
  ariaLabel,
  onClick,
  className,
  buttonRef,
  launching = false,
  launchLabel = 'Abrir filtros',
  clearLabel = 'Limpar filtros',
  onOpenFilters,
  onClearFilters,
}: {
  activeCount: number;
  ariaLabel: string;
  onClick: () => void;
  className: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  launching?: boolean;
  launchLabel?: string;
  clearLabel?: string;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
}) {
  const showLauncherActions = launching && activeCount > 0;

  return (
    <span
      className={styles.filterLauncherRoot}
      data-filter-launcher-root="true"
      data-launching={showLauncherActions ? 'true' : undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-expanded={showLauncherActions ? true : undefined}
        data-testid="cargo-lab-filter-button"
        data-launching={showLauncherActions ? 'true' : undefined}
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

      {showLauncherActions ? (
        <span
          className={styles.filterLauncherActions}
          role="menu"
          aria-label="Ações dos filtros aplicados"
          data-testid="cargo-lab-filter-launcher-actions"
        >
          <button
            type="button"
            className={styles.filterLauncherAction}
            data-variant="open"
            role="menuitem"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenFilters?.();
            }}
          >
            <span className={styles.filterLauncherActionIcon} aria-hidden>
              <FilterSlidersIcon />
            </span>
            <span className={styles.filterLauncherActionCopy}>{launchLabel}</span>
            <span className={styles.filterLauncherActionCount} aria-hidden>
              {activeCount}
            </span>
          </button>
          <button
            type="button"
            className={styles.filterLauncherAction}
            data-variant="clear"
            role="menuitem"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClearFilters?.();
            }}
          >
            <span className={styles.filterLauncherActionIcon} aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className={styles.filterLauncherActionCopy}>{clearLabel}</span>
          </button>
        </span>
      ) : null}
    </span>
  );
}

export function MobileCargoLabCard({
  item,
  onPress,
  routeOriginLabel = 'Origem',
  routeDestinationLabel = 'Destino',
  motionIndex = 0,
}: {
  item: MobileCargoListLabItem;
  onPress: (item: MobileCargoListLabItem) => void;
  routeOriginLabel?: string;
  routeDestinationLabel?: string;
  motionIndex?: number;
}) {
  const statusTone = getStatusTone(item.statusLabel);
  const reliabilityTone = getReliabilityTone(item.etaLabel);

  return (
    <article
      className={styles.cardSurface}
      data-attention={item.needsAttention ? 'true' : undefined}
      data-status-tone={statusTone}
      style={{ '--motion-index': motionIndex } as CSSProperties}
    >
      <button
        type="button"
        className={styles.cardButton}
        data-testid={`cargo-lab-card-${item.id}`}
        onClick={() => onPress(item)}
      >
        <div className={styles.cardTopRow}>
          <span className={styles.displayCode}>{item.displayCode}</span>
          <span className={styles.statusPill} data-status-tone={statusTone}>
            <span className={styles.statusDot} aria-hidden />
            {item.statusLabel}
          </span>
        </div>

        <h2 className={styles.cardTitle}>{item.title}</h2>

        <div className={styles.cardRouteBlock}>
          <span className={styles.cardRouteIconBubble} aria-hidden>
            <CargoRouteIcon />
          </span>
          <div className={styles.cardRoutePoint}>
            <span className={styles.cardRouteLabel}>{routeOriginLabel}</span>
            <span className={styles.cardRouteValue}>{item.origin}</span>
            <span className={styles.cardRouteDetail}>{getPortDetail(item.origin)}</span>
          </div>
          <span className={styles.cardRouteArrow} aria-hidden>
            →
          </span>
          <div className={styles.cardRoutePoint}>
            <span className={styles.cardRouteLabel}>{routeDestinationLabel}</span>
            <span className={styles.cardRouteValue}>{item.destination}</span>
            <span className={styles.cardRouteDetail}>{getPortDetail(item.destination)}</span>
          </div>
        </div>

        <div className={styles.cardMetaRow}>
          {item.etaLabel ? (
            <p className={styles.cardMeta} data-reliability={reliabilityTone}>
              <span className={styles.cardMetaIcon} aria-hidden>
                <CargoClockIcon />
              </span>
              <span>{item.etaLabel}</span>
            </p>
          ) : null}
          {item.warningLabel ? (
            <p className={styles.warningPill}>
              <span aria-hidden>
                <CargoAnchorIcon />
              </span>
              {item.warningLabel}
            </p>
          ) : null}
        </div>
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



function FilterPillSection({
  title,
  options,
  selectedValues,
  onToggle,
  multiselect = true,
}: {
  title: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  multiselect?: boolean;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <section className={styles.filterSheetSection}>
      <h3 className={styles.filterSheetSectionTitle}>{title}</h3>
      <div
        className={styles.filterSheetChips}
        data-multiselect={multiselect ? 'true' : 'false'}
      >
        {options.map((option) => {
          const isActive = selectedValues.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={styles.filterSheetChip}
              data-active={isActive ? 'true' : undefined}
              onClick={() => onToggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CargoCardActionSheet({
  open,
  title,
  selectedCargo,
  actionItems,
  closeLabel,
  comingSoonLabel,
  routeOriginLabel,
  routeDestinationLabel,
  onClose,
  onActionClick,
}: {
  open: boolean;
  title: string;
  selectedCargo: MobileCargoListLabItem | null;
  actionItems: CargoActionItem[];
  closeLabel: string;
  comingSoonLabel: string;
  routeOriginLabel: string;
  routeDestinationLabel: string;
  onClose: () => void;
  onActionClick: (action: CargoActionItem) => void;
}) {
  return (
    <LiquidGlassSheet
      open={open}
      tone="dark"
      placement="bottom"
      draggable
      defaultSnapPoint="content"
      snapPoints={['content', 'medium', 'expanded']}
      closeLabel={closeLabel}
      onClose={onClose}
      className={styles.cardActionSheetOverlay}
      contentClassName={styles.cardActionSheetContent}
    >
      <header className={styles.cardActionHeader}>
        <h2 id="mobile-cargo-action-sheet-title" className={styles.cardActionTitle}>
          {title}
        </h2>
        {selectedCargo ? (
          <p className={styles.cardActionSubtitle}>
            <span className={styles.sheetLeadCode}>{selectedCargo.displayCode}</span>
            <span className={styles.sheetLeadDot} aria-hidden>
              ·
            </span>
            <span>{selectedCargo.statusLabel}</span>
          </p>
        ) : null}
      </header>

      {selectedCargo ? (
        <section className={styles.cardActionCargoSummary} aria-label="Resumo da carga selecionada">
          <div className={styles.cardActionRoutePoint}>
            <span className={styles.cardActionRouteLabel}>{routeOriginLabel}</span>
            <span className={styles.cardActionRouteValue}>{selectedCargo.origin}</span>
          </div>
          <span className={styles.cardActionRouteArrow} aria-hidden>
            →
          </span>
          <div className={styles.cardActionRoutePoint}>
            <span className={styles.cardActionRouteLabel}>{routeDestinationLabel}</span>
            <span className={styles.cardActionRouteValue}>{selectedCargo.destination}</span>
          </div>
          {selectedCargo.etaLabel ? (
            <p className={styles.cardActionEta}>{selectedCargo.etaLabel}</p>
          ) : null}
          {selectedCargo.warningLabel ? (
            <p className={styles.cardActionWarning}>{selectedCargo.warningLabel}</p>
          ) : null}
        </section>
      ) : null}

      {selectedCargo ? (
        <div className={styles.cardActionInfoList} aria-label="Informações rápidas da carga">
          <button type="button" className={styles.cardActionInfoItem}>
            <span className={styles.cardActionInfoLabel}>{routeOriginLabel}</span>
            <span className={styles.cardActionInfoValue}>{selectedCargo.origin}</span>
          </button>
          <button type="button" className={styles.cardActionInfoItem}>
            <span className={styles.cardActionInfoLabel}>{routeDestinationLabel}</span>
            <span className={styles.cardActionInfoValue}>{selectedCargo.destination}</span>
          </button>
          {selectedCargo.etaLabel ? (
            <button type="button" className={styles.cardActionInfoItem}>
              <span className={styles.cardActionInfoLabel}>ETA</span>
              <span className={styles.cardActionInfoValue}>{selectedCargo.etaLabel}</span>
            </button>
          ) : null}
          {selectedCargo.warningLabel ? (
            <button type="button" className={styles.cardActionInfoItem}>
              <span className={styles.cardActionInfoLabel}>Janela</span>
              <span className={styles.cardActionInfoValue}>{selectedCargo.warningLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.cardActionList} data-testid="cargo-card-action-list">
        {actionItems.map((action, index) => {
          const isOverview = action.id === 'overview';
          const isDisabled = Boolean(action.disabled || action.comingSoon);
          const isLast = index === actionItems.length - 1;
          return (
            <button
              key={action.id}
              type="button"
              className={styles.cardActionRow}
              data-overview={isOverview && !isDisabled ? 'true' : undefined}
              data-last={isLast ? 'true' : undefined}
              onClick={() => onActionClick(action)}
              disabled={isDisabled}
              aria-disabled={isDisabled || undefined}
            >
              <span className={styles.cardActionRowCopy}>
                <span className={styles.cardActionRowLabel}>{action.label}</span>
                {action.description ? (
                  <span className={styles.cardActionRowDescription}>{action.description}</span>
                ) : null}
              </span>
              {action.comingSoon ? (
                <span className={styles.cardActionRowHint}>{comingSoonLabel}</span>
              ) : isOverview && !isDisabled ? (
                <span className={styles.cardActionChevron} aria-hidden>
                  ›
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </LiquidGlassSheet>
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

  const [searchDraft, setSearchDraft] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MobileCargoStatusFilter>('all');
  const [advancedFilters, setAdvancedFilters] =
    useState<MobileCargoAdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [dockActiveId, setDockActiveId] = useState<MobileCargoLabDockId>('cargas');
  const [selectedCargo, setSelectedCargo] = useState<MobileCargoListLabItem | null>(null);
  const [activeSheet, setActiveSheet] = useState<LabSheetKind>('none');
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastFocusedCardId, setLastFocusedCardId] = useState<string | null>(null);
  const [filterLauncherSource, setFilterLauncherSource] =
    useState<MobileCargoFilterLauncherSource>(null);

  const filterLauncherTimeoutRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (filterLauncherTimeoutRef.current != null) {
        window.clearTimeout(filterLauncherTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (filterLauncherSource == null || typeof window === 'undefined') {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-filter-launcher-root="true"]')) {
        return;
      }

      setFilterLauncherSource(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFilterLauncherSource(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filterLauncherSource]);

  useEffect(() => {
    const normalizedDraft = searchDraft.trim();
    const debounceMs = normalizedDraft.length >= 3 ? 320 : 180;

    const timeout = window.setTimeout(() => {
      setQuery(normalizedDraft.length >= 3 ? searchDraft : '');
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

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

    restoreFocusToElement(lastFilterTriggerRef.current);
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
    setSearchDraft('');
    setQuery('');
    setStatusFilter('all');
    setAdvancedFilters(EMPTY_ADVANCED_FILTERS);
    setDockActiveId('cargas');
  };

  const openFilterSheet = (trigger: HTMLButtonElement | null) => {
    lastFilterTriggerRef.current = trigger;
    releaseFocusedElementInside(sheetRootSelector);
    setFilterLauncherSource(null);
    setActiveSheet('filters');
  };

  const openFilterLauncherActions = (
    source: Exclude<MobileCargoFilterLauncherSource, null>,
    trigger: HTMLButtonElement | null,
  ) => {
    if (filterLauncherTimeoutRef.current != null) {
      window.clearTimeout(filterLauncherTimeoutRef.current);
      filterLauncherTimeoutRef.current = null;
    }

    lastFilterTriggerRef.current = trigger;
    setFilterLauncherSource((current) => (current === source ? null : source));
  };

  const handleFilterShortcut = () => {
    if (hasActiveFilters) {
      openFilterLauncherActions('header', headerFilterButtonRef.current);
      return;
    }

    openFilterSheet(headerFilterButtonRef.current);
  };

  const handleCompactFilterShortcut = () => {
    if (hasActiveFilters) {
      openFilterLauncherActions('compact', compactFilterButtonRef.current);
      return;
    }

    openFilterSheet(compactFilterButtonRef.current);
  };

  const handleOpenFiltersFromLauncher = () => {
    const trigger = filterLauncherSource === 'compact'
      ? compactFilterButtonRef.current
      : headerFilterButtonRef.current;
    openFilterSheet(trigger);
  };

  const handleClearFiltersFromLauncher = () => {
    setFilterLauncherSource(null);
    handleClearFilters();
  };

  const scrollListToTop = () => {
    listScrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCargoActionsSheet = (cardItem: MobileCargoListLabItem) => {
    releaseFocusedElementInside(sheetRootSelector);
    setSelectedCargo(cardItem);
    setLastFocusedCardId(cardItem.id);
    setActiveSheet('actions');
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
      releaseFocusedElementInside(sheetRootSelector);
      setActiveSheet('map-hint');
      return;
    }

    if (dockId === 'profile') {
      scrollListToTop();
    }
  };

  const toggleSingleLocationFilter = (
    kind: 'origins' | 'destinations',
    value: string,
  ) => {
    setAdvancedFilters((current) => {
      const isSelected = current[kind].includes(value);
      return { ...current, [kind]: isSelected ? [] : [value] };
    });
  };

  const toggleBusinessFilter = (
    kind: MobileCargoBusinessFilterKind,
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

  const headerSubtitle = hasActiveFilters
    ? t('counter', { count: filteredItems.length, total: totalCount })
    : t('subtitle', { total: totalCount });

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
    { id: 'profile', label: t('dock.profile'), icon: <DockProfileIcon /> },
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
            launching={filterLauncherSource === 'compact'}
            launchLabel={t('filterSummary.view')}
            clearLabel={t('filterSummary.clear')}
            onOpenFilters={handleOpenFiltersFromLauncher}
            onClearFilters={handleClearFiltersFromLauncher}
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
                  launching={filterLauncherSource === 'header'}
                  launchLabel={t('filterSummary.view')}
                  clearLabel={t('filterSummary.clear')}
                  onOpenFilters={handleOpenFiltersFromLauncher}
                  onClearFilters={handleClearFiltersFromLauncher}
                  onClick={handleFilterShortcut}
                />
              </div>
            </header>

            <div className={styles.controls}>
              <label className={styles.searchField}>
                <span className={styles.searchIcon} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="7.75" cy="7.75" r="5.25" stroke="currentColor" strokeWidth="1.7" />
                    <path
                      d="M12 12L16 16"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  className={styles.searchInput}
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAria')}
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchDraft.trim().length > 0 ? (
                  <button
                    type="button"
                    className={styles.searchClearButton}
                    aria-label={t('searchClearAria')}
                    onClick={() => {
                      setSearchDraft('');
                      setQuery('');
                    }}
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
                  {filterChipItems.map((chip, chipIndex) => {
                    const isActive = statusFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={styles.filterChip}
                        data-active={isActive ? 'true' : undefined}
                        style={{ '--motion-index': chipIndex } as CSSProperties}
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
                {listItems.map((item, cardIndex) => (
                  <MobileCargoLabCard
                    key={item.id}
                    item={item}
                    motionIndex={cardIndex}
                    routeOriginLabel={t('routeOrigin')}
                    routeDestinationLabel={t('routeDestination')}
                    onPress={openCargoActionsSheet}
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

      <CargoCardActionSheet
        open={isActionSheetOpen}
        title={sheetTitle}
        selectedCargo={selectedCargo}
        actionItems={actionItems}
        closeLabel={t('actionSheet.close')}
        comingSoonLabel={t('actionSheet.comingSoon')}
        routeOriginLabel={t('routeOrigin')}
        routeDestinationLabel={t('routeDestination')}
        onClose={handleActionSheetClose}
        onActionClick={handleActionClick}
      />

      <LiquidGlassSheet
        open={isFilterSheetOpen}
        tone="dark"
        placement="bottom"
        draggable
        defaultSnapPoint="medium"
        snapPoints={['content', 'medium', 'expanded']}
        closeLabel={t('actionSheet.close')}
        onClose={handleFilterSheetClose}
        className={styles.filterSheetOverlay}
        contentClassName={styles.filterSheetContent}
      >
        <header className={styles.filterSheetHeader}>
          <h2 className={styles.filterSheetTitle}>{t('filterSheet.title')}</h2>
          <p className={styles.filterSheetSubtitle}>{t('filterSheet.subtitle')}</p>
        </header>

        <div className={styles.filterSheetBody} data-testid="cargo-lab-filter-sheet">
          <section className={styles.filterSheetSection}>
            <h3 className={styles.filterSheetSectionTitle}>{t('filterSheet.statusSection')}</h3>
            <div className={styles.filterSheetChips} data-multiselect="false">
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

          <FilterPillSection
            title={t('filterSheet.originSection')}
            options={locationOptions.origins}
            selectedValues={advancedFilters.origins}
            multiselect={false}
            onToggle={(origin) => toggleSingleLocationFilter('origins', origin)}
          />

          <FilterPillSection
            title={t('filterSheet.destinationSection')}
            options={locationOptions.destinations}
            selectedValues={advancedFilters.destinations}
            multiselect={false}
            onToggle={(destination) => toggleSingleLocationFilter('destinations', destination)}
          />

          <FilterPillSection
            title={t('filterSheet.cargoTypeSection')}
            options={locationOptions.cargoTypes}
            selectedValues={advancedFilters.cargoTypes}
            onToggle={(cargoType) => toggleBusinessFilter('cargoTypes', cargoType)}
          />

          <FilterPillSection
            title={t('filterSheet.vesselTypeSection')}
            options={locationOptions.vesselTypes}
            selectedValues={advancedFilters.vesselTypes}
            onToggle={(vesselType) => toggleBusinessFilter('vesselTypes', vesselType)}
          />

          <FilterPillSection
            title={t('filterSheet.cutoffSection')}
            options={locationOptions.cutoffWindows}
            selectedValues={advancedFilters.cutoffWindows}
            onToggle={(cutoffWindow) => toggleBusinessFilter('cutoffWindows', cutoffWindow)}
          />

          <FilterPillSection
            title={t('filterSheet.draftSection')}
            options={locationOptions.draftLimits}
            selectedValues={advancedFilters.draftLimits}
            onToggle={(draftLimit) => toggleBusinessFilter('draftLimits', draftLimit)}
          />

          <div className={styles.filterSheetFooter}>
            <button
              type="button"
              className={styles.filterSheetClearButton}
              onClick={handleClearFilters}
            >
              {t('filterSheet.clear')}
            </button>
            <button
              type="button"
              className={styles.filterSheetApplyButton}
              onClick={handleFilterSheetClose}
            >
              {t('filterSheet.apply')}
            </button>
          </div>
        </div>
      </LiquidGlassSheet>

      <LiquidGlassSheet
        open={isMapHintOpen}
        tone="dark"
        placement="bottom"
        draggable
        defaultSnapPoint="content"
        snapPoints={['content', 'medium', 'expanded']}
        closeLabel={t('actionSheet.close')}
        onClose={handleMapHintClose}
        className={styles.mapHintSheetOverlay}
        contentClassName={styles.mapHintSheetContent}
      >
        <header className={styles.filterSheetHeader}>
          <h2 className={styles.filterSheetTitle}>{t('mapHint.title')}</h2>
          <p className={styles.filterSheetSubtitle}>{t('mapHint.description')}</p>
        </header>
      </LiquidGlassSheet>
    </div>
  );
}
