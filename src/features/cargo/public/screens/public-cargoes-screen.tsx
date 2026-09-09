'use client';

import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { PublicCargoCardRestricted, type PublicCargoActionButtonProps } from '@/features/cargo/public/components/public-cargo-card-restricted/public-cargo-card-restricted';
import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';

import styles from '@/features/cargo/styles/cargo-flow.module.sass';

type SearchChip = { id: string; label: string };

export type PublicCargoSearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  chips: SearchChip[];
  activeChip: string;
  onChipChange: (chipId: string) => void;
  onFilterClick: () => void;
};

export type PublicCargoBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'compact' | 'medium' | 'full';
  children: ReactNode;
};

export type PublicCargoEmptyStateProps = { title: string; description: string };

type PublicCargoesScreenProps = {
  initialCargoes: PublicCargoSafeView[];
  SearchFilter: ComponentType<PublicCargoSearchFilterProps>;
  BottomSheet: ComponentType<PublicCargoBottomSheetProps>;
  EmptyState: ComponentType<PublicCargoEmptyStateProps>;
  ActionButton: ComponentType<PublicCargoActionButtonProps>;
};

export function PublicCargoesScreen({ initialCargoes, SearchFilter, BottomSheet, EmptyState, ActionButton }: PublicCargoesScreenProps) {
  const t = useTranslations('shipperMobileFlow.publicList');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const chips = useMemo(() => [
    { id: 'all', label: t('filters.all') },
    { id: 'tapajos', label: t('filters.tapajos') },
    { id: 'madeira', label: t('filters.madeira') },
    { id: 'amazonas', label: t('filters.amazonas') }
  ], [t]);
  const corridorHighlights = useMemo(() => [
    { id: 'tapajos', label: t('filters.tapajos') },
    { id: 'madeira', label: t('filters.madeira') },
    { id: 'amazonas', label: t('filters.amazonas') }
  ], [t]);

  const filtered = initialCargoes.filter((cargo) => {
    const matchesChip = chip === 'all' || cargo.corridorId.startsWith(chip);
    const haystack = `${cargo.origin} ${cargo.destination}`.toLowerCase();
    return matchesChip && haystack.includes(query.toLowerCase());
  });

  return (
    <>
      <SearchFilter value={query} onChange={setQuery} chips={chips} activeChip={chip} onChipChange={setChip} onFilterClick={() => setFiltersOpen(true)} />
      <section className={styles.listHeroCard} aria-label={t('title')}>
        <p className={styles.listHeroLabel}>{t('title')}</p>
        <p className={styles.listHeroValue}>{t('resultsCount', { count: filtered.length })}</p>
        <p className={styles.listHeroBody}>{t('filtersSheet.lead')}</p>
      </section>
      <section className={styles.corridorMiniGrid} aria-label={t('title')}>
        {corridorHighlights.map((item) => (
          <article key={item.id} className={styles.corridorMiniCard}>
            <p className={styles.corridorMiniLabel}>{item.label}</p>
            <p className={styles.corridorMiniValue}>{initialCargoes.filter((cargo) => cargo.corridorId.startsWith(item.id)).length}</p>
          </article>
        ))}
      </section>
      <div className={styles.listSectionHeader}>
        <p className={styles.listSectionTitle}>{t('title')}</p>
        <p className={styles.listSectionCount}>{t('resultsCount', { count: filtered.length })}</p>
      </div>
      {filtered.length === 0 ? <EmptyState title={t('emptyTitle')} description={t('emptyBody')} /> : (
        <div className={styles.list}>
          {filtered.map((cargo) => <PublicCargoCardRestricted key={cargo.id} cargo={cargo} ActionButton={ActionButton} />)}
        </div>
      )}
      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filtersSheet.title')} size="medium">
        <p className={styles.sheetLead}>{t('filtersSheet.lead')}</p>
        <div className={styles.sheetChipList}>
          {chips.map((item) => (
            <button key={item.id} type="button" className={`${styles.sheetChip} ${chip === item.id ? styles.sheetChipActive : ''}`} onClick={() => setChip(item.id)}>{item.label}</button>
          ))}
        </div>
        <div className={styles.sheetActions}>
          <button type="button" className={styles.sheetSecondaryAction} onClick={() => setChip('all')}>{t('filtersSheet.clear')}</button>
          <button type="button" className={styles.sheetPrimaryAction} onClick={() => setFiltersOpen(false)}>{t('filtersSheet.apply')}</button>
        </div>
      </BottomSheet>
    </>
  );
}
