'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';

import { DsBadge } from '@/shared/design-system/components/badge';
import { Surface } from '@/shared/design-system/components/surface';
import { intlAppPaths } from '@/shared/routing/app-routes';

import type { MobileRouteSheetViewModel } from '../../utils/mobile-route-view-model';
import { MobileOfflineStatusSurface } from './mobile-offline-status-pill';
import styles from './mobile-route-sheet-content.module.scss';

export type MobileRouteSheetContentProps = {
  viewModel: MobileRouteSheetViewModel;
};

export function MobileRouteSheetContent({ viewModel }: MobileRouteSheetContentProps) {
  const tMap = useTranslations('operationsBoard.map');
  const tCommon = useTranslations('common');

  return (
    <div className={styles.content} data-testid="hydroway-map-mobile-route-sheet-content">
      <Surface tone="glass" padding="md" className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div>
            <span className={styles.sectionEyebrow}>{tMap('mobileRouteSheetTripSummary')}</span>
            <h3 className={styles.summaryTitle}>{viewModel.routeName}</h3>
          </div>
          <DsBadge tone="info">{tCommon(`cargoStatus.${viewModel.cargoStatus}`)}</DsBadge>
        </div>

        <p className={styles.summaryRoute}>
          <span>{viewModel.originLabel}</span>
          <span aria-hidden>→</span>
          <span>{viewModel.destinationLabel}</span>
        </p>

        <dl className={styles.summaryFacts}>
          {viewModel.vesselName ? (
            <div className={styles.fact}>
              <dt>{tMap('mobileRouteSheetVessel')}</dt>
              <dd>{viewModel.vesselName}</dd>
            </div>
          ) : null}
          <div className={styles.fact}>
            <dt>{tMap('mapRouteProgress')}</dt>
            <dd>{viewModel.progressPercent}%</dd>
          </div>
          {viewModel.etaLabel ? (
            <div className={styles.fact}>
              <dt>{tMap('mobileRouteEta')}</dt>
              <dd>{viewModel.etaLabel}</dd>
            </div>
          ) : null}
        </dl>
      </Surface>

      <section className={styles.section} aria-labelledby="mobile-route-timeline-heading">
        <h3 id="mobile-route-timeline-heading" className={styles.sectionTitle}>
          {tMap('mobileRouteSheetTimeline')}
        </h3>
        <ol className={styles.timeline}>
          {viewModel.timelineSteps.map((step) => (
            <li
              key={step.id}
              className={styles.timelineItem}
              data-state={step.state}
              data-testid={`hydroway-map-mobile-timeline-${step.id}`}
            >
              <span className={styles.timelineMarker} aria-hidden />
              <span className={styles.timelineLabel}>{tMap(step.labelKey)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="mobile-route-sync-heading">
        <h3 id="mobile-route-sync-heading" className={styles.sectionTitle}>
          {tMap('mobileRouteSheetSyncStatus')}
        </h3>
        <MobileOfflineStatusSurface status={viewModel.syncStatus} />
        <p className={styles.syncDetail}>{tMap(viewModel.syncDetailKey)}</p>
      </section>

      <section className={styles.section} aria-labelledby="mobile-route-next-heading">
        <h3 id="mobile-route-next-heading" className={styles.sectionTitle}>
          {tMap('mobileRouteSheetNextSegment')}
        </h3>
        <Surface tone="elevated" padding="md" className={styles.nextCard}>
          <p className={styles.nextLabel}>{viewModel.nextSegmentLabel}</p>
          {viewModel.nextSegmentDetail ? (
            <p className={styles.nextDetail}>{viewModel.nextSegmentDetail}</p>
          ) : null}
        </Surface>
        {viewModel.alertSummary ? (
          <p className={styles.alertNote}>
            <span className={styles.alertEyebrow}>{tMap('mobileRouteSheetAlert')}</span>
            {viewModel.alertSummary}
          </p>
        ) : null}
      </section>

      <section className={styles.section} aria-labelledby="mobile-route-actions-heading">
        <h3 id="mobile-route-actions-heading" className={styles.sectionTitle}>
          {tMap('mobileRouteSheetQuickActions')}
        </h3>
        <div className={styles.quickActions}>
          <button type="button" className={styles.quickAction} disabled>
            {tMap('mobileRouteQuickActionContact')}
          </button>
          <button type="button" className={styles.quickAction} disabled>
            {tMap('mobileRouteQuickActionReport')}
          </button>
        </div>
      </section>

      <Link
        href={intlAppPaths.cargos.cargoDetail(viewModel.cargoId)}
        className={styles.detailsLink}
        aria-label={tMap('mapOpenCargoDetails')}
      >
        {tMap('mapViewDetails')}
      </Link>
    </div>
  );
}
