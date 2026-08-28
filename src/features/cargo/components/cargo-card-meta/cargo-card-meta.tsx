import styles from './cargo-card-meta.module.sass';
import type { CargoCardVisualStatus } from '@/features/cargo/components/cargo-list-card/map-cargo-card-visual-status';

export type CargoCardMetaProps = {
  label: string;
  visualStatus: CargoCardVisualStatus;
};

export function CargoCardMeta({ label, visualStatus }: CargoCardMetaProps) {
  return (
    <span className={styles.meta} data-visual-status={visualStatus}>
      <svg className={styles.clock} viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="21" stroke="currentColor" strokeWidth="4.2" />
        <path d="M26 13.5V26.8L34.5 32.1" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
