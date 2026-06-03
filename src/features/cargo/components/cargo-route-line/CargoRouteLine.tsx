import { BoatIcon, RouteBoatIcon } from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-icons';

import styles from './CargoRouteLine.module.scss';

export type CargoRouteLineVariant = 'card' | 'sheet';

export type CargoRouteLineProps = {
  originLabel: string;
  destinationLabel: string;
  originMeta?: string;
  destinationMeta?: string;
  variant?: CargoRouteLineVariant;
  className?: string;
};

export function CargoRouteLine({
  originLabel,
  destinationLabel,
  originMeta,
  destinationMeta,
  variant = 'card',
  className,
}: CargoRouteLineProps) {
  if (variant === 'sheet') {
    return (
      <div className={[styles.sheetRouteBox, className].filter(Boolean).join(' ')}>
        <div>
          <strong>{originLabel}</strong>
          {originMeta ? <span>{originMeta}</span> : null}
        </div>
        <span aria-hidden="true">
          <BoatIcon />
        </span>
        <div>
          <strong>{destinationLabel}</strong>
          {destinationMeta ? <span>{destinationMeta}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={[styles.routeLine, className].filter(Boolean).join(' ')}>
      <div className={styles.routeEndpoint}>
        <span className={styles.routeDot} data-tone="origin" aria-hidden="true" />
        <span className={styles.routeCity}>{originLabel}</span>
      </div>
      <span className={styles.dashedRoute} aria-hidden="true">
        <RouteBoatIcon />
      </span>
      <div className={styles.routeEndpoint}>
        <span className={styles.routeDot} data-tone="destination" aria-hidden="true" />
        <span className={styles.routeCity}>{destinationLabel}</span>
      </div>
    </div>
  );
}
