'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '../../domain/hydroway-map-model.types';
import { intlAppPaths } from '@/shared/routing/app-routes';

import styles from './mobile-hydroway-map.module.scss';

type MobileMapBottomSummaryProps = {
  cargo: Cargo;
  model: HydrowayMapModel;
  progressPercent: number;
};

export function MobileMapBottomSummary({ cargo, model, progressPercent }: MobileMapBottomSummaryProps) {
  const tMap = useTranslations('operationsBoard.map');
  const tCommon = useTranslations('common');
  const originLabel = model.metadata.originLabel || cargo.origin;
  const destinationLabel = model.metadata.destinationLabel || cargo.destination;
  const operationalStatus = model.metadata.operationalStatus;

  return (
    <section
      className={styles.bottomSummary}
      aria-label={tMap('mapCargoSummary')}
      data-testid="hydroway-map-mobile-bottom-summary"
    >
      <div className={styles.bottomSummaryHeader}>
        <strong className={styles.bottomSummaryCargoId}>{cargo.id}</strong>
        <span className={styles.bottomSummaryStatus}>{tCommon(`cargoStatus.${cargo.status}`)}</span>
      </div>

      <p className={styles.bottomSummaryRoute}>
        <span className={styles.bottomSummaryOrigin}>{originLabel}</span>
        <span className={styles.bottomSummaryArrow} aria-hidden>
          →
        </span>
        <span className={styles.bottomSummaryDestination}>{destinationLabel}</span>
      </p>

      <div className={styles.bottomSummaryProgressRow}>
        <span className={styles.bottomSummaryProgressLabel}>{tMap('mapRouteProgress')}</span>
        <span className={styles.bottomSummaryProgressValue}>{progressPercent}%</span>
      </div>

      <div
        className={styles.bottomSummaryProgressTrack}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={tMap('mapRouteProgress')}
      >
        <div className={styles.bottomSummaryProgressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {operationalStatus ? (
        <p className={styles.bottomSummaryEvent}>{operationalStatus}</p>
      ) : null}

      <Link
        href={intlAppPaths.cargos.cargoDetail(cargo.id)}
        className={styles.bottomSummaryAction}
        aria-label={tMap('mapOpenCargoDetails')}
      >
        {tMap('mapViewDetails')}
      </Link>
    </section>
  );
}
