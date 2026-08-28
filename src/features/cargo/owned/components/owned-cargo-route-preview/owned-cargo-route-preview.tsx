'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { CargoCorridorId as ShipperCorridorId } from '@/features/cargo/owned/domain/owned-cargo-types';
import { getShipperCorridorRoute } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { projectShipperMapToSvg } from '@/features/waterway-map/adapters/owned-cargo-operation-geojson';

import styles from './owned-cargo-route-preview.module.sass';

type MapPreviewCardProps = {
  cargoId: string;
  corridorId: ShipperCorridorId;
  origin: string;
  destination: string;
};

export function MapPreviewCard({ cargoId, corridorId, origin, destination }: MapPreviewCardProps) {
  const t = useTranslations('shipperMobileFlow.map');
  const projection = useMemo(() => projectShipperMapToSvg(getShipperCorridorRoute(corridorId)), [corridorId]);

  return (
    <Link href={`/minhas-cargas/${cargoId}/mapa`} className={`${styles.card} ${styles.mapPreviewCard}`}>
      <h3 className={styles.title}>{t('previewTitle')}</h3>
      <p className={styles.summary}>
        {origin} → {destination}
      </p>
      <div className={styles.mapPreviewCanvas}>
        <svg className={styles.mapRoute} viewBox={projection.viewBox} aria-hidden>
          <path
            d={projection.routePath}
            fill="none"
            stroke="var(--hy-shipper-info)"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />
          {projection.riskPath ? (
            <path
              d={projection.riskPath}
              fill="none"
              stroke="var(--hy-shipper-danger)"
              strokeWidth="3"
              strokeDasharray="4 3"
              opacity="0.75"
            />
          ) : null}
          <circle cx={projection.origin.x} cy={projection.origin.y} r="4" fill="var(--hy-shipper-success)" />
          <circle cx={projection.destination.x} cy={projection.destination.y} r="4" fill="var(--hy-shipper-danger)" />
          <circle cx={projection.current.x} cy={projection.current.y} r="4.5" fill="var(--hy-shipper-primary)" />
        </svg>
      </div>
      <span className={styles.cta}>{t('openFull')}</span>
    </Link>
  );
}
