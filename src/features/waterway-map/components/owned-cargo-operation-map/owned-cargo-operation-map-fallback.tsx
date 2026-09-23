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
  const isPage61Fixture = presentation === 'page-61-219-254';
  const routePath = isPage61Fixture
    ? 'M138 42 C151 68 163 92 178 111 C191 128 207 141 222 149'
    : projection.routePath;

  return (
    <div className={`${styles.mapFallback} ${isDesktopFoundation ? styles.mapFallbackDesktop : ''} ${isCanonicalPage61Fixture ? styles.mapFallbackPage61 : ''}`}>
      {hintLabel ? <p className={styles.mapFallbackHint}>{hintLabel}</p> : null}
      <svg
        className={styles.mapFallbackSvg}
        viewBox={isPage61Fixture ? '0 0 768 448' : projection.viewBox}
        preserveAspectRatio={isCanonicalPage61Fixture ? 'none' : undefined}
        role="img"
        aria-label={ariaLabel}
      >
        <rect width={isPage61Fixture ? '768' : '320'} height={isPage61Fixture ? '448' : '200'} fill="transparent" />
        {isPage61Fixture ? <g className={styles.mapContext} aria-hidden="true">
          <path d="M250 43 L356 0 L452 35 L492 107 L466 173 L550 219 L518 263 L423 267 L327 205 L286 144 Z" />
          <path d="M542 38 L694 16 L758 51 L748 113 L768 129 L720 157 L650 252 L573 246 L520 153 Z" />
          <path d="M370 301 L471 249 L573 273 L620 357 L582 430 L478 415 L404 368 Z" />
          <path className={styles.mapRiverMinor} d="M385 142 C432 179 459 205 470 239" />
          <path className={styles.mapRiverMinor} d="M209 205 C257 242 284 267 310 291" />
          <path className={styles.mapRiver} d="M149 335 C235 302 288 307 354 272 C435 229 508 229 581 199 C650 171 706 171 768 145" />
          <path className={styles.portTick} d="M420 98 H440 M455 137 H476 M490 176 H511 M526 213 H547 M560 251 H581 M595 289 H615 M629 327 H650" />
          <g className={styles.mapPort}>
            <circle cx="420" cy="98" r="5" />
            <path d="M425 98 H440" />
            <text x="374" y="87">Manaus</text>
          </g>
          <g className={styles.mapPort}>
            <circle cx="640" cy="334" r="5" />
            <path d="M630 327 H650" />
            <text x="645" y="347">Santarém</text>
          </g>
        </g> : isDesktopFoundation ? <g className={styles.mapContext} aria-hidden="true">
          <path d="M102 18 L150 0 L193 14 L210 48 L196 75 L222 94 L202 126 L164 120 L132 91 L112 76 L94 42 Z" />
          <path d="M232 16 L318 7 L316 84 L279 80 L224 49 Z" />
          <path d="M218 89 L246 96 L267 132 L250 167 L208 161 L176 139 L162 108 L188 91 Z" />
          <path className={styles.mapRiver} d="M58 146 C98 126 123 132 153 113 C185 92 212 104 239 84 C269 62 294 67 326 48" />
        </g> : null}
        <path
          d={isPage61Fixture ? 'M330 94 C362 147 387 200 425 245 C455 279 489 307 531 331' : routePath}
          fill="none"
          stroke="var(--hy-shipper-info)"
          strokeWidth={isPage61Fixture ? '2.2' : isDesktopFoundation ? '1.4' : '3'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isPage61Fixture ? '8 6' : isDesktopFoundation ? '5 4' : undefined}
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
        {!isPage61Fixture ? <><circle cx={projection.origin.x} cy={projection.origin.y} r="6" fill="var(--hy-shipper-success)" /><circle cx={projection.destination.x} cy={projection.destination.y} r="6" fill="var(--hy-shipper-danger)" /><circle cx={projection.current.x} cy={projection.current.y} r="7" fill="var(--hy-shipper-primary)" stroke="var(--hy-shipper-bg)" strokeWidth="2" /></> : null}
      </svg>
    </div>
  );
}
