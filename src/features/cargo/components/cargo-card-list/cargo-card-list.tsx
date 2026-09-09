import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { CargoListCard } from '@/features/cargo/components/cargo-list-card/cargo-list-card';
import { mapCargoCardVisualStatus, type CargoCardVisualStatus } from '@/features/cargo/components/cargo-list-card/map-cargo-card-visual-status';
import styles from './cargo-card-list.module.sass';

export type CargoCardListProps = {
  cargoes: OwnedCargo[];
  getHref: (cargo: OwnedCargo) => string;
  getTitle: (cargo: OwnedCargo) => string;
  getStatusLabel: (cargo: OwnedCargo) => string;
  getRouteLabel: (cargo: OwnedCargo) => string;
  getMetaLabel: (cargo: OwnedCargo) => string;
  getVisualStatus?: (cargo: OwnedCargo) => CargoCardVisualStatus;
  emptyTitle: string;
  emptyDescription: string;
};

export function CargoCardList({
  cargoes,
  getHref,
  getTitle,
  getStatusLabel,
  getRouteLabel,
  getMetaLabel,
  getVisualStatus = mapCargoCardVisualStatus,
  emptyTitle,
  emptyDescription,
}: CargoCardListProps) {
  if (cargoes.length === 0) {
    return (
      <section className={styles.emptyState} aria-live="polite">
        <h2>{emptyTitle}</h2>
        <p>{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className={styles.list} aria-label={emptyTitle}>
      {cargoes.map((cargo) => (
        <CargoListCard
          key={String((cargo as unknown as { id?: string }).id ?? getHref(cargo))}
          cargo={cargo}
          href={getHref(cargo)}
          title={getTitle(cargo)}
          statusLabel={getStatusLabel(cargo)}
          routeLabel={getRouteLabel(cargo)}
          metaLabel={getMetaLabel(cargo)}
          visualStatus={getVisualStatus(cargo)}
        />
      ))}
    </section>
  );
}
