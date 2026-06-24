'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/shipper-mobile-flow/components/search-filter-bar/search-filter-bar';
import { PublicCargoCardRestricted } from '@/features/shipper-mobile-flow/components/public-cargo-card-restricted/public-cargo-card-restricted';
import type { PublicCargoSafeView } from '@/features/shipper-mobile-flow/domain/public-cargo-privacy-domain';

import styles from '../components/shared-ui/shared-ui.module.sass';

type PublicCargoesScreenProps = {
  initialCargoes: PublicCargoSafeView[];
};

export function PublicCargoesScreen({ initialCargoes }: PublicCargoesScreenProps) {
  const t = useTranslations('shipperMobileFlow.publicList');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filters.all') },
      { id: 'tapajos', label: t('filters.tapajos') },
      { id: 'madeira', label: t('filters.madeira') },
      { id: 'amazonas', label: t('filters.amazonas') }
    ],
    [t]
  );

  const filtered = initialCargoes.filter((cargo) => {
    const matchesChip = chip === 'all' || cargo.corridorId.startsWith(chip);
    const haystack = `${cargo.origin} ${cargo.destination}`.toLowerCase();
    return matchesChip && haystack.includes(query.toLowerCase());
  });

  return (
    <MobileAppShell title={t('title')}>
      <SearchFilterStack value={query} onChange={setQuery} chips={chips} activeChip={chip} onChipChange={setChip} />
      <div className={styles.list}>
        {filtered.map((cargo) => (
          <PublicCargoCardRestricted key={cargo.id} cargo={cargo} />
        ))}
      </div>
    </MobileAppShell>
  );
}
