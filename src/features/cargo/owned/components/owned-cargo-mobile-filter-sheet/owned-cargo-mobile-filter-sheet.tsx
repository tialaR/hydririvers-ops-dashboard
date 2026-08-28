'use client';

import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

import { CargoFilterSheetFooter } from '@/features/cargo/components/cargo-filter-sheet-content';
import {
  cargoMobileSheetDefaults,
  cargoMobileSheetSnapHeights,
  useCargoMobileSheetPortal,
} from '@/features/cargo/components/cargo-mobile-sheet';
import cargoMobileSheetStyles from '@/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.module.scss';
import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import type { OwnedCargoListFilterCounts, OwnedCargoListFilterId } from '@/features/cargo/domain/owned-cargo-list-filters';
import { OWNED_CARGO_LIST_FILTER_IDS } from '@/features/cargo/domain/owned-cargo-list-filters';
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
  const filterSheetPanelClass = cargoDsV2ThemeRootClassName(cargoMobileSheetStyles.filterBottomSheet);

  useCargoMobileSheetPortal(open, cargoMobileSheetStyles.filterBottomSheet, {
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
      snapHeights={cargoMobileSheetSnapHeights}
      {...cargoMobileSheetDefaults}
      className={[filterSheetPanelClass, isClosing ? cargoMobileSheetStyles.filterBottomSheetClosing : '']
        .filter(Boolean)
        .join(' ')}
      bodyClassName={cargoMobileSheetStyles.filterBottomSheetBody}
      footer={
        <CargoFilterSheetFooter
          onReset={() => {
            onClearFilters();
          }}
          onViewCargoes={onApplyFilters}
        />
      }
    >
      <div className={cargoMobileSheetStyles.filterSheetContent}>
        <div className={cargoMobileSheetStyles.filtersMeta}>
          <SlidersHorizontal aria-hidden />
          <span>{t('resultsMeta', { count: resultCount })}</span>
        </div>

        <section className={cargoMobileSheetStyles.filterSection}>
          <h3>{t('sheetSection')}</h3>
          <div className={cargoMobileSheetStyles.filterChipGrid}>
            {OWNED_CARGO_LIST_FILTER_IDS.map((filterId) => {
              const isSelected = activeFilter === filterId;

              return (
                <FilterChip
                  key={filterId}
                  className={cargoMobileSheetStyles.filterChip}
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
