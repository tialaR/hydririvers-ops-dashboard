'use client';

import { Clock3, FileText, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  page61219254SelectedVisualFacts,
  page61219254ShipmentCardDisplayCodeByCargoId
} from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { getShipperMapRouteForCargo } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoShipmentCardProps = {
  cargo: OwnedCargo;
  selected: boolean;
  visualFixtureEnabled: boolean;
  onSelect: () => void;
};

export function OwnedCargoShipmentCard({ cargo, selected, visualFixtureEnabled, onSelect }: OwnedCargoShipmentCardProps) {
  const t = useTranslations('shipperMobileFlow');
  const displayCode = visualFixtureEnabled
    ? page61219254ShipmentCardDisplayCodeByCargoId[cargo.id] ?? cargo.code
    : cargo.code;

  return <button
    type="button"
    data-cargo-id={cargo.id}
    data-cargo-code={cargo.code}
    data-status={cargo.status}
    aria-pressed={selected}
    className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
    onClick={onSelect}
  >
    <div className={styles.cardTop}>
      <small>{visualFixtureEnabled ? `#${displayCode}` : displayCode}</small>
      <span data-tone={cargo.status}>{t(`cargoDetail.status.${cargo.status}`)}</span>
      {!visualFixtureEnabled ? <b>•••</b> : null}
    </div>
    <div className={styles.route}>
      <strong>{visualFixtureEnabled ? <><em data-flag="us"/><span><b>{page61219254SelectedVisualFacts.originRegion}</b><small>{page61219254SelectedVisualFacts.originCity}</small></span></> : cargo.origin}</strong>
      <strong>{visualFixtureEnabled ? <><span><b>{page61219254SelectedVisualFacts.destinationRegion}</b><small>{page61219254SelectedVisualFacts.destinationCity}</small></span><em data-flag="pa"/></> : cargo.destination}</strong>
    </div>
    {!visualFixtureEnabled ? <div className={styles.routeLabels}><small>{t('myCargoes.desktop.origin')}</small><small>{t('myCargoes.desktop.destination')}</small></div> : null}
    {visualFixtureEnabled ? <div className={styles.cardTransit}><span aria-hidden="true">⚓</span></div> : null}
    {visualFixtureEnabled ? <div className={styles.fixtureCardFacts}>
      <div><small>{t('myCargoes.desktop.cargo')}</small><strong>{page61219254SelectedVisualFacts.cargoType}</strong></div>
      <div><small>ETA</small><strong>{page61219254SelectedVisualFacts.cardEta} <span>{page61219254SelectedVisualFacts.cardEtaDay}</span></strong></div>
    </div> : <>
      <div className={styles.metrics}>
        <span><Clock3 size={13}/>{t('myCargoes.desktop.eta', { hours: cargo.etaHours })}</span>
        <span><ShieldAlert size={13}/>{t(`myCargoes.desktop.risk.${cargo.riskLevel}`)}</span>
        <span><FileText size={13}/>{t('myCargoes.desktop.docs', { count: cargo.pendingDocsCount })}</span>
      </div>
      <div className={styles.progress}><i style={{ width: `${Math.round(getShipperMapRouteForCargo(cargo).progressRatio * 100)}%` }}/></div>
    </>}
  </button>;
}
