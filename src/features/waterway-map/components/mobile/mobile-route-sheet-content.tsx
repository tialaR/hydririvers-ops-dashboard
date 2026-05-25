'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardList,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Ship,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';

import { DsBadge } from '@/shared/design-system/components/badge';
import { Surface } from '@/shared/design-system/components/surface';
import { intlAppPaths } from '@/shared/routing/app-routes';

import type { NextSegmentOperationalBrief } from '../../utils/parse-next-segment-operational-brief';
import type {
  MobileRouteNextSegmentStatusKey,
  MobileRouteSheetViewModel,
  MobileRouteTimelineStep,
  MobileSyncStatus,
} from '../../utils/mobile-route-view-model';
import type { MobileRouteSheetSnap } from './mobile-route-sheet';
import { MobileOfflineStatusPill } from './mobile-offline-status-pill';
import { MobileRouteSheetPartialSummary } from './mobile-route-sheet-partial-summary';
import styles from './mobile-route-sheet-content.module.scss';

export type MobileRouteSheetContentProps = {
  viewModel: MobileRouteSheetViewModel;
  snap?: MobileRouteSheetSnap;
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

function resolveCargoStatusTone(status: MobileRouteSheetViewModel['cargoStatus']): 'info' | 'success' | 'warning' | 'neutral' {
  if (status === 'boarded' || status === 'delivered') return 'success';
  if (status === 'bidding' || status === 'contracting') return 'warning';
  return 'info';
}

function resolveNextStatusTone(statusKey: MobileRouteNextSegmentStatusKey): 'success' | 'warning' | 'neutral' {
  if (statusKey === 'mobileRouteNextStatusOnTime') return 'success';
  if (statusKey === 'mobileRouteNextStatusDelayed') return 'warning';
  return 'warning';
}

function resolveTimelineCurrentStep(steps: MobileRouteTimelineStep[]) {
  return steps.find((step) => step.state === 'current') ?? steps.find((step) => step.state === 'done');
}

function RouteProgressTrack({
  progressPercent,
  className,
  testId,
  showVesselMarker = false,
}: {
  progressPercent: number;
  className?: string;
  testId?: string;
  showVesselMarker?: boolean;
}) {
  const progress = clampProgress(progressPercent);

  return (
    <div
      className={[
        styles.progressTrack,
        showVesselMarker ? styles.progressTrackMarked : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label={`${progress}%`}
      data-testid={testId}
    >
      <span className={styles.progressFill} style={{ width: `${progress}%` }} />
      {showVesselMarker ? (
        <span className={styles.progressVessel} style={{ left: `${progress}%` }} aria-hidden>
          <Navigation size={11} strokeWidth={2.5} />
        </span>
      ) : null}
    </div>
  );
}

function OperationalStatCard({
  icon,
  label,
  value,
  testId,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div className={styles.statCard} data-testid={testId}>
      <span className={styles.statIcon} aria-hidden>
        {icon}
      </span>
      <div className={styles.statCopy}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );
}

const SYNC_SIGNAL_PERCENT: Record<MobileSyncStatus, number> = {
  online: 100,
  syncing: 72,
  pending: 46,
  offline: 22,
};

function SyncStatusCard({
  status,
  headline,
  subline,
}: {
  status: MobileSyncStatus;
  headline: string;
  subline: string;
}) {
  const signal = SYNC_SIGNAL_PERCENT[status];

  return (
    <Surface tone="elevated" padding="sm" className={styles.syncCard} data-sync={status}>
      <div className={styles.syncCardHeader}>
        <span className={styles.syncCardIcon} aria-hidden>
          <RefreshCw size={18} strokeWidth={2.25} />
        </span>
        <div className={styles.syncCardHeadline}>
          <p className={styles.syncCardTitle}>{headline}</p>
          <p className={styles.syncCardSubline}>{subline}</p>
        </div>
        <MobileOfflineStatusPill status={status} />
      </div>
      <div
        className={styles.syncSignalTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={signal}
        aria-label={headline}
      >
        <span className={styles.syncSignalFill} style={{ width: `${signal}%` }} />
      </div>
    </Surface>
  );
}

function NextWaypointFact({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'warning';
}) {
  return (
    <div className={styles.nextFact} data-tone={tone}>
      <span className={styles.nextFactLabel}>{label}</span>
      <span className={styles.nextFactValue}>{value}</span>
    </div>
  );
}

function NextWaypointCard({
  label,
  statusLabel,
  statusTone,
  brief,
  situationLabel,
  impactLabel,
}: {
  label: string;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'neutral';
  brief?: NextSegmentOperationalBrief;
  situationLabel: string;
  impactLabel: string;
}) {
  const impactTone = statusTone === 'warning' ? 'warning' : 'neutral';

  return (
    <Surface tone="elevated" padding="sm" className={styles.nextCard}>
      <div className={styles.nextCardTop}>
        <span className={styles.nextWaypointIcon} aria-hidden>
          <MapPin size={20} strokeWidth={2.35} />
        </span>
        <div className={styles.nextCardHead}>
          <p className={styles.nextLabel}>{label}</p>
          {brief?.context ? <p className={styles.nextContext}>{brief.context}</p> : null}
        </div>
        <DsBadge tone={statusTone} className={styles.nextStatusBadge}>
          {statusLabel}
        </DsBadge>
      </div>
      {brief?.situation || brief?.impact ? (
        <div className={styles.nextFacts}>
          {brief.situation ? (
            <NextWaypointFact label={situationLabel} value={brief.situation} tone={impactTone} />
          ) : null}
          {brief.impact ? (
            <NextWaypointFact label={impactLabel} value={brief.impact} tone="neutral" />
          ) : null}
        </div>
      ) : null}
    </Surface>
  );
}

function TimelineMarker({ state }: { state: 'done' | 'current' | 'upcoming' }) {
  if (state === 'done') {
    return <CheckCircle2 size={17} strokeWidth={2.25} className={styles.timelineIconDone} aria-hidden />;
  }
  if (state === 'current') {
    return <CircleDot size={18} strokeWidth={2.35} className={styles.timelineIconCurrent} aria-hidden />;
  }
  return <Circle size={14} strokeWidth={2.25} className={styles.timelineIconUpcoming} aria-hidden />;
}

export function MobileRouteSheetContent({ viewModel, snap = 'partial' }: MobileRouteSheetContentProps) {
  const tMap = useTranslations('operationsBoard.map');
  const tCommon = useTranslations('common');
  const isExpanded = snap === 'expanded';
  const progress = clampProgress(viewModel.progressPercent);
  const currentTimelineStep = resolveTimelineCurrentStep(viewModel.timelineSteps);

  if (!isExpanded) {
    return (
      <div
        className={[styles.content, styles.contentPartial].join(' ')}
        data-testid="hydroway-map-mobile-route-sheet-content"
        data-layout="partial"
        data-snap={snap}
      >
        <MobileRouteSheetPartialSummary viewModel={viewModel} />
      </div>
    );
  }

  const routeHeadline = resolveRouteHeadline(viewModel);
  const nextBrief = viewModel.nextSegmentBrief;

  return (
    <div
      className={[styles.content, styles.contentExpanded].join(' ')}
      data-testid="hydroway-map-mobile-route-sheet-content"
      data-layout="expanded"
      data-snap={snap}
    >
      <Surface tone="elevated" padding="sm" className={styles.summaryCard}>
        <div className={styles.summaryTopRow}>
          <span className={styles.sectionEyebrow}>{tMap('mobileRouteSheetTripSummary')}</span>
          <DsBadge tone={resolveCargoStatusTone(viewModel.cargoStatus)} className={styles.summaryStatus}>
            {tCommon(`cargoStatus.${viewModel.cargoStatus}`)}
          </DsBadge>
        </div>

        <h3 className={styles.summaryRoute}>{routeHeadline}</h3>
        <p className={styles.summaryCargoRef}>{resolveRouteSecondaryRef(viewModel)}</p>

        <div className={styles.summaryProgressBlock}>
          <div className={styles.summaryProgressLabel}>
            <span>{tMap('mapRouteProgress')}</span>
            <strong>{progress}%</strong>
          </div>
          <RouteProgressTrack
            progressPercent={progress}
            showVesselMarker
            testId="hydroway-map-mobile-route-progress-expanded"
          />
        </div>

        <div
          className={styles.summaryStats}
          data-columns={
            viewModel.vesselName && viewModel.etaLabel
              ? '2'
              : viewModel.vesselName || viewModel.etaLabel
                ? '1'
                : '0'
          }
        >
          {viewModel.vesselName ? (
            <OperationalStatCard
              icon={<Ship size={15} strokeWidth={2.25} />}
              label={tMap('mobileRouteSheetVessel')}
              value={viewModel.vesselName}
            />
          ) : null}
          {viewModel.etaLabel ? (
            <OperationalStatCard
              icon={<Clock3 size={15} strokeWidth={2.25} />}
              label={tMap('mobileRouteEta')}
              value={viewModel.etaLabel}
            />
          ) : null}
        </div>
      </Surface>

      <section className={styles.module} aria-labelledby="mobile-route-sync-heading">
        <h3 id="mobile-route-sync-heading" className={styles.moduleTitle}>
          <RefreshCw size={14} strokeWidth={2.25} aria-hidden />
          {tMap('mobileRouteSheetSyncStatus')}
        </h3>
        <SyncStatusCard
          status={viewModel.syncStatus}
          headline={tMap(viewModel.syncDetailKey)}
          subline={tMap(`mobileRouteSheetSyncWhy.${viewModel.syncStatus}`)}
        />
      </section>

      <section className={styles.module} aria-labelledby="mobile-route-next-heading">
        <h3 id="mobile-route-next-heading" className={styles.moduleTitle}>
          <MapPin size={14} strokeWidth={2.25} aria-hidden />
          {tMap('mobileRouteSheetNextSegment')}
        </h3>
        <NextWaypointCard
          label={viewModel.nextSegmentLabel}
          statusLabel={tMap(viewModel.nextSegmentStatusKey)}
          statusTone={resolveNextStatusTone(viewModel.nextSegmentStatusKey)}
          brief={nextBrief}
          situationLabel={tMap('mobileRouteSheetNextSituation')}
          impactLabel={tMap('mobileRouteSheetNextImpact')}
        />
        <p className={styles.nextModuleHint}>{tMap('mobileRouteSheetNextSegmentHint')}</p>
        {viewModel.alertSummary ? (
          <Surface tone="elevated" padding="sm" className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <AlertTriangle size={15} strokeWidth={2.25} aria-hidden />
              <span className={styles.alertEyebrow}>{tMap('mobileRouteSheetAlert')}</span>
            </div>
            <p className={styles.alertCopy}>{viewModel.alertSummary}</p>
          </Surface>
        ) : null}
      </section>

      <section className={styles.module} aria-labelledby="mobile-route-timeline-heading">
        <h3 id="mobile-route-timeline-heading" className={styles.moduleTitle}>
          {tMap('mobileRouteSheetTimeline')}
        </h3>
        {currentTimelineStep ? (
          <p className={styles.timelineCurrent}>
            <span className={styles.timelineCurrentLabel}>{tMap('mobileRouteTimelineNow')}</span>
            <strong>{tMap(currentTimelineStep.labelKey)}</strong>
          </p>
        ) : null}
        <ol className={styles.stepper} aria-label={tMap('mobileRouteSheetTimeline')}>
          {viewModel.timelineSteps.map((step) => (
            <li
              key={step.id}
              className={styles.stepperItem}
              data-state={step.state}
              data-testid={`hydroway-map-mobile-timeline-${step.id}`}
            >
              <span className={styles.stepperMarker} aria-hidden>
                <TimelineMarker state={step.state} />
              </span>
              <span className={styles.stepperLabel}>{tMap(step.labelKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.actionsModule} aria-labelledby="mobile-route-actions-heading">
        <h3 id="mobile-route-actions-heading" className={styles.moduleTitle}>
          {tMap('mobileRouteSheetQuickActions')}
        </h3>
        <div className={styles.quickActions}>
          <button type="button" className={styles.quickAction} disabled>
            <span className={styles.quickActionIcon} aria-hidden>
              <Phone size={18} strokeWidth={2.25} />
            </span>
            <span className={styles.quickActionCopy}>
              <span className={styles.quickActionTitle}>{tMap('mobileRouteQuickActionContact')}</span>
              <span className={styles.quickActionHint}>{tMap('mobileRouteQuickActionContactHint')}</span>
            </span>
          </button>
          <button type="button" className={styles.quickAction} disabled>
            <span className={styles.quickActionIcon} aria-hidden>
              <ClipboardList size={18} strokeWidth={2.25} />
            </span>
            <span className={styles.quickActionCopy}>
              <span className={styles.quickActionTitle}>{tMap('mobileRouteQuickActionReport')}</span>
              <span className={styles.quickActionHint}>{tMap('mobileRouteQuickActionReportHint')}</span>
            </span>
          </button>
        </div>
        <Link
          href={intlAppPaths.cargos.cargoDetail(viewModel.cargoId)}
          className={styles.detailsLink}
          aria-label={tMap('mapOpenCargoDetails')}
        >
          <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
          {tMap('mapViewDetails')}
        </Link>
      </section>
    </div>
  );
}
