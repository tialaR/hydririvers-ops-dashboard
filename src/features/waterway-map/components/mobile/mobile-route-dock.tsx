'use client';

import { ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Surface } from '@/shared/design-system/components/surface';

import type { MobileRouteDockViewModel } from '../../utils/mobile-route-view-model';
import { MobileOfflineStatusPill } from './mobile-offline-status-pill';
import styles from './mobile-route-dock.module.scss';

export type MobileRouteDockProps = {
  viewModel: MobileRouteDockViewModel;
  sheetOpen?: boolean;
  onOpenDetails: () => void;
};

export function MobileRouteDock({ viewModel, sheetOpen = false, onOpenDetails }: MobileRouteDockProps) {
  const tMap = useTranslations('operationsBoard.map');

  return (
    <Surface
      tone="glass"
      padding="none"
      interactive
      className={[styles.dock, sheetOpen ? styles.dockSheetOpen : ''].filter(Boolean).join(' ')}
      data-testid="hydroway-map-mobile-route-dock"
      data-sheet-open={sheetOpen ? 'true' : 'false'}
      role="button"
      tabIndex={0}
      aria-label={tMap('mobileRouteDockAria')}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails();
        }
      }}
    >
      <div className={styles.inner}>
        <div className={styles.handle} aria-hidden />

        <div className={styles.headerRow}>
          <strong className={styles.cargoId}>{viewModel.cargoId}</strong>
          <MobileOfflineStatusPill status={viewModel.syncStatus} />
        </div>

        <div className={styles.routeRow} aria-label={tMap('mobileRouteDockRouteAria')}>
          <span className={styles.endpoint}>
            <span className={styles.endpointLabel}>{tMap('hud.origin')}</span>
            <span className={styles.endpointValue}>{viewModel.originLabel}</span>
          </span>

          <span className={styles.corridor} aria-hidden>
            <span className={styles.corridorTrack}>
              <span
                className={styles.corridorProgress}
                style={{ width: `${viewModel.progressPercent}%` }}
              />
              <span
                className={styles.corridorMarker}
                style={{ left: `${viewModel.progressPercent}%` }}
              />
            </span>
            <span className={styles.corridorCurrent}>{viewModel.currentSegmentLabel}</span>
          </span>

          <span className={styles.endpoint}>
            <span className={styles.endpointLabel}>{tMap('hud.destination')}</span>
            <span className={styles.endpointValue}>{viewModel.destinationLabel}</span>
          </span>
        </div>

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

        <div className={styles.expandHint}>
          <span>{tMap('mobileRouteOpenDetails')}</span>
          <ChevronUp size={16} strokeWidth={2.25} aria-hidden />
        </div>
      </div>
    </Surface>
  );
}
