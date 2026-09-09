'use client';

import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { projectShipperMapToSvg } from '@/features/waterway-map/adapters/owned-cargo-operation-geojson';

import styles from './owned-cargo-operation-map.module.sass';

type ShipperOperationMapFallbackProps = {
  routeData: ShipperMapRouteData;
  ariaLabel: string;
  hintLabel?: string;
};

export function ShipperOperationMapFallback({
  routeData,
  ariaLabel,
  hintLabel
}: ShipperOperationMapFallbackProps) {
  const projection = projectShipperMapToSvg(routeData);

  return (
    <div className={styles.mapFallback}>
      {hintLabel ? <p className={styles.mapFallbackHint}>{hintLabel}</p> : null}
      <svg
        className={styles.mapFallbackSvg}
        viewBox={projection.viewBox}
        role="img"
        aria-label={ariaLabel}
      >
        <rect width="320" height="200" fill="transparent" />
        <path
          d={projection.routePath}
          fill="none"
          stroke="var(--hy-shipper-info)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {projection.riskPath ? (
          <path
            d={projection.riskPath}
            fill="none"
            stroke="var(--hy-shipper-danger)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            opacity="0.85"
          />
        ) : null}
        {projection.checkpoints.map((checkpoint) => (
          <circle
            key={checkpoint.id}
            cx={checkpoint.x}
            cy={checkpoint.y}
            r="2.5"
            fill="var(--hy-shipper-muted)"
            opacity="0.55"
          />
        ))}
        <circle cx={projection.origin.x} cy={projection.origin.y} r="6" fill="var(--hy-shipper-success)" />
        <circle cx={projection.destination.x} cy={projection.destination.y} r="6" fill="var(--hy-shipper-danger)" />
        <circle
          cx={projection.current.x}
          cy={projection.current.y}
          r="7"
          fill="var(--hy-shipper-primary)"
          stroke="var(--hy-shipper-bg)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
