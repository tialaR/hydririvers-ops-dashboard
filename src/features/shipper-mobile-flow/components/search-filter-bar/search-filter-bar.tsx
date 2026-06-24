'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from './search-filter-bar.module.sass';

type SearchFilterBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholderKey?: string;
  onFilterClick?: () => void;
};

export function SearchFilterBar({ value, onChange, onFilterClick }: SearchFilterBarProps) {
  const t = useTranslations('shipperMobileFlow.search');

  return (
    <div className={styles.bar}>
      <Search size={18} aria-hidden />
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('label')}
      />
      {onFilterClick ? (
        <button type="button" className={styles.filterBtn} onClick={onFilterClick} aria-label={t('filters')}>
          <SlidersHorizontal size={18} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function FilterChips({
  options,
  activeId,
  onChange
}: {
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.chips} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={activeId === option.id}
          className={`${styles.chip} ${activeId === option.id ? styles.chipActive : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SearchFilterStack(props: SearchFilterBarProps & {
  chips: { id: string; label: string }[];
  activeChip: string;
  onChipChange: (id: string) => void;
}) {
  const { chips, activeChip, onChipChange, ...barProps } = props;
  return (
    <div className={styles.stack}>
      <SearchFilterBar {...barProps} />
      <FilterChips options={chips} activeId={activeChip} onChange={onChipChange} />
    </div>
  );
}
