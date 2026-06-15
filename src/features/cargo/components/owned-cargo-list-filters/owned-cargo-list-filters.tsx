'use client';

import { useTranslations } from 'next-intl';
import { FilterChip } from '@/shared/components/filter-chip';
import type {
  OwnedCargoListFilterCounts,
  OwnedCargoListFilterId,
} from '@/features/cargo/domain/owned-cargo-list-filters';
import { OWNED_CARGO_LIST_FILTER_IDS } from '@/features/cargo/domain/owned-cargo-list-filters';
import styles from './owned-cargo-list-filters.module.sass';

const FILTER_I18N_KEYS: Record<OwnedCargoListFilterId, 'all' | 'open' | 'inTransit' | 'documents' | 'risk'> = {
  all: 'all',
  open: 'open',
  inTransit: 'inTransit',
  documents: 'documents',
  risk: 'risk',
};

export type OwnedCargoListFiltersProps = {
  activeFilter: OwnedCargoListFilterId;
  counts: OwnedCargoListFilterCounts;
  onFilterChange: (filterId: OwnedCargoListFilterId) => void;
};

export function OwnedCargoListFilters({
  activeFilter,
  counts,
  onFilterChange,
}: OwnedCargoListFiltersProps) {
  const t = useTranslations('pages.minhasCargas.listFilters');

  return (
    <div className={styles.root} data-testid="minhas-cargas-list-filters">
      <div
        className={styles.rail}
        role="group"
        aria-label={t('ariaLabel')}
      >
        {OWNED_CARGO_LIST_FILTER_IDS.map((filterId) => {
          const label = t(FILTER_I18N_KEYS[filterId]);
          const count = counts[filterId];
          const isSelected = activeFilter === filterId;

          return (
            <FilterChip
              key={filterId}
              className={styles.chip}
              isSelected={isSelected}
              aria-pressed={isSelected}
              data-testid={`minhas-cargas-filter-${filterId}`}
              onClick={() => onFilterChange(filterId)}
            >
              {label}
              {' '}
              <span className={styles.count} aria-hidden="true">
                ({count})
              </span>
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}
