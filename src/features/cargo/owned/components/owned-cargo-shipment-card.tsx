'use client';

import { Ship } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { OwnedCargoDesktopViewModel } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoShipmentCardProps = {
  viewModel: OwnedCargoDesktopViewModel;
  selected: boolean;
  onSelect: () => void;
};

export function OwnedCargoShipmentCard({ viewModel, selected, onSelect }: OwnedCargoShipmentCardProps) {
  const t = useTranslations('shipperMobileFlow');
  const { cargo } = viewModel;

  return <button
    type="button"
    data-cargo-id={cargo.id}
    data-cargo-code={cargo.code}
    data-status={cargo.status}
    data-testid="page61-shipment-card"
    aria-pressed={selected}
    className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
    onClick={onSelect}
  >
    <div className={styles.cardTop}>
      <small>{viewModel.codeLabel}</small>
      <span data-tone={cargo.status}>{viewModel.statusLabel}</span>
    </div>
    <div className={styles.route}>
      <strong><em data-flag="us"/><span><b>{viewModel.originRegion}</b><small>{viewModel.originCity}</small></span></strong>
      <strong><span><b>{viewModel.destinationRegion}</b><small>{viewModel.destinationCity}</small></span><em data-flag="pa"/></strong>
    </div>
    <div className={styles.cardTransit}><span aria-hidden="true"><Ship size={22} strokeWidth={1.4}/></span></div>
    <div className={styles.canonicalCardFacts}>
      <div><small>{t('myCargoes.desktop.cargo')}</small><strong>{viewModel.cargoType}</strong></div>
      <div><small>ETA</small><strong>{viewModel.cardEta} {viewModel.cardEtaDay ? <span>{viewModel.cardEtaDay}</span> : null}</strong></div>
    </div>
  </button>;
}
