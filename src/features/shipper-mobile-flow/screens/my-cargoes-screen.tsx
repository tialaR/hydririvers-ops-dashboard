'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/shipper-mobile-flow/components/search-filter-bar/search-filter-bar';
import { CargoCardList } from '@/features/shipper-mobile-flow/components/cargo-card/cargo-card';
import type { ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

type MyCargoesScreenProps = {
  initialCargoes: ShipperOwnedCargo[];
};

export function MyCargoesScreen({ initialCargoes }: MyCargoesScreenProps) {
  const t = useTranslations('shipperMobileFlow.myCargoes');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filters.all') },
      { id: 'transit', label: t('filters.transit') },
      { id: 'attention', label: t('filters.attention') }
    ],
    [t]
  );

  const filtered = initialCargoes.filter((cargo) => {
    const matchesChip =
      chip === 'all' ||
      (chip === 'transit' && cargo.status === 'inTransit') ||
      (chip === 'attention' && cargo.status === 'attention');
    const haystack = `${cargo.code} ${cargo.origin} ${cargo.destination}`.toLowerCase();
    return matchesChip && haystack.includes(query.toLowerCase());
  });

  return (
    <MobileAppShell title={t('title')}>
      <SearchFilterStack value={query} onChange={setQuery} chips={chips} activeChip={chip} onChipChange={setChip} />
      <CargoCardList cargoes={filtered} />
    </MobileAppShell>
  );
}
