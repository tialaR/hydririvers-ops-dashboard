'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  Clock3,
  MapPin,
  Navigation,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DsBadge } from '@/shared/design-system/components/badge';
import { Surface } from '@/shared/design-system/components/surface';

import type { MobileRouteSheetViewModel } from '../../utils/mobile-route-view-model';
import { MobileOfflineStatusPill } from './mobile-offline-status-pill';
import styles from './mobile-route-sheet-partial-summary.module.scss';

export type MobileRouteSheetPartialSummaryProps = {
  viewModel: MobileRouteSheetViewModel;
};

function clampProgress(progressPercent: number) {
  return Math.max(0, Math.min(100, progressPercent));
}

function resolveRouteHeadline(viewModel: MobileRouteSheetViewModel) {
  return `${viewModel.originLabel} → ${viewModel.destinationLabel}`;
}

function resolveRouteSecondaryRef(viewModel: MobileRouteSheetViewModel) {
  return `${viewModel.cargoId} · ${viewModel.routeTechnicalRef}`;
}

function RouteProgressTrack({
  progressPercent,
  testId,
}: {
  progressPercent: number;
  testId?: string;
}) {
  const progress = clampProgress(progressPercent);

  return (
    <div
      className={[styles.progressTrack, styles.progressTrackMarked].join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label={`${progress}%`}
      data-testid={testId}
    >
      <span className={styles.progressFill} style={{ width: `${progress}%` }} />
      <span className={styles.progressVessel} style={{ left: `${progress}%` }} aria-hidden>
        <Navigation size={11} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function OperationalStatCard({
  icon,
  label,
  value,
  testId,
  children,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  testId?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.statCard} data-testid={testId}>
      <span className={styles.statIcon} aria-hidden>
        {icon}
      </span>
      <div className={styles.statCopy}>
        <span className={styles.statLabel}>{label}</span>
        {value ? <span className={styles.statValue}>{value}</span> : null}
        {children}
      </div>
    </div>
  );
}

export function MobileRouteSheetPartialSummary({ viewModel }: MobileRouteSheetPartialSummaryProps) {
  const tMap = useTranslations('operationsBoard.map');
  const tCommon = useTranslations('common');
  const progress = clampProgress(viewModel.progressPercent);
  const hasAlert = Boolean(viewModel.alertSummary);
  const healthOk = viewModel.syncStatus === 'online' && !hasAlert;
  const routeHeadline = resolveRouteHeadline(viewModel);
  const routeSecondaryRef = resolveRouteSecondaryRef(viewModel);

  return (
    <Surface tone="elevated" padding="none" className={styles.partialCard}>
      <div className={styles.partialRouteRow}>
        <span className={styles.iconBadge} aria-hidden>
          <Navigation size={15} strokeWidth={2.25} />
        </span>
        <div className={styles.partialRouteCopy}>
          <p className={styles.partialRouteTitle}>{routeHeadline}</p>
          <p className={styles.partialRouteSecondary}>{routeSecondaryRef}</p>
        </div>
        <div className={styles.partialRouteTrailing}>
          <DsBadge tone="info" className={styles.partialStatusBadge}>
            {tCommon(`cargoStatus.${viewModel.cargoStatus}`)}
          </DsBadge>
          {healthOk ? (
            <span className={styles.healthChip} data-state="ok">
              <CheckCircle2 size={13} strokeWidth={2.25} aria-hidden />
            </span>
          ) : null}
          {hasAlert ? (
            <span className={styles.healthChip} data-state="alert">
              <AlertTriangle size={13} strokeWidth={2.25} aria-hidden />
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.partialStack}>
        <div
          className={styles.partialMetricsGrid}
          data-columns={viewModel.etaLabel ? '4' : '3'}
        >
          {viewModel.etaLabel ? (
            <OperationalStatCard
              icon={<Clock3 size={15} strokeWidth={2.25} />}
              label={tMap('mobileRouteEtaShort')}
              value={viewModel.etaLabel}
              testId="hydroway-map-mobile-route-eta"
            />
          ) : null}
          <OperationalStatCard
            icon={<TrendingUp size={15} strokeWidth={2.25} />}
            label={tMap('mobileRouteProgressShort')}
            value={`${progress}%`}
            testId="hydroway-map-mobile-route-progress-stat"
          />
          <OperationalStatCard
            icon={<RefreshCw size={15} strokeWidth={2.25} />}
            label={tMap('mobileRouteSyncShort')}
            testId="hydroway-map-mobile-route-sync"
          >
            <div className={styles.partialSyncValue}>
              <MobileOfflineStatusPill status={viewModel.syncStatus} />
            </div>
          </OperationalStatCard>
          <OperationalStatCard
            icon={<MapPin size={15} strokeWidth={2.25} />}
            label={tMap('mobileRouteNextPointShort')}
            value={viewModel.nextSegmentLabel}
            testId="hydroway-map-mobile-route-next"
          >
            <span className={styles.partialNextStatusChip}>
              {tMap(viewModel.nextSegmentStatusKey)}
            </span>
          </OperationalStatCard>
        </div>

        <div className={styles.partialProgressSection}>
          <div className={styles.partialProgressHeader}>
            <TrendingUp size={13} strokeWidth={2.25} aria-hidden />
            <span>{tMap('mapRouteProgress')}</span>
            <strong>{progress}%</strong>
          </div>
          <RouteProgressTrack
            progressPercent={progress}
            testId="hydroway-map-mobile-route-progress"
          />
        </div>

        <div className={styles.partialFillBand} data-testid="hydroway-map-mobile-route-partial-fill">
          <div className={styles.partialFillRow}>
            <RefreshCw size={14} strokeWidth={2.25} aria-hidden />
            <p className={styles.partialFillCopy}>{tMap(viewModel.syncDetailKey)}</p>
          </div>
          <div className={styles.partialFillRow}>
            <MapPin size={14} strokeWidth={2.25} aria-hidden />
            <p className={styles.partialFillCopy}>
              <span className={styles.partialFillLabel}>{tMap('mobileRouteCurrentSegment')}</span>
              <span className={styles.partialFillValue}>{viewModel.currentSegmentLabel}</span>
            </p>
          </div>
          {viewModel.alertSummary ? (
            <div className={styles.partialAlertRow} data-testid="hydroway-map-mobile-route-partial-alert">
              <AlertTriangle size={14} strokeWidth={2.25} aria-hidden />
              <p className={styles.partialFillCopy}>{viewModel.alertSummary}</p>
            </div>
          ) : null}
          <p className={styles.partialExpandHint}>
            <ChevronUp size={14} strokeWidth={2.25} aria-hidden />
            {tMap('mobileRoutePartialExpandHint')}
          </p>
        </div>
      </div>
    </Surface>
  );
}
