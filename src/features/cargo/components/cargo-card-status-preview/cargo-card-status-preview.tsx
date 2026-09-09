import { CargoCardAccent } from '@/features/cargo/components/cargo-card-accent/cargo-card-accent';
import { CargoStatusBadge } from '@/features/cargo/components/cargo-status-badge/cargo-status-badge';
import { CARGO_CARD_STATUS_MATRIX, CARGO_CARD_VISUAL_STATUSES, type CargoCardVisualStatus } from '@/features/cargo/components/cargo-list-card/map-cargo-card-visual-status';
import styles from './cargo-card-status-preview.module.sass';

const ENABLE_STATUS_PREVIEW = false;

const VISUAL_LABELS: Record<CargoCardVisualStatus, string> = {
  gray: 'gray',
  orange: 'orange',
  red: 'red',
  purple: 'purple',
  cyan: 'cyan',
  dark: 'dark',
};

export function CargoCardStatusPreview() {
  if (process.env.NODE_ENV !== 'development' || !ENABLE_STATUS_PREVIEW) {
    return null;
  }

  return (
    <section className={styles.preview} aria-label="Cargo card visual status matrix">
      <div className={styles.group}>
        <h2>Visual statuses</h2>
        {CARGO_CARD_VISUAL_STATUSES.map((visualStatus) => (
          <div className={styles.visualItem} key={visualStatus} data-visual-status={visualStatus}>
            <CargoCardAccent />
            <CargoStatusBadge label={VISUAL_LABELS[visualStatus]} visualStatus={visualStatus} />
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <h2>Status map</h2>
        {CARGO_CARD_STATUS_MATRIX.map((row) => (
          <div className={styles.matrixRow} key={`${row.sourceStatus}-${row.visualStatus}`} data-visual-status={row.visualStatus}>
            <span>{row.sourceStatus}</span>
            <strong>{row.visualStatus}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
