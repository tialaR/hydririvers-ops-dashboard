'use client';

import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

import { CargoFilterSheetFooter } from '@/features/cargo/components/cargo-filter-sheet-content';
import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { FilterChip } from '@/shared/components/filter-chip';

import {
  publicCargoLightSheetDefaults,
  publicCargoLightSheetSnapHeights,
  usePublicCargoLightSheetPortal,
} from './public-cargo-light-sheet-defaults';
import styles from '@/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.module.scss';

export type PublicCargasFilterOption = {
  label: string;
  value: string;
};

export type PublicCargasMobileFilterSheetProps = {
  open: boolean;
  isClosing: boolean;
  resultCount: number;
  statusOptions: PublicCargasFilterOption[];
  statusFilter: string;
  corridorOptions: PublicCargasFilterOption[];
  corridorFilter: string[];
  originOptions: PublicCargasFilterOption[];
  originFilter: string[];
  destinationOptions: PublicCargasFilterOption[];
  destinationFilter: string[];
  typeOptions: PublicCargasFilterOption[];
  typeFilter: string[];
  documentOptions: PublicCargasFilterOption[];
  documentFilter: string[];
  onOpenChange: (open: boolean) => void;
  onStatusToggle: (value: string) => void;
  onCorridorToggle: (value: string) => void;
  onOriginToggle: (value: string) => void;
  onDestinationToggle: (value: string) => void;
  onTypeToggle: (value: string) => void;
  onDocumentToggle: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
};

function FilterSection({
  title,
  options,
  selectedValues,
  selection,
  onToggle,
}: {
  title: string;
  options: PublicCargasFilterOption[];
  selectedValues: string[];
  selection: 'single' | 'multi';
  onToggle: (value: string) => void;
}) {
  return (
    <section className={styles.filterSection}>
      <h3>{title}</h3>
      <div className={styles.filterChipGrid}>
        {options.map((item) => {
          const isSelected = selectedValues.includes(item.value);

          return (
            <FilterChip
              key={`${title}-${item.value}`}
              className={styles.filterChip}
              isSelected={isSelected}
              onClick={() => onToggle(item.value)}
              ariaPressed={isSelected}
            >
              {item.label}
            </FilterChip>
          );
        })}
      </div>
    </section>
  );
}

export function PublicCargasMobileFilterSheet({
  open,
  isClosing,
  resultCount,
  statusOptions,
  statusFilter,
  corridorOptions,
  corridorFilter,
  originOptions,
  originFilter,
  destinationOptions,
  destinationFilter,
  typeOptions,
  typeFilter,
  documentOptions,
  documentFilter,
  onOpenChange,
  onStatusToggle,
  onCorridorToggle,
  onOriginToggle,
  onDestinationToggle,
  onTypeToggle,
  onDocumentToggle,
  onClearFilters,
  onApplyFilters,
}: PublicCargasMobileFilterSheetProps) {
  const tBoard = useTranslations('operationsBoard');

  const resolvedStatus = statusFilter === 'all' ? ['all'] : [statusFilter];
  const filterSheetPanelClass = cargoDsV2ThemeRootClassName(styles.filterBottomSheet);

  usePublicCargoLightSheetPortal(open, styles.filterBottomSheet);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tBoard('filters.mobileTitle')}
      description={tBoard('filters.mobileDescription')}
      closeAriaLabel={tBoard('filters.close')}
      dragHandleAriaLabel={tBoard('filters.mobileTitle')}
      snapHeights={publicCargoLightSheetSnapHeights}
      {...publicCargoLightSheetDefaults}
      className={[filterSheetPanelClass, isClosing ? styles.filterBottomSheetClosing : '']
        .filter(Boolean)
        .join(' ')}
      bodyClassName={styles.filterBottomSheetBody}
      footer={
        <CargoFilterSheetFooter
          onReset={() => {
            onClearFilters();
          }}
          onViewCargoes={onApplyFilters}
        />
      }
    >
      <div className={styles.filterSheetContent}>
        <div className={styles.filtersMeta}>
          <SlidersHorizontal aria-hidden />
          <span>{tBoard('filters.results', { count: resultCount })}</span>
        </div>

        <FilterSection
          title={tBoard('filters.status')}
          options={statusOptions}
          selectedValues={resolvedStatus}
          selection="single"
          onToggle={onStatusToggle}
        />

        <FilterSection
          title={tBoard('filters.corridor')}
          options={corridorOptions}
          selectedValues={corridorFilter}
          selection="single"
          onToggle={onCorridorToggle}
        />

        <FilterSection
          title={tBoard('filters.origin')}
          options={originOptions}
          selectedValues={originFilter}
          selection="multi"
          onToggle={onOriginToggle}
        />

        <FilterSection
          title={tBoard('filters.destination')}
          options={destinationOptions}
          selectedValues={destinationFilter}
          selection="multi"
          onToggle={onDestinationToggle}
        />

        <FilterSection
          title={tBoard('filters.cargoType')}
          options={typeOptions}
          selectedValues={typeFilter}
          selection="multi"
          onToggle={onTypeToggle}
        />

        <FilterSection
          title={tBoard('filters.document')}
          options={documentOptions}
          selectedValues={documentFilter}
          selection="multi"
          onToggle={onDocumentToggle}
        />
      </div>
    </BottomSheet>
  );
}
