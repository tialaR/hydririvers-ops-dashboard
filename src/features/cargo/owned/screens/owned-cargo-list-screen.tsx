'use client';

import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { CargoCardList } from '@/features/cargo/owned/components/owned-cargo-compact-card/cargo-card';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import styles from '@/features/cargo/styles/cargo-flow.module.sass';

type SearchChip = {
  id: string;
  label: string;
};

export type OwnedCargoSearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  chips: SearchChip[];
  activeChip: string;
  onChipChange: (chipId: string) => void;
  onFilterClick: () => void;
};

export type OwnedCargoBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'compact' | 'medium' | 'full';
  children: ReactNode;
};

export type OwnedCargoEmptyStateProps = {
  title: string;
  description: string;
};

type OwnedCargoListScreenProps = {
  initialCargoes: OwnedCargo[];
  SearchFilter: ComponentType<OwnedCargoSearchFilterProps>;
  BottomSheet: ComponentType<OwnedCargoBottomSheetProps>;
  EmptyState: ComponentType<OwnedCargoEmptyStateProps>;
};

export function OwnedCargoListScreen({
  initialCargoes,
  SearchFilter,
  BottomSheet,
  EmptyState,
}: OwnedCargoListScreenProps) {
  const t = useTranslations('shipperMobileFlow.myCargoes');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filters.all') },
      { id: 'transit', label: t('filters.transit') },
      { id: 'attention', label: t('filters.attention') },
    ],
    [t],
  );

  const filtered = initialCargoes.filter((cargo) => {
    const matchesChip =
      chip === 'all' ||
      (chip === 'transit' && cargo.status === 'inTransit') ||
      (chip === 'attention' && cargo.status === 'attention');
    const haystack = `${cargo.code} ${cargo.origin} ${cargo.destination}`.toLowerCase();
    return matchesChip && haystack.includes(query.toLowerCase());
  });

  const inTransitCount = initialCargoes.filter((cargo) => cargo.status === 'inTransit').length;
  const attentionCount = initialCargoes.filter((cargo) => cargo.status === 'attention').length;
  const pendingDocsTotal = initialCargoes.reduce((acc, cargo) => acc + cargo.pendingDocsCount, 0);
  const avgEta = initialCargoes.length
    ? Math.round(initialCargoes.reduce((acc, cargo) => acc + cargo.etaHours, 0) / initialCargoes.length)
    : 0;

  return (
    <>
      <SearchFilter
        value={query}
        onChange={setQuery}
        chips={chips}
        activeChip={chip}
        onChipChange={setChip}
        onFilterClick={() => setFiltersOpen(true)}
      />
      <section className={styles.listHeroCard} aria-label={t('summaryAria')}>
        <p className={styles.listHeroLabel}>{t('title')}</p>
        <p className={styles.listHeroValue}>{t('resultsCount', { count: filtered.length })}</p>
        <p className={styles.listHeroBody}>{t('filtersSheet.lead')}</p>
      </section>
      <section className={styles.operationalStrip} aria-label={t('summaryAria')}>
        <article className={styles.operationalMiniCard}>
          <p className={styles.operationalMiniLabel}>{t('summary.inTransit')}</p>
          <p className={styles.operationalMiniValue}>{inTransitCount}</p>
        </article>
        <article className={styles.operationalMiniCard}>
          <p className={styles.operationalMiniLabel}>{t('summary.attention')}</p>
          <p className={styles.operationalMiniValue}>{attentionCount}</p>
        </article>
        <article className={styles.operationalMiniCard}>
          <p className={styles.operationalMiniLabel}>{t('summary.docs')}</p>
          <p className={styles.operationalMiniValue}>{pendingDocsTotal}</p>
        </article>
        <article className={styles.operationalMiniCard}>
          <p className={styles.operationalMiniLabel}>{t('summary.eta')}</p>
          <p className={styles.operationalMiniValue}>{t('summary.etaValue', { hours: avgEta })}</p>
        </article>
      </section>
      <div className={styles.listSectionHeader}>
        <p className={styles.listSectionTitle}>{t('title')}</p>
        <p className={styles.listSectionCount}>{t('resultsCount', { count: filtered.length })}</p>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyBody')} />
      ) : (
        <CargoCardList cargoes={filtered} />
      )}
      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filtersSheet.title')} size="medium">
        <p className={styles.sheetLead}>{t('filtersSheet.lead')}</p>
        <div className={styles.sheetChipList}>
          {chips.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.sheetChip} ${chip === item.id ? styles.sheetChipActive : ''}`}
              onClick={() => setChip(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.sheetActions}>
          <button type="button" className={styles.sheetSecondaryAction} onClick={() => setChip('all')}>
            {t('filtersSheet.clear')}
          </button>
          <button type="button" className={styles.sheetPrimaryAction} onClick={() => setFiltersOpen(false)}>
            {t('filtersSheet.apply')}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
