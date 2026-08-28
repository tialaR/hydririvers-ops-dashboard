'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { OwnedCargoCard } from '@/features/cargo/owned/components/owned-cargo-card/owned-cargo-card';
import { OwnedCargoListFilters } from '@/features/cargo/owned/components/owned-cargo-list-filters/owned-cargo-list-filters';
import { OwnedCargoMobileFilterSheet } from '@/features/cargo/owned/components/owned-cargo-mobile-filter-sheet/owned-cargo-mobile-filter-sheet';
import { OwnedCargoListSection } from '@/features/cargo/owned/components/owned-cargo-list-section/owned-cargo-list-section';
import { OwnedCargoSummary } from '@/features/cargo/owned/components/owned-cargo-summary/owned-cargo-summary';
import { summarizeOwnedCargoes } from '@/features/cargo/domain/summarize-owned-cargoes';
import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import publicListStyles from '@/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.module.scss';
import { BOTTOM_SHEET_TRANSITION_MS } from '@/shared/components/bottom-sheet';
import { IconButton } from '@/shared/components/icon-button';
import { SearchField } from '@/shared/components/search-field';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { Card } from '@/shared/ui/card/card';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { useMobileShellChrome } from '@/shared/layout/mobile-product-shell';
import { useOwnedCargoListFilter } from '@/features/cargo-market/components/my-cargoes-list/use-owned-cargo-list-filter';
import listStyles from '@/features/cargo-market/components/cargo-list/cargo-list.module.scss';
import styles from './my-cargoes-list.module.sass';

const BOTTOM_SHEET_EXIT_SUPPRESSION_MS = BOTTOM_SHEET_TRANSITION_MS + 48;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function MyCargoesList({
  cargoes: initial,
  createdCargoId,
  canCreateCargo
}: {
  cargoes: Cargo[];
  createdCargoId?: string;
  canCreateCargo: boolean;
}) {
  const t = useTranslations('pages.minhasCargas');
  const items = initial;
  const stats = useMemo(() => summarizeOwnedCargoes(items), [items]);
  const {
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    counts,
    filteredItems,
    hasAppliedFilters,
    clearAllFilters,
  } = useOwnedCargoListFilter(items);
  const shownIds = new Set(items.map((c) => c.id));
  const visibleCount = filteredItems.length;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFilterClosing, setIsFilterClosing] = useState(false);
  const filterCloseTimerRef = useRef<number | null>(null);
  const { setBottomNavSuppressed } = useMobileShellChrome();
  const activeFilterCount = activeFilter !== 'all' ? 1 : 0;
  const isFilterSheetActive = drawerOpen || isFilterClosing;

  useEffect(() => {
    return () => {
      if (filterCloseTimerRef.current !== null) {
        window.clearTimeout(filterCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setBottomNavSuppressed(isFilterSheetActive);
  }, [isFilterSheetActive, setBottomNavSuppressed]);

  useEffect(() => {
    return () => setBottomNavSuppressed(false);
  }, [setBottomNavSuppressed]);

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

    setDrawerOpen(false);
    setIsFilterClosing(true);
    filterCloseTimerRef.current = window.setTimeout(() => {
      setIsFilterClosing(false);
      filterCloseTimerRef.current = null;
    }, BOTTOM_SHEET_EXIT_SUPPRESSION_MS);
  }

  function handleFilterSheetOpenChange(open: boolean) {
    if (open) {
      openFilterSheet();
      return;
    }

    closeFilterSheet();
  }

  function handleClearFilters() {
    clearAllFilters();
    closeFilterSheet();
  }

  return (
    <>
      <section
        className={cargoDsV2ThemeRootClassName(publicListStyles.root)}
        data-theme="light"
        data-minhas-cargas-list="true"
        data-public-cargas-mobile-page-background="none"
        aria-label={t('listSectionAriaLabel')}
      >
        <div className={publicListStyles.shell}>
          {items.length > 0 ? <OwnedCargoSummary stats={stats} /> : null}

          {items.length > 0 ? (
            <header className={publicListStyles.header}>
              <div className={publicListStyles.searchRow} data-testid="minhas-cargas-search">
                <SearchField
                  className={publicListStyles.searchField}
                  value={query}
                  onChange={setQuery}
                  placeholder={t('searchPlaceholder')}
                  ariaLabel={t('searchAria')}
                  icon={<SearchIcon />}
                />
                <IconButton
                  className={publicListStyles.filterSquare}
                  iconButtonRole="field"
                  data-testid="minhas-cargas-filter-button"
                  ariaLabel={
                    activeFilterCount > 0
                      ? t('listFilters.activeCount', { count: activeFilterCount })
                      : t('listFilters.filterAria')
                  }
                  iconName="filter"
                  badgeContent={activeFilterCount > 0 ? activeFilterCount : undefined}
                  onClick={() => {
                    if (drawerOpen) {
                      closeFilterSheet();
                      return;
                    }

                    openFilterSheet();
                  }}
                />
              </div>

              <div className={publicListStyles.resultsMeta}>
                <p className={publicListStyles.resultsLead}>{t('resultCount', { count: visibleCount })}</p>
                {hasAppliedFilters ? (
                  <button
                    type="button"
                    className={publicListStyles.clearFiltersAction}
                    data-testid="minhas-cargas-clear-filters"
                    onClick={clearAllFilters}
                  >
                    {t('listFilters.clearAction')}
                  </button>
                ) : null}
              </div>

              <OwnedCargoListFilters
                activeFilter={activeFilter}
                counts={counts}
                onFilterChange={setActiveFilter}
              />
            </header>
          ) : null}

          {createdCargoId && shownIds.has(createdCargoId) ? (
            <Card className={styles.createdBanner} role="status" data-testid="minhas-cargas-created-banner">
              <HydroIcon name="cargo" size={22} />
              <p>{t('createdBanner')}</p>
            </Card>
          ) : null}

          {items.length === 0 ? (
            <div className={listStyles.emptyState} data-testid="minhas-cargas-empty">
              <HydroIcon name="cargo" size={30} />
              <h2>{canCreateCargo ? t('emptyTitle') : t('emptyTitleCarrier')}</h2>
              <p>{canCreateCargo ? t('emptyDescription') : t('emptyDescriptionCarrier')}</p>
              <Link
                href={canCreateCargo ? intlAppPaths.cargos.publishCargo : intlAppPaths.cargos.marketplace}
                className={styles.emptyCta}
              >
                {canCreateCargo ? t('newCargoCta') : t('marketplaceCta')}
              </Link>
            </div>
          ) : filteredItems.length > 0 ? (
            <OwnedCargoListSection className={publicListStyles.cargoList}>
              {filteredItems.map((cargo, index) => (
                <OwnedCargoCard key={cargo.id} cargo={cargo} index={index} />
              ))}
            </OwnedCargoListSection>
          ) : (
            <div className={styles.filteredEmptyState} data-testid="minhas-cargas-filter-empty">
              <HydroIcon name="filter" size={28} />
              <h2>{t('listFilters.emptyFilteredTitle')}</h2>
              <p>{t('listFilters.emptyFilteredDescription')}</p>
              <button
                type="button"
                className={styles.filteredEmptyReset}
                onClick={clearAllFilters}
              >
                {t('listFilters.clearAction')}
              </button>
            </div>
          )}
        </div>
      </section>

      <OwnedCargoMobileFilterSheet
        open={drawerOpen}
        isClosing={isFilterClosing}
        resultCount={visibleCount}
        activeFilter={activeFilter}
        counts={counts}
        onOpenChange={handleFilterSheetOpenChange}
        onFilterChange={setActiveFilter}
        onClearFilters={handleClearFilters}
        onApplyFilters={closeFilterSheet}
      />
    </>
  );
}
