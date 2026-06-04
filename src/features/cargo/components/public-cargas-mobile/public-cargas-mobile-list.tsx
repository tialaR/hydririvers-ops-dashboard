'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Plus, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo, CargoStatus, Negotiation, Vessel } from '@/features/marketplace/domain/marketplace.types';
import { CargoCard } from '@/features/cargo/components/cargo-card';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';
import { mapMarketplaceCargoToLabV2 } from '@/features/cargo/utils/map-marketplace-cargo-to-lab-v2';
import { parseCargoEtaMeta } from '@/features/cargo/utils/parse-cargo-eta-meta';
import { Button } from '@/shared/components/button';
import { IconButton } from '@/shared/components/icon-button';
import { SearchField } from '@/shared/components/search-field';
import { intlAppPaths } from '@/shared/routing/app-routes';

import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import { PublicCargoActionSheet } from './public-cargo-action-sheet';
import { useMobileShellChrome } from '@/shared/layout/mobile-product-shell';
import { PublicCargasMobileFilterSheet, type PublicCargasFilterOption } from './public-cargas-mobile-filter-sheet';
import styles from './public-cargas-mobile-list.module.scss';

const MOBILE_INITIAL_VISIBLE_COUNT = 8;
const MOBILE_VISIBLE_INCREMENT = 6;
const FILTER_SHEET_EXIT_MS = 220;

type AdvancedFilters = {
  corridor: string[];
  origin: string[];
  destination: string[];
  type: string[];
  document: string[];
};

export type PublicCargasMobileListProps = {
  locale: string;
  filteredCargoes: Cargo[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: 'all' | CargoStatus;
  onStatusFilterToggle: (status: 'all' | CargoStatus) => void;
  advancedFilters: AdvancedFilters;
  onToggleAdvancedFilter: (
    key: keyof AdvancedFilters,
    value: string,
    selection: 'multi' | 'single',
  ) => void;
  activeFilters: number;
  hasAppliedFilters: boolean;
  onResetFilters: () => void;
  onSyncListViewport: () => void;
  negotiations: Negotiation[];
  vessels: Vessel[];
  filterOptions: {
    corridor: string[];
    origin: string[];
    destination: string[];
    type: string[];
    document: string[];
  };
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M7 12h10M10 17h4" />
      <circle cx="16" cy="7" r="1.7" />
      <circle cx="9" cy="12" r="1.7" />
      <circle cx="13" cy="17" r="1.7" />
    </svg>
  );
}

function vesselName(cargo: Cargo, negotiations: Negotiation[], vessels: Vessel[]) {
  const negotiation = negotiations.find(
    (item) => item.cargoId === cargo.id || item.cargoTitle === cargo.title,
  );
  const vessel = vessels.find(
    (item) => item.id === negotiation?.vesselId || item.name === negotiation?.vesselName,
  );
  return vessel?.name || negotiation?.vesselName || cargo.serviceType || '';
}

function toFilterOptions(values: string[]): PublicCargasFilterOption[] {
  return values.map((value) => ({ value, label: value }));
}

export function PublicCargasMobileList({
  locale,
  filteredCargoes,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterToggle,
  advancedFilters,
  onToggleAdvancedFilter,
  activeFilters,
  hasAppliedFilters,
  onResetFilters,
  onSyncListViewport,
  negotiations,
  vessels,
  filterOptions,
}: PublicCargasMobileListProps) {
  const tBoard = useTranslations('operationsBoard');
  const tCommon = useTranslations('common');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFilterClosing, setIsFilterClosing] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoLabV2 | null>(null);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_INITIAL_VISIBLE_COUNT);
  const mobileListSentinelRef = useRef<HTMLDivElement | null>(null);
  const filterCloseTimerRef = useRef<number | null>(null);
  const { setBottomNavSuppressed } = useMobileShellChrome();

  const visibleCargoes = filteredCargoes.slice(0, mobileVisibleCount);
  const hasMoreCargoes = mobileVisibleCount < filteredCargoes.length;

  const statusOptions = useMemo<PublicCargasFilterOption[]>(
    () => [
      { value: 'all', label: tBoard('statusFilters.all') },
      { value: 'open', label: tBoard('statusFilters.open') },
      { value: 'bidding', label: tBoard('statusFilters.bidding') },
      { value: 'contracting', label: tBoard('statusFilters.contracting') },
      { value: 'reserved', label: tBoard('statusFilters.reserved') },
      { value: 'boarded', label: tBoard('statusFilters.boarded') },
    ],
    [tBoard],
  );

  useEffect(() => {
    return () => {
      if (filterCloseTimerRef.current !== null) {
        window.clearTimeout(filterCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setBottomNavSuppressed(drawerOpen || isFilterClosing || Boolean(selectedCargo));
    return () => setBottomNavSuppressed(false);
  }, [drawerOpen, isFilterClosing, selectedCargo, setBottomNavSuppressed]);

  useEffect(() => {
    if (!hasMoreCargoes || !mobileListSentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setMobileVisibleCount((current) =>
          Math.min(current + MOBILE_VISIBLE_INCREMENT, filteredCargoes.length),
        );
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );

    observer.observe(mobileListSentinelRef.current);
    return () => observer.disconnect();
  }, [filteredCargoes.length, hasMoreCargoes]);

  function resetVisibleCount() {
    setMobileVisibleCount(MOBILE_INITIAL_VISIBLE_COUNT);
  }

  function openFilterSheet() {
    if (filterCloseTimerRef.current !== null) {
      window.clearTimeout(filterCloseTimerRef.current);
      filterCloseTimerRef.current = null;
    }

    setIsFilterClosing(false);
    setDrawerOpen(true);
  }

  function closeFilterSheet() {
    if (!drawerOpen || isFilterClosing) {
      return;
    }

    setIsFilterClosing(true);
    filterCloseTimerRef.current = window.setTimeout(() => {
      setDrawerOpen(false);
      setIsFilterClosing(false);
      filterCloseTimerRef.current = null;
    }, FILTER_SHEET_EXIT_MS);
  }

  function handleFilterSheetOpenChange(open: boolean) {
    if (open) {
      openFilterSheet();
      return;
    }

    closeFilterSheet();
  }

  function handleClearFilters() {
    resetVisibleCount();
    onResetFilters();
    closeFilterSheet();
  }

  function handleQueryChange(value: string) {
    resetVisibleCount();
    onQueryChange(value);
    onSyncListViewport();
  }

  function handleStatusToggle(status: 'all' | CargoStatus) {
    resetVisibleCount();
    onStatusFilterToggle(status);
    onSyncListViewport();
  }

  function handleAdvancedFilterToggle(
    key: keyof AdvancedFilters,
    value: string,
    selection: 'multi' | 'single',
  ) {
    resetVisibleCount();
    onToggleAdvancedFilter(key, value, selection);
    onSyncListViewport();
  }

  return (
    <>
    <section
      className={cargoDsV2ThemeRootClassName(styles.root)}
      data-theme="light"
      data-public-cargas-mobile="true"
      aria-label={tBoard('list.title')}
    >
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerCopy}>
              <h1>{tBoard('list.title')}</h1>
              <p>{tBoard('filters.results', { count: filteredCargoes.length })}</p>
              {hasAppliedFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetVisibleCount();
                    onResetFilters();
                  }}
                >
                  {tBoard('filters.mobileClearAction')}
                </Button>
              ) : null}
            </div>

            <div className={styles.headerActions}>
              <IconButton
                className={styles.headerButton}
                variant="default"
                ariaLabel={
                  activeFilters > 0
                    ? tBoard('filters.activeCount', { count: activeFilters })
                    : tBoard('list.filterAria')
                }
                icon={<FilterIcon />}
                badgeCount={activeFilters > 0 ? activeFilters : undefined}
                onClick={() => {
                  if (drawerOpen) {
                    closeFilterSheet();
                    return;
                  }

                  openFilterSheet();
                }}
              />
              <Link href={intlAppPaths.cargos.publishCargo} className={styles.publishLink}>
                <Plus size={15} aria-hidden />
                <span>{tBoard('list.newCargo')}</span>
              </Link>
            </div>
          </div>

          <div className={styles.searchRow}>
            <SearchField
              className={styles.searchField}
              value={query}
              onChange={handleQueryChange}
              placeholder={tBoard('list.publicMobileSearchPlaceholder')}
              ariaLabel={tBoard('list.searchAria')}
              icon={<SearchIcon />}
            />
            <IconButton
              className={styles.filterSquare}
              variant="filter"
              ariaLabel={tBoard('list.filterAria')}
              icon={<SlidersHorizontal size={18} />}
              onClick={() => {
                if (drawerOpen) {
                  closeFilterSheet();
                  return;
                }

                openFilterSheet();
              }}
            />
          </div>
        </header>

        <div className={styles.cargoList}>
          {visibleCargoes.length ? (
            visibleCargoes.map((cargo, index) => {
              const { etaLabel, confidenceLabel } = parseCargoEtaMeta(
                cargo.etaConfidence,
                tBoard,
                tCommon,
              );
              const labCargo = mapMarketplaceCargoToLabV2(cargo, {
                statusLabel: tCommon(`cargoStatus.${cargo.status}`),
                vesselLabel: vesselName(cargo, negotiations, vessels),
                etaLabel,
                deliveryLabel:
                  confidenceLabel ||
                  (cargo.window ? tBoard('misc.arrivalLabel', { value: cargo.window }) : ''),
              });

              return (
                <CargoCard
                  key={cargo.id}
                  cargo={labCargo}
                  index={index}
                  className={styles.cargoCard}
                  actionLabel={tBoard('list.cardActionRoute')}
                  primaryActionHref={intlAppPaths.cargos.cargoMap(labCargo.id)}
                  onClick={() => setSelectedCargo(labCargo)}
                />
              );
            })
          ) : (
            <div className={styles.emptyState} role="status">
              <AlertCircle size={22} aria-hidden="true" />
              <h3>
                {hasAppliedFilters ? tBoard('list.emptyFilteredTitle') : tBoard('list.emptyTitle')}
              </h3>
              <p>
                {hasAppliedFilters
                  ? tBoard('list.emptyFilteredDescription')
                  : tBoard('list.emptyDescription')}
              </p>
              {hasAppliedFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetVisibleCount();
                    onResetFilters();
                  }}
                >
                  {tBoard('list.clearFiltersAction')}
                </Button>
              ) : null}
            </div>
          )}

          {hasMoreCargoes ? (
            <div ref={mobileListSentinelRef} className={styles.listSentinel} aria-hidden />
          ) : null}
        </div>
      </div>

      {selectedCargo ? (
        <PublicCargoActionSheet
          cargo={selectedCargo}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCargo(null);
            }
          }}
        />
      ) : null}

      <PublicCargasMobileFilterSheet
        open={drawerOpen}
        isClosing={isFilterClosing}
        resultCount={filteredCargoes.length}
        statusOptions={statusOptions}
        statusFilter={statusFilter}
        corridorOptions={toFilterOptions(filterOptions.corridor)}
        corridorFilter={advancedFilters.corridor}
        originOptions={toFilterOptions(filterOptions.origin)}
        originFilter={advancedFilters.origin}
        destinationOptions={toFilterOptions(filterOptions.destination)}
        destinationFilter={advancedFilters.destination}
        typeOptions={toFilterOptions(filterOptions.type)}
        typeFilter={advancedFilters.type}
        documentOptions={toFilterOptions(filterOptions.document)}
        documentFilter={advancedFilters.document}
        onOpenChange={handleFilterSheetOpenChange}
        onStatusToggle={(value) => handleStatusToggle(value as 'all' | CargoStatus)}
        onCorridorToggle={(value) => handleAdvancedFilterToggle('corridor', value, 'single')}
        onOriginToggle={(value) => handleAdvancedFilterToggle('origin', value, 'multi')}
        onDestinationToggle={(value) => handleAdvancedFilterToggle('destination', value, 'multi')}
        onTypeToggle={(value) => handleAdvancedFilterToggle('type', value, 'multi')}
        onDocumentToggle={(value) => handleAdvancedFilterToggle('document', value, 'multi')}
        onClearFilters={handleClearFilters}
        onApplyFilters={closeFilterSheet}
      />
    </section>
    </>
  );
}
