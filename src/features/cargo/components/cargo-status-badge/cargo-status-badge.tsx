import styles from './cargo-status-badge.module.sass';
import type { CargoCardVisualStatus } from '@/features/cargo/components/cargo-list-card/map-cargo-card-visual-status';

export type CargoStatusBadgeProps = {
  label: string;
  visualStatus: CargoCardVisualStatus;
};

export function CargoStatusBadge({ label, visualStatus }: CargoStatusBadgeProps) {
  return (
    <span className={styles.badge} data-visual-status={visualStatus}>
      {label}
    </span>
  );
}
