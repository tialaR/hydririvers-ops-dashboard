import type { CargoCardVisualStatus } from '@/features/cargo/components/cargo-list-card/map-cargo-card-visual-status';
import styles from './cargo-status-filter.module.sass';

export type CargoStatusFilterId = 'all' | CargoCardVisualStatus;

export type CargoStatusFilterOption = {
  id: CargoStatusFilterId;
  label: string;
  count: number;
};

export type CargoStatusFilterProps = {
  options: CargoStatusFilterOption[];
  activeId: CargoStatusFilterId;
  onChange: (id: CargoStatusFilterId) => void;
  ariaLabel: string;
};

export function CargoStatusFilter({ options, activeId, onChange, ariaLabel }: CargoStatusFilterProps) {
  return (
    <div className={styles.rail} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.id === activeId;

        return (
          <button
            className={styles.item}
            data-selected={selected ? 'true' : 'false'}
            data-filter-id={option.id}
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
          >
            <span>{option.label}</span>
            <small>{option.count}</small>
          </button>
        );
      })}
    </div>
  );
}
