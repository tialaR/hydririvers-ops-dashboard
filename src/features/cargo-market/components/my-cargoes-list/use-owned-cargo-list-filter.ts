'use client';

import { useMemo, useState } from 'react';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  countOwnedCargoesByListFilter,
  filterOwnedCargoesByListFilter,
  type OwnedCargoListFilterId,
} from '@/features/cargo/domain/owned-cargo-list-filters';
import { filterOwnedCargoesBySearch } from '@/features/cargo/domain/owned-cargo-list-search';

export function useOwnedCargoListFilter(items: Cargo[]) {
  const [activeFilter, setActiveFilter] = useState<OwnedCargoListFilterId>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => countOwnedCargoesByListFilter(items), [items]);

  const filteredItems = useMemo(() => {
    const byFilter = filterOwnedCargoesByListFilter(items, activeFilter);
    return filterOwnedCargoesBySearch(byFilter, query);
  }, [items, activeFilter, query]);

  const hasAppliedFilters = activeFilter !== 'all' || query.trim().length > 0;

  function clearAllFilters() {
    setActiveFilter('all');
    setQuery('');
  }

  return {
    activeFilter,
    setActiveFilter,
    query,
    setQuery,
    counts,
    filteredItems,
    hasAppliedFilters,
    clearAllFilters,
  };
}
