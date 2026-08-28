'use client';

import { useId, useMemo } from 'react';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  resolveOwnedCargoMapScene,
  resolveOwnedCargoMapSceneFallback,
} from '@/features/cargo/domain/resolve-owned-cargo-map-scene';
import styles from './owned-cargo-route-visual.module.sass';

type OwnedCargoRouteVisualVariant = 'compact' | 'hero' | 'map';

type OwnedCargoRouteVisualProps = {
  progressPercent: number;
  originLabel: string;
  destinationLabel: string;
  variant?: OwnedCargoRouteVisualVariant;
  testId?: string;
  /** Quando disponível, usa corredor schematico alinhado ao MapLibre. */
  cargo?: Cargo;
};

function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress));
}

function resolveOriginShort(label: string): string {
  return label.split(',')[0]?.trim() || label;
}

const ROUTE_PATH = 'M 24 88 Q 80 24, 120 56 T 216 32';

function SchematicMapCanvas({
  scene,
  variant,
  patternUid,
}: {
  scene: NonNullable<ReturnType<typeof resolveOwnedCargoMapScene>>;
  variant: OwnedCargoRouteVisualVariant;
  patternUid: string;
}) {
  const { viewBox, corridors, cities, route } = scene;
  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  const nearbyCities = cities.filter((city) => {
    const dx = city.point.x - route.origin.x;
    const dy = city.point.y - route.origin.y;
    const dist = Math.hypot(dx, dy);
    const dx2 = city.point.x - route.destination.x;
    const dy2 = city.point.y - route.destination.y;
    const dist2 = Math.hypot(dx2, dy2);
    return dist < viewBox.width * 0.55 || dist2 < viewBox.width * 0.55;
  });

  return (
    <svg className={styles.routeSvg} viewBox={viewBoxStr} aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`${patternUid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        </pattern>
        <linearGradient id={`${patternUid}-land`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={`${patternUid}-water`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <rect
        className={styles.mapLand}
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill={`url(#${patternUid}-land)`}
      />
      <rect
        className={styles.mapGrid}
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill={`url(#${patternUid}-grid)`}
        opacity={variant === 'map' ? 0.45 : 0.28}
      />
      <rect
        className={styles.mapWater}
        x={viewBox.x}
        y={viewBox.y + viewBox.height * 0.35}
        width={viewBox.width}
        height={viewBox.height * 0.65}
        fill={`url(#${patternUid}-water)`}
      />

      {corridors.map((corridor) => (
        <path
          key={corridor.id}
          className={styles.corridorPath}
          d={corridor.pathD}
          data-corridor={corridor.id}
        />
      ))}

      {nearbyCities.slice(0, variant === 'map' ? 6 : 10).map((city) => (
        <g key={city.id} className={styles.cityMarker} transform={`translate(${city.point.x}, ${city.point.y})`}>
          <circle className={styles.cityDot} r={variant === 'map' ? 3.5 : 4} />
          {variant === 'hero' ? (
            <text className={styles.cityLabel} x={6} y={-6}>{city.name}</text>
          ) : null}
        </g>
      ))}

      <path className={styles.schematicRoute} d={route.routePathD} />
      {route.traveledPathD ? (
        <path className={styles.schematicProgress} d={route.traveledPathD} />
      ) : null}

      <circle className={`${styles.point} ${styles.pointOrigin}`} cx={route.origin.x} cy={route.origin.y} r={7} />
      <circle className={`${styles.point} ${styles.pointDest}`} cx={route.destination.x} cy={route.destination.y} r={7} />

      <g transform={`translate(${route.vessel.x}, ${route.vessel.y})`}>
        <circle className={styles.vesselPulse} r={variant === 'map' ? 10 : 12} />
        <path className={styles.boat} d="M -7 0 L 0 -6 L 7 0 L 5 4 L -5 4 Z" />
      </g>

      {variant === 'map' ? (
        <>
          <text className={styles.scaleLabel} x={viewBox.x + 12} y={viewBox.y + viewBox.height - 10}>
            0 km
          </text>
          <text className={styles.scaleLabel} x={viewBox.x + viewBox.width - 48} y={viewBox.y + viewBox.height - 10}>
            Hydroway
          </text>
        </>
      ) : null}
    </svg>
  );
}

export function OwnedCargoRouteVisual({
  progressPercent,
  originLabel,
  destinationLabel,
  variant = 'compact',
  testId,
  cargo,
}: OwnedCargoRouteVisualProps) {
  const progress = clampProgress(progressPercent);
  const dashOffset = 100 - progress;
  const boatX = 24 + (192 * progress) / 100;
  const boatY = 88 - (56 * progress) / 100;
  const isMap = variant === 'map';
  const isHero = variant === 'hero';
  const usesSchematic = isMap || isHero;
  const patternUid = useId().replace(/:/g, '');

  const schematicScene = useMemo(() => {
    if (!usesSchematic) return null;
    if (cargo) {
      return resolveOwnedCargoMapScene(cargo, progress) ?? resolveOwnedCargoMapSceneFallback(progress);
    }
    return resolveOwnedCargoMapSceneFallback(progress);
  }, [cargo, progress, usesSchematic]);

  return (
    <div
      className={styles.root}
      data-variant={variant === 'compact' ? undefined : variant}
      data-testid={testId}
    >
      {usesSchematic && schematicScene ? (
        <SchematicMapCanvas scene={schematicScene} variant={variant} patternUid={patternUid} />
      ) : (
        <svg className={styles.routeSvg} viewBox="0 0 240 120" aria-hidden>
          <path className={styles.routePath} d={ROUTE_PATH} pathLength={100} />
          <path
            className={styles.routeProgress}
            d={ROUTE_PATH}
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={dashOffset}
          />
          <circle className={`${styles.point} ${styles.pointOrigin}`} cx="24" cy="88" r="5" />
          <circle className={`${styles.point} ${styles.pointDest}`} cx="216" cy="32" r="5" />
          <g transform={`translate(${boatX}, ${boatY})`}>
            <circle className={styles.vesselPulse} r="8" />
            <path className={styles.boat} d="M -6 0 L 0 -5 L 6 0 L 4 3 L -4 3 Z" />
          </g>
        </svg>
      )}

      {!isMap ? (
        <div className={styles.footer}>
          <span className={styles.endpoint}>{resolveOriginShort(originLabel)}</span>
          <span className={styles.progressChip}>{progress}%</span>
          <span className={styles.endpoint}>{resolveOriginShort(destinationLabel)}</span>
        </div>
      ) : null}
    </div>
  );
}
