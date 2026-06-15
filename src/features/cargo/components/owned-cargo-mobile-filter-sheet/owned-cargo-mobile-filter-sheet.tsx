'use client';

import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

import { CargoFilterSheetFooter } from '@/features/cargo/components/cargo-filter-sheet-content';
import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import type { OwnedCargoListFilterCounts, OwnedCargoListFilterId } from '@/features/cargo/domain/owned-cargo-list-filters';
import { OWNED_CARGO_LIST_FILTER_IDS } from '@/features/cargo/domain/owned-cargo-list-filters';
import {
  publicCargoLightSheetDefaults,
  publicCargoLightSheetSnapHeights,
  usePublicCargoLightSheetPortal,
} from '@/features/cargo/components/public-cargas-mobile/public-cargo-light-sheet-defaults';
import publicListStyles from '@/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { FilterChip } from '@/shared/components/filter-chip';

const FILTER_I18N_KEYS: Record<OwnedCargoListFilterId, 'all' | 'open' | 'inTransit' | 'documents' | 'risk'> = {
  all: 'all',
  open: 'open',
  inTransit: 'inTransit',
  documents: 'documents',
  risk: 'risk',
};

export type OwnedCargoMobileFilterSheetProps = {
  open: boolean;
  isClosing: boolean;
  resultCount: number;
  activeFilter: OwnedCargoListFilterId;
  counts: OwnedCargoListFilterCounts;
  onOpenChange: (open: boolean) => void;
  onFilterChange: (filterId: OwnedCargoListFilterId) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
};

export function OwnedCargoMobileFilterSheet({
  open,
  isClosing,
  resultCount,
  activeFilter,
  counts,
  onOpenChange,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}: OwnedCargoMobileFilterSheetProps) {
  const t = useTranslations('pages.minhasCargas.listFilters');
  const filterSheetPanelClass = cargoDsV2ThemeRootClassName(publicListStyles.filterBottomSheet);

  usePublicCargoLightSheetPortal(open, publicListStyles.filterBottomSheet, {
    'data-owned-cargo-filter-sheet': 'true',
  });

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('mobileTitle')}
      description={t('mobileDescription')}
      closeAriaLabel={t('close')}
      dragHandleAriaLabel={t('mobileTitle')}
      snapHeights={publicCargoLightSheetSnapHeights}
      {...publicCargoLightSheetDefaults}
      className={[filterSheetPanelClass, isClosing ? publicListStyles.filterBottomSheetClosing : '']
        .filter(Boolean)
        .join(' ')}
      bodyClassName={publicListStyles.filterBottomSheetBody}
      footer={
        <CargoFilterSheetFooter
          onReset={() => {
            onClearFilters();
          }}
          onViewCargoes={onApplyFilters}
        />
      }
    >
      <div className={publicListStyles.filterSheetContent}>
        <div className={publicListStyles.filtersMeta}>
          <SlidersHorizontal aria-hidden />
          <span>{t('resultsMeta', { count: resultCount })}</span>
        </div>

        <section className={publicListStyles.filterSection}>
          <h3>{t('sheetSection')}</h3>
          <div className={publicListStyles.filterChipGrid}>
            {OWNED_CARGO_LIST_FILTER_IDS.map((filterId) => {
              const isSelected = activeFilter === filterId;

              return (
                <FilterChip
                  key={filterId}
                  className={publicListStyles.filterChip}
                  isSelected={isSelected}
                  aria-pressed={isSelected}
                  data-testid={`minhas-cargas-sheet-filter-${filterId}`}
                  onClick={() => onFilterChange(filterId)}
                >
                  {t(FILTER_I18N_KEYS[filterId])}
                  {' '}
                  <span aria-hidden>({counts[filterId]})</span>
                </FilterChip>
              );
            })}
          </div>
        </section>
      </div>
    </BottomSheet>
  );
}
