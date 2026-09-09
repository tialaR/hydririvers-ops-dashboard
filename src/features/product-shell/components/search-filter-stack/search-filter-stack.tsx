'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FilterChip } from '@/shared/design-system/core/filter-chip';
import { SearchField } from '@/shared/design-system/core/search-field';

import styles from './search-filter-stack.module.sass';

type SearchFilterBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholderKey?: string;
  onFilterClick?: () => void;
};

export function SearchFilterBar({ value, onChange, onFilterClick }: SearchFilterBarProps) {
  const t = useTranslations('shipperMobileFlow.search');
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={t('placeholder')}
      ariaLabel={t('label')}
      icon={<Search size={18} />}
      classNames={{ root: styles.bar, input: styles.input, rightSlot: styles.rightSlot }}
      rightSlot={onFilterClick ? (
        <button type="button" className={styles.filterBtn} onClick={onFilterClick} aria-label={t('filters')}>
          <SlidersHorizontal size={18} aria-hidden />
        </button>
      ) : undefined}
    />
  );
}

export function FilterChips({ options, activeId, onChange }: { options: { id: string; label: string }[]; activeId: string; onChange: (id: string) => void }) {
  const t = useTranslations('shipperMobileFlow.search');

  return (
    <div className={styles.chips} role="group" aria-label={t('filters')}>
      {options.map((option) => (
        <FilterChip key={option.id} selected={activeId === option.id} className={`${styles.chip} ${activeId === option.id ? styles.chipActive : ''}`} onClick={() => onChange(option.id)}>
          {option.label}
        </FilterChip>
      ))}
    </div>
  );
}

export function SearchFilterStack(props: SearchFilterBarProps & { chips: { id: string; label: string }[]; activeChip: string; onChipChange: (id: string) => void }) {
  const { chips, activeChip, onChipChange, ...barProps } = props;
  return (
    <div className={styles.stack}>
      <SearchFilterBar {...barProps} />
      <FilterChips options={chips} activeId={activeChip} onChange={onChipChange} />
    </div>
  );
}
