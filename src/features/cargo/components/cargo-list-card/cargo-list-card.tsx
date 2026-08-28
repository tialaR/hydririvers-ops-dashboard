import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { CargoCardAccent } from '@/features/cargo/components/cargo-card-accent/cargo-card-accent';
import { CargoCardMeta } from '@/features/cargo/components/cargo-card-meta/cargo-card-meta';
import { CargoStatusBadge } from '@/features/cargo/components/cargo-status-badge/cargo-status-badge';
import type { CargoCardVisualStatus } from './map-cargo-card-visual-status';
import styles from './cargo-list-card.module.sass';

export type CargoListCardProps = {
  cargo: OwnedCargo;
  href: string;
  title: string;
  statusLabel: string;
  routeLabel: string;
  metaLabel: string;
  visualStatus: CargoCardVisualStatus;
  onPress?: () => void;
};

export function CargoListCard({ href, title, statusLabel, routeLabel, metaLabel, visualStatus, onPress }: CargoListCardProps) {
  return (
    <a
      className={styles.root}
      href={href}
      data-visual-status={visualStatus}
      aria-label={`${title} · ${statusLabel}`}
      onClick={onPress}
    >
      <CargoCardAccent />
      <span className={styles.surface} aria-hidden="true" />
      <span className={styles.card}>
        <span className={styles.shine} aria-hidden="true" />
        <span className={styles.content}>
          <span className={styles.headerRow}>
            <span className={styles.title}>{title}</span>
            <CargoStatusBadge label={statusLabel} visualStatus={visualStatus} />
          </span>
          <span className={styles.route}>{routeLabel}</span>
          <CargoCardMeta label={metaLabel} visualStatus={visualStatus} />
        </span>
      </span>
    </a>
  );
}
