'use client';

import { useTranslations } from 'next-intl';

import { Surface } from '@/shared/design-system/components/surface';

import type { MobileRouteDockViewModel } from '../../utils/mobile-route-view-model';
import { MobileOfflineStatusPill } from './mobile-offline-status-pill';
import styles from './mobile-route-dock.module.scss';

export type MobileRouteDockProps = {
  viewModel: MobileRouteDockViewModel;
  /** Apenas feedback visual quando o sheet de detalhes está aberto. */
  sheetOpen?: boolean;
};

export function MobileRouteDock({ viewModel, sheetOpen = false }: MobileRouteDockProps) {
  const tMap = useTranslations('operationsBoard.map');

  return (
    <Surface
      tone="glass"
      padding="none"
      className={[styles.dock, sheetOpen ? styles.dockSheetOpen : ''].filter(Boolean).join(' ')}
      data-testid="hydroway-map-mobile-route-dock"
      role="region"
      aria-label={tMap('mobileRouteDockAria')}
    >
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <strong className={styles.cargoId}>{viewModel.cargoId}</strong>
          <MobileOfflineStatusPill status={viewModel.syncStatus} />
        </div>

        <p className={styles.routeLine} aria-label={tMap('mobileRouteDockRouteAria')}>
          <span className={styles.routeEndpoint}>{viewModel.originLabel}</span>
          <span className={styles.routeArrow} aria-hidden>
            →
          </span>
          <span className={styles.routeEndpoint}>{viewModel.destinationLabel}</span>
        </p>

        <div className={styles.metricsRow}>
          {viewModel.etaLabel ? (
            <span className={styles.metric}>
              <span className={styles.metricLabel}>{tMap('mobileRouteEta')}</span>
              <span className={styles.metricValue}>{viewModel.etaLabel}</span>
            </span>
          ) : null}
          <span className={styles.metric}>
            <span className={styles.metricLabel}>{tMap('mapRouteProgress')}</span>
            <span className={styles.metricValue}>{viewModel.progressPercent}%</span>
          </span>
        </div>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={viewModel.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={tMap('mapRouteProgress')}
        >
          <div className={styles.progressFill} style={{ width: `${viewModel.progressPercent}%` }} />
        </div>
      </div>
    </Surface>
  );
}
