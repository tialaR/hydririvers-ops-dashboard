'use client';

import { Ship } from 'lucide-react';

import type { StatusBadgeStatus } from '@/shared/components/status-badge';

import styles from './shipment-card.module.sass';

export type ShipmentCardLocation = {
  stateCode: string;
  stateLabel: string;
  city: string;
};

export type ShipmentCardProps = {
  code: string;
  statusLabel: string;
  statusTone: StatusBadgeStatus;
  origin: ShipmentCardLocation;
  destination: ShipmentCardLocation;
  cargoLabel: string;
  cargoValue: string;
  etaLabel?: string;
  etaValue: string;
  etaSuffix?: string;
  selected?: boolean;
  onSelect?: () => void;
  testId?: string;
};

export function ShipmentCard({
  code,
  statusLabel,
  statusTone,
  origin,
  destination,
  cargoLabel,
  cargoValue,
  etaLabel = 'ETA',
  etaValue,
  etaSuffix,
  selected = false,
  onSelect,
  testId = 'shipment-card',
}: ShipmentCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      data-testid={testId}
      data-status-tone={statusTone}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <div className={styles.top}>
        <strong>{code}</strong>
        <span className={styles.status} data-tone={statusTone} data-testid="shipment-card-status">
          {statusLabel}
        </span>
      </div>

      <div className={styles.route}>
        <div className={styles.location}>
          <span
            className={styles.stateBrand}
            data-state-code={origin.stateCode}
            aria-label={origin.stateLabel}
            role="img"
          />
          <span className={styles.locationCopy}>
            <strong>{origin.stateLabel},</strong>
            <small>{origin.city}</small>
          </span>
        </div>

        <div className={`${styles.location} ${styles.locationDestination}`}>
          <span className={styles.locationCopy}>
            <strong>{destination.stateLabel},</strong>
            <small>{destination.city}</small>
          </span>
          <span
            className={styles.stateBrand}
            data-state-code={destination.stateCode}
            aria-label={destination.stateLabel}
            role="img"
          />
        </div>
      </div>

      <div className={styles.transit} aria-hidden="true">
        <span><Ship size={22} strokeWidth={1.4}/></span>
      </div>

      <div className={styles.facts}>
        <div>
          <small>{cargoLabel}</small>
          <strong>{cargoValue}</strong>
        </div>
        <div>
          <small>{etaLabel}</small>
          <strong>{etaValue}{etaSuffix ? <span>{etaSuffix}</span> : null}</strong>
        </div>
      </div>
    </button>
  );
}
