'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { Ship } from 'lucide-react';
import type { NextMonitoredEndpoint, TrackingRoute } from './hydro-route-tracking.types';
import {
  approximatePathLength,
  closestPathProgressNormalized,
  getPointAtProgress,
  getVesselHeadingDegrees,
  pathToSvgD
} from './hydro-route-tracking.helpers';
import { formatSvgCoordinatePair, formatSvgNumber } from './hydro-route-tracking-svg-format';
import {
  TRACKING_GRID_HORIZONTAL_COUNT,
  TRACKING_GRID_HORIZONTAL_OFFSET,
  TRACKING_GRID_HORIZONTAL_STEP,
  TRACKING_GRID_VERTICAL_COUNT,
  TRACKING_GRID_VERTICAL_STEP,
  TRACKING_VIEWBOX
} from './hydro-route-tracking.constants';
import styles from './hydro-route-tracking-map.module.scss';

export type HydroRouteTrackingMapLayerMode = 'all' | 'route' | 'network';

export type HydroRouteTrackingMapSvgProps = {
  route: TrackingRoute;
  layerMode: HydroRouteTrackingMapLayerMode;
  /** ID do gradiente radial usado pelos POIs externos (ex.: `${svgUid}-card-dot`). */
  poiGradientId?: string;
  svgDecoration?: ReactNode;
  children?: ReactNode;
};

export type HydroRouteTrackingMapProps = HydroRouteTrackingMapSvgProps;

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function sameMonitoredEndpoint(a: NextMonitoredEndpoint, b: NextMonitoredEndpoint): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'checkpoint' && b.kind === 'checkpoint') return a.index === b.index;
  return true;
}

function formatEndpointLabel(
  endpoint: NextMonitoredEndpoint,
  route: TrackingRoute,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  if (endpoint.kind === 'origin') {
    return route.origin.label.split(',')[0]?.trim() ?? route.origin.label;
  }
  if (endpoint.kind === 'destination') {
    return route.destination.label.split(',')[0]?.trim() ?? route.destination.label;
  }
  return t('waypointCheckpoint', { index: endpoint.index + 1 });
}

export function HydroRouteTrackingMapHeader({ route }: { route: TrackingRoute }) {
  const t = useTranslations('operationsBoard.mapTracking');
  const shortOrigin = route.origin.label.split(',')[0]?.trim() ?? route.origin.label;
  const shortDestination = route.destination.label.split(',')[0]?.trim() ?? route.destination.label;
  const statusClass = styles[`status_${route.status}` as keyof typeof styles] ?? styles.status_planned;
  const tone = route.status;
  const fromLabel = formatEndpointLabel(route.nextMonitored.from, route, t);
  const toLabel = formatEndpointLabel(route.nextMonitored.to, route, t);
  const showPair = !sameMonitoredEndpoint(route.nextMonitored.from, route.nextMonitored.to);

  return (
    <header className={styles.headerShell}>
      <h2 className={styles.srOnly}>{t('title')}</h2>
      <div className={styles.headerCard}>
        <div className={styles.headerTopRow}>
          <span className={styles.headerShipIcon} aria-hidden>
            <Ship size={22} strokeWidth={2.2} />
          </span>
          <div className={styles.headerRouteBlock}>
            <p className={styles.headerRouteLine}>
              {shortOrigin}
              <span className={styles.headerRouteArrow} aria-hidden>
                {' '}
                →
                {' '}
              </span>
              {shortDestination}
            </p>
            <p className={styles.headerCargoMeta}>
              <span className={styles.headerCargoId}>{route.cargoId.toUpperCase()}</span>
              <span className={styles.headerCargoSep} aria-hidden>
                {' · '}
              </span>
              <span className={styles.headerCargoTitle}>{route.cargoLabel}</span>
            </p>
          </div>
          <span className={cx(styles.statusPill, statusClass)} data-tone={tone}>
            {t(`statusNames.${route.status}`)}
          </span>
        </div>

        <div className={styles.headerProgressBlock}>
          <div className={styles.headerProgressMeta}>
            <span className={styles.headerProgressLabel}>{t('progress')}</span>
            <span className={styles.headerProgressValue}>{t('progressValue', { value: route.progress })}</span>
          </div>
          <div className={styles.progressTrackLarge} aria-hidden>
            <div className={styles.progressFillLarge} style={{ width: `${route.progress}%` }} />
          </div>
        </div>

        <div className={styles.headerChipRow}>
          <span className={styles.headerChipPrimary}>{route.river}</span>
          {typeof route.distanceKm === 'number' ? (
            <span className={styles.headerChipMuted}>{t('distanceValue', { km: route.distanceKm })}</span>
          ) : null}
          {route.eta ? <span className={styles.headerChipMuted}>{route.eta}</span> : null}
        </div>

        <div className={styles.nextMonitoredCard}>
          <span className={styles.nextMonitoredKicker}>{t('nextMonitoredLabel')}</span>
          <p className={styles.nextMonitoredRiver}>
            {t('nextMonitoredCorridorLine', { river: route.nextMonitored.primaryRiver })}
          </p>
          {showPair ? (
            <p className={styles.nextMonitoredPair}>
              {t('nextMonitoredPairLine', { from: fromLabel, to: toLabel })}
            </p>
          ) : null}
        </div>

        <div className={styles.headerMetaDesktop} aria-label={t('headerMetaDesktopAria')}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('selectedCargo')}</span>
            <span className={styles.metaValue}>{route.cargoId.toUpperCase()}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('origin')}</span>
            <span className={styles.metaValue}>{shortOrigin}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('destination')}</span>
            <span className={styles.metaValue}>{shortDestination}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('corridor')}</span>
            <span className={styles.metaValue}>{route.river}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('status')}</span>
            <span className={styles.metaValue}>{t(`statusNames.${route.status}`)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function HydroRouteTrackingMapSvg({ route, layerMode, poiGradientId, svgDecoration, children }: HydroRouteTrackingMapSvgProps) {
  const t = useTranslations('operationsBoard.mapTracking');
  const uid = useId().replace(/:/g, '');
  const showNetwork = layerMode !== 'route';
  const showRoute = layerMode !== 'network';
  const pathD = pathToSvgD(route.path);
  const pathLength = approximatePathLength(route.path);
  const progress01 = route.progress / 100;
  const mid = getPointAtProgress(route.path, 0.5);
  const shortOrigin = route.origin.label.split(',')[0]?.trim() ?? route.origin.label;
  const shortDestination = route.destination.label.split(',')[0]?.trim() ?? route.destination.label;
  const vesselAngle = getVesselHeadingDegrees(route);
  const [vx, vy] = route.currentPosition.coordinates;
  const vesselPathT = closestPathProgressNormalized(route.path, vx, vy);
  const wakeFrom = getPointAtProgress(route.path, Math.max(0, vesselPathT - 0.055));
  const pathLengthFmt = formatSvgNumber(pathLength);
  const dashTraveled = formatSvgNumber(pathLength * progress01);
  const dashFuture = formatSvgNumber(pathLength * (1 - progress01));
  const dashOffset = formatSvgNumber(-pathLength * progress01);
  const wakeD = `M ${formatSvgCoordinatePair(wakeFrom)} L ${formatSvgCoordinatePair([vx, vy])}`;
  const chipTranslate = `translate(${formatSvgNumber(mid[0])}, ${formatSvgNumber(mid[1])})`;
  const originTranslate = `translate(${formatSvgNumber(route.origin.coordinates[0])}, ${formatSvgNumber(route.origin.coordinates[1])})`;
  const destTranslate = `translate(${formatSvgNumber(route.destination.coordinates[0])}, ${formatSvgNumber(route.destination.coordinates[1])})`;
  const vesselTransform = `translate(${formatSvgNumber(vx)}, ${formatSvgNumber(vy)}) rotate(${formatSvgNumber(vesselAngle)})`;

  const idGlow = `${uid}-glow`;
  const idRoute = `${uid}-route`;
  const idRouteDim = `${uid}-routeDim`;
  const idSpineGlow = `${uid}-spineGlow`;
  const idFlow = `${uid}-flow`;

  const vb = TRACKING_VIEWBOX;

  return (
    <div className={styles.svgWrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${vb.width} ${vb.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={t('waterwayMap')}
      >
        <defs>
          <filter id={idGlow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0.95 0.85 0 0  0 0.55 0.95 0 0  0 0.35 1 0 0  0 0 0 0.9 0"
              result="softGlow"
            />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={idSpineGlow} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="sblur" />
            <feColorMatrix
              in="sblur"
              type="matrix"
              values="0 0.75 0.55 0 0  0 0.45 0.85 0 0  0 0.25 0.95 0 0  0 0 0 0.55 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={idRoute} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2fe0d0" />
            <stop offset="50%" stopColor="#4fffd3" />
            <stop offset="100%" stopColor="#46d8e7" />
          </linearGradient>
          <linearGradient id={idRouteDim} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a3a48" />
            <stop offset="100%" stopColor="#58a9ff" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={idFlow} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2fe0d0" stopOpacity="0" />
            <stop offset="45%" stopColor="#4fffd3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#46d8e7" stopOpacity="0" />
          </linearGradient>
          {poiGradientId ? (
            <radialGradient id={poiGradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e8fbff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#2fe0d0" stopOpacity="0" />
            </radialGradient>
          ) : null}
        </defs>

        <g>
          {Array.from({ length: TRACKING_GRID_VERTICAL_COUNT }, (_, index) => (
            <line
              key={`v-${index}`}
              x1={index * TRACKING_GRID_VERTICAL_STEP}
              x2={index * TRACKING_GRID_VERTICAL_STEP}
              y1="0"
              y2={String(vb.height)}
              className={styles.gridLine}
            />
          ))}
          {Array.from({ length: TRACKING_GRID_HORIZONTAL_COUNT }, (_, index) => (
            <line
              key={`h-${index}`}
              x1="0"
              x2={String(vb.width)}
              y1={index * TRACKING_GRID_HORIZONTAL_STEP + TRACKING_GRID_HORIZONTAL_OFFSET}
              y2={index * TRACKING_GRID_HORIZONTAL_STEP + TRACKING_GRID_HORIZONTAL_OFFSET}
              className={styles.gridLine}
            />
          ))}
        </g>

        {showNetwork ? (
          <>
            <g className={styles.waterMass}>
              <path d="M18 306 C104 262 194 228 296 212 C398 194 514 190 612 194 C728 198 842 178 986 122 L986 166 C842 214 732 236 624 234 C520 232 410 240 316 260 C210 282 118 314 18 356 Z" />
              <path d="M18 170 C116 146 198 136 278 138 C366 140 432 160 486 194 C550 234 630 226 706 194 C792 158 882 116 986 78 L986 116 C884 154 796 188 714 220 C634 252 544 262 476 230 C424 206 360 194 278 194 C202 194 122 208 18 238 Z" />
              <path d="M170 360 C246 332 308 318 366 326 C426 334 474 326 536 288 C598 248 652 204 720 160 L742 176 C674 222 620 270 560 312 C490 360 424 380 356 374 C290 368 236 372 170 392 Z" />
            </g>
            <g className={styles.waterSurfaceSheen}>
              <path d="M18 306 C104 262 194 228 296 212 C398 194 514 190 612 194 C728 198 842 178 986 122 L986 166 C842 214 732 236 624 234 C520 232 410 240 316 260 C210 282 118 314 18 356 Z" />
            </g>
            <g className={styles.riverSecondary}>
              <path d="M242 138 C292 154 338 182 384 226 C430 270 480 292 544 286 C604 280 674 242 742 186" />
              <path d="M504 60 C528 112 562 146 612 154 C680 164 756 154 834 110" />
              <path d="M258 206 C284 248 292 290 300 330 C306 364 328 394 376 414" />
              <path d="M636 216 C680 254 728 306 790 356 C846 402 914 420 990 420" />
              <path d="M120 98 C220 86 328 98 406 142 C468 176 548 182 628 168 C710 154 804 112 930 64" />
              <path d="M146 422 C232 388 314 374 394 384 C476 394 560 370 640 316 C716 264 786 198 868 154" />
            </g>
          </>
        ) : null}

        {showRoute ? (
          <g>
            <path
              className={styles.routeSpine}
              d={pathD}
              fill="none"
              stroke={`url(#${idFlow})`}
              filter={`url(#${idSpineGlow})`}
            />
            <path className={styles.routeRiverBed} d={pathD} fill="none" stroke={`url(#${idRouteDim})`} />
            <path className={styles.routeFullDim} d={pathD} fill="none" />
            <path
              className={styles.routeFuture}
              d={pathD}
              fill="none"
              strokeDasharray={`${dashFuture} ${pathLengthFmt}`}
              strokeDashoffset={dashOffset}
            />
            <path
              className={styles.routeGlow}
              d={pathD}
              fill="none"
              stroke={`url(#${idRoute})`}
              filter={`url(#${idGlow})`}
              strokeDasharray={`${dashTraveled} ${pathLengthFmt}`}
            />
            <path
              className={styles.routeCore}
              d={pathD}
              fill="none"
              stroke={`url(#${idRoute})`}
              strokeDasharray={`${dashTraveled} ${pathLengthFmt}`}
            />
          </g>
        ) : null}

        {svgDecoration}

        {showRoute ? (
          <g>
            <g className={styles.routeChipGroup} transform={chipTranslate}>
              <rect className={styles.routeChipRect} x="-128" y="-38" width="256" height="60" rx="14" ry="14" />
              <text x="0" y="-16" textAnchor="middle" className={styles.routeChipRiver}>
                {route.river}
              </text>
              <text x="0" y="10" textAnchor="middle" className={styles.routeChipRoute}>
                {`${shortOrigin} → ${shortDestination}`}
              </text>
            </g>

            <path className={styles.vesselWake} d={wakeD} fill="none" />

            <g transform={originTranslate}>
              <title>{t('originTitle', { location: route.origin.label })}</title>
              <circle className={styles.markerOriginHalo} r="26" />
              <circle className={styles.markerOrigin} r="20" />
              <g transform="translate(-9, -9)" className={styles.markerIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="5" r="3" fill="none" stroke="#4fffd3" strokeWidth="2.2" />
                  <path d="M12 22V8" fill="none" stroke="#4fffd3" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3" fill="none" stroke="#4fffd3" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </g>
              <text x="0" y="36" textAnchor="middle" className={styles.mapLabel}>
                {shortOrigin}
              </text>
            </g>

            <g transform={destTranslate}>
              <title>{t('destinationTitle', { location: route.destination.label })}</title>
              <circle className={styles.markerDestHalo} r="26" />
              <circle className={styles.markerDest} r="20" />
              <g transform="translate(-9, -9)" className={styles.markerIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                    fill="none"
                    stroke="#78b7ff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="3" fill="none" stroke="#78b7ff" strokeWidth="2.2" />
                </svg>
              </g>
              <text x="0" y="36" textAnchor="middle" className={styles.mapLabel}>
                {shortDestination}
              </text>
            </g>

            {route.checkpoints.map((cp) => (
              <circle
                key={cp.id}
                className={styles.checkpoint}
                cx={formatSvgNumber(cp.coordinates[0])}
                cy={formatSvgNumber(cp.coordinates[1])}
                r="3.2"
                aria-hidden
              />
            ))}

            <g
              className={styles.vesselGroup}
              transform={vesselTransform}
              aria-label={t('vesselTransit', { origin: route.origin.label, destination: route.destination.label })}
            >
              <circle className={styles.vesselOuterGlow} r="38" />
              <circle className={styles.vesselHalo} r="30" />
              <g transform="translate(-68, -24) scale(1.08)">
                <path d="M8 28 L86 28 L114 23 L106 35 L18 36 Z" className={styles.vesselHull} />
                <rect x="36" y="12" width="22" height="8" rx="1.4" className={styles.vesselCabin} />
                <rect x="61" y="11" width="18" height="9" rx="1.2" className={styles.vesselContainer} />
                <rect x="82" y="10" width="15" height="10" rx="1.2" className={styles.vesselContainer} />
                <path d="M114 22 L124 18 L124 27 Z" className={styles.vesselArrow} />
              </g>
            </g>
          </g>
        ) : null}
      </svg>

      {children ? <div className={styles.overlayLayer}>{children}</div> : null}
    </div>
  );
}

export function HydroRouteTrackingMapLegend() {
  const t = useTranslations('operationsBoard.mapTracking');

  return (
    <div className={styles.legend} aria-label={t('legendAria')}>
      <span className={styles.legendTitle}>{t('legendTitle')}</span>
      <div className={styles.legendScroll}>
        <span className={styles.legendChip}>
          <i className={cx(styles.swatch, styles.swatchPlanned)} aria-hidden />
          {t('legend.planned')}
        </span>
        <span className={styles.legendChip}>
          <i className={cx(styles.swatch, styles.swatchInTransit)} aria-hidden />
          {t('legend.inTransit')}
        </span>
        <span className={styles.legendChip}>
          <i className={cx(styles.swatch, styles.swatchInOperation)} aria-hidden />
          {t('legend.inOperation')}
        </span>
        <span className={styles.legendChip}>
          <i className={cx(styles.swatch, styles.swatchDelayed)} aria-hidden />
          {t('legend.delayed')}
        </span>
        <span className={styles.legendChip}>
          <i className={cx(styles.swatch, styles.swatchCompleted)} aria-hidden />
          {t('legend.completed')}
        </span>
      </div>
    </div>
  );
}

/** Mapa completo (header + carta + legenda). No painel do board, prefira os subcomponentes para manter o zoom só na carta. */
export function HydroRouteTrackingMap({ route, layerMode, poiGradientId, svgDecoration, children }: HydroRouteTrackingMapProps) {
  return (
    <div className={styles.root}>
      <HydroRouteTrackingMapHeader route={route} />
      <HydroRouteTrackingMapSvg route={route} layerMode={layerMode} poiGradientId={poiGradientId} svgDecoration={svgDecoration}>
        {children}
      </HydroRouteTrackingMapSvg>
      <HydroRouteTrackingMapLegend />
    </div>
  );
}
