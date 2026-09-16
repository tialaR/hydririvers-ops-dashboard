'use client';

import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { projectShipperMapToSvg } from '@/features/waterway-map/adapters/owned-cargo-operation-geojson';

import styles from './owned-cargo-operation-map.module.sass';

type ShipperOperationMapFallbackProps = {
  routeData: ShipperMapRouteData;
  ariaLabel: string;
  hintLabel?: string;
  presentation?: 'default' | 'desktop-foundation' | 'page-61-219-254';
};

export function ShipperOperationMapFallback({
  routeData,
  ariaLabel,
  hintLabel,
  presentation = 'default'
}: ShipperOperationMapFallbackProps) {
  const projection = projectShipperMapToSvg(routeData);
  const isDesktopFoundation = presentation !== 'default';
  const isCanonicalPage61Fixture = presentation === 'page-61-219-254';
  const isPage61Fixture = presentation === 'desktop-foundation' || presentation === 'page-61-219-254';
  const routePath = isPage61Fixture
    ? 'M138 42 C151 68 163 92 178 111 C191 128 207 141 222 149'
    : projection.routePath;

  return (
    <div className={`${styles.mapFallback} ${isDesktopFoundation ? styles.mapFallbackDesktop : ''} ${isCanonicalPage61Fixture ? styles.mapFallbackPage61 : ''}`}>
      {hintLabel ? <p className={styles.mapFallbackHint}>{hintLabel}</p> : null}
      <svg
        className={styles.mapFallbackSvg}
        viewBox={projection.viewBox}
        preserveAspectRatio={isCanonicalPage61Fixture ? 'none' : undefined}
        role="img"
        aria-label={ariaLabel}
      >
        <rect width="320" height="200" fill="transparent" />
        {isDesktopFoundation ? <g className={styles.mapContext} aria-hidden="true">
          <path d="M102 18 L150 0 L193 14 L210 48 L196 75 L222 94 L202 126 L164 120 L132 91 L112 76 L94 42 Z" />
          <path d="M232 16 L318 7 L316 84 L279 80 L224 49 Z" />
          <path d="M218 89 L246 96 L267 132 L250 167 L208 161 L176 139 L162 108 L188 91 Z" />
          <path className={styles.mapRiver} d="M58 146 C98 126 123 132 153 113 C185 92 212 104 239 84 C269 62 294 67 326 48" />
        </g> : null}
        <path
          d={routePath}
          fill="none"
          stroke="var(--hy-shipper-info)"
          strokeWidth={isDesktopFoundation ? '1.4' : '3'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isDesktopFoundation ? '5 4' : undefined}
        />
        {!isPage61Fixture && projection.riskPath ? (
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
        {!isPage61Fixture ? projection.checkpoints.map((checkpoint) => (
          <circle
            key={checkpoint.id}
            cx={checkpoint.x}
            cy={checkpoint.y}
            r="2.5"
            fill="var(--hy-shipper-muted)"
            opacity="0.55"
          />
        )) : null}
        <circle cx={isPage61Fixture ? 138 : projection.origin.x} cy={isPage61Fixture ? 42 : projection.origin.y} r={isPage61Fixture ? 2.5 : 6} fill="var(--hy-shipper-success)" />
        <circle cx={isPage61Fixture ? 222 : projection.destination.x} cy={isPage61Fixture ? 149 : projection.destination.y} r={isPage61Fixture ? 2.5 : 6} fill="var(--hy-shipper-danger)" />
        <circle
          cx={isPage61Fixture ? 171 : projection.current.x}
          cy={isPage61Fixture ? 102 : projection.current.y}
          r={isPage61Fixture ? 4 : 7}
          fill="var(--hy-shipper-primary)"
          stroke="var(--hy-shipper-bg)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
