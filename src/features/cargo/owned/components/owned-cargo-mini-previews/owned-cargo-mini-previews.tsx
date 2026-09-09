'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import type {
  OwnedCargoDocumentsPreview,
  OwnedCargoPreviewPanel,
  OwnedCargoPreviewState,
  OwnedCargoProcessPreview,
  OwnedCargoRisksPreview,
  OwnedCargoTimelinePreview,
  OwnedCargoTrackingPreview,
} from '@/features/cargo/domain/derive-owned-cargo-detail';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-mini-previews.module.sass';

type MiniPreviewShellProps = {
  panel: OwnedCargoPreviewPanel;
  state: OwnedCargoPreviewState;
  title: string;
  icon: HydroIconName;
  metric: string;
  statusLabel: string;
  statusTone?: 'default' | 'attention' | 'success' | 'live';
  ctaLabel?: string;
  visual: ReactNode;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
};

function MiniPreviewShell({
  panel,
  state,
  title,
  icon,
  metric,
  statusLabel,
  statusTone = 'default',
  ctaLabel,
  visual,
  onOpen,
}: MiniPreviewShellProps) {
  const t = useTranslations('pages.minhasCargas.detail.preview');

  return (
    <button
      type="button"
      className={styles.miniCard}
      data-panel-target={panel}
      data-preview-state={state}
      data-panel={panel}
      data-testid={`owned-cargo-preview-${panel}`}
      aria-label={t('openAria', { panel: title })}
      onClick={() => onOpen(panel)}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.iconWrap} aria-hidden>
            <HydroIcon name={icon} size={16} />
          </span>
          <span className={styles.title}>{title}</span>
        </div>
        <HydroIcon name="chevronDown" size={14} aria-hidden className={styles.chevron} />
      </div>

      <div>
        <p className={styles.metric}>{metric}</p>
        {visual}
      </div>

      <div className={styles.footer}>
        <span
          className={styles.status}
          data-tone={statusTone === 'default' ? undefined : statusTone}
        >
          {statusLabel}
        </span>
        {ctaLabel ? <span className={styles.cta}>{ctaLabel}</span> : null}
      </div>
    </button>
  );
}

export function OwnedCargoTimelineMiniPreview({
  timeline,
  onOpen,
}: {
  timeline: OwnedCargoTimelinePreview;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const statusLabel = t(`timelineStatus.${timeline.statusKey}`);
  const state = timeline.state === 'empty' ? 'empty' : 'available';

  return (
    <MiniPreviewShell
      panel="timeline"
      state={state}
      title={t('timelineTitle')}
      icon="clock"
      metric={statusLabel}
      statusLabel={
        timeline.state === 'empty'
          ? t('statusNoTimeline')
          : t('timelineStageCurrent')
      }
      statusTone={timeline.statusKey === 'inTransit' ? 'live' : 'default'}
      onOpen={onOpen}
      visual={
        timeline.state === 'empty' ? null : (
          <div className={styles.timelineVisual} aria-hidden>
            <div className={styles.timelineDots}>
              {timeline.phaseDots.map((phase, index) => (
                <span key={`${phase}-${index}`} style={{ display: 'contents' }}>
                  {index > 0 ? <span className={styles.connector} /> : null}
                  <span className={styles.dot} data-phase={phase} />
                </span>
              ))}
            </div>
            {timeline.nextEventMock ? (
              <span className={styles.timelineNext}>{timeline.nextEventMock}</span>
            ) : null}
          </div>
        )
      }
    />
  );
}

export function OwnedCargoDocumentsMiniPreview({
  documents,
  onOpen,
}: {
  documents: OwnedCargoDocumentsPreview;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const state = documents.state === 'empty' ? 'empty' : documents.pendingCount > 0 ? 'attention' : 'available';
  const readyPercent = Math.max(0, documents.readinessPercent);

  return (
    <MiniPreviewShell
      panel="documents"
      state={state}
      title={t('documentsTitle')}
      icon="document"
      metric={
        documents.state === 'empty'
          ? t('documentsSummaryEmpty')
          : t('documentsMetricPending', { count: documents.pendingCount })
      }
      statusLabel={
        documents.state === 'empty'
          ? t('statusNoDocuments')
          : t('statusPendingDocs', { count: documents.pendingCount })
      }
      statusTone={documents.pendingCount > 0 ? 'attention' : 'success'}
      ctaLabel={t('ctaOpen')}
      onOpen={onOpen}
      visual={
        documents.state === 'empty' ? null : (
          <div className={styles.donutWrap} aria-hidden>
            <div
              className={styles.donut}
              style={{ '--hy-owned-doc-ready-percent': String(readyPercent) } as React.CSSProperties}
            >
              <span className={styles.donutValue}>{documents.pendingCount}</span>
            </div>
          </div>
        )
      }
    />
  );
}

export function OwnedCargoRisksMiniPreview({
  risks,
  onOpen,
}: {
  risks: OwnedCargoRisksPreview;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const state = risks.state === 'clear' ? 'available' : risks.state === 'attention' ? 'attention' : 'empty';
  const severity = risks.topSeverity ?? 'high';

  return (
    <MiniPreviewShell
      panel="risks"
      state={state}
      title={t('risksTitle')}
      icon="shield"
      metric={
        risks.state === 'clear'
          ? t('risksSummaryClear')
          : t('risksMetricAlert', { count: risks.count, severity: t(`riskSeverity.${severity}`) })
      }
      statusLabel={
        risks.state === 'clear'
          ? t('statusNoCriticalRisks')
          : t('statusRiskCount', { count: risks.count })
      }
      statusTone={risks.state === 'attention' ? 'attention' : 'success'}
      onOpen={onOpen}
      visual={
        risks.state === 'attention' ? (
          <span className={styles.severity} data-severity={severity} aria-hidden>
            {risks.topSeverity === 'high' ? <span className={styles.severityPulse} /> : null}
            {t(`riskSeverity.${severity}`)}
          </span>
        ) : null
      }
    />
  );
}

export function OwnedCargoTrackingMiniPreview({
  tracking,
  onOpen,
}: {
  tracking: OwnedCargoTrackingPreview;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');

  return (
    <MiniPreviewShell
      panel="tracking"
      state="available"
      title={t('trackingTitle')}
      icon="ship"
      metric={tracking.channelLabel}
      statusLabel={t('trackingProgress', { progress: tracking.progressPercent })}
      statusTone="live"
      onOpen={onOpen}
      visual={
        <div className={styles.trackBar} aria-hidden>
          <span className={styles.trackFill} style={{ width: `${tracking.progressPercent}%` }} />
          <span className={styles.trackBoat} style={{ left: `${tracking.progressPercent}%` }}>
            <HydroIcon name="ship" size={12} />
          </span>
        </div>
      }
    />
  );
}

export function OwnedCargoProcessMiniPreview({
  process,
  onOpen,
}: {
  process: OwnedCargoProcessPreview;
  onOpen: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const locale = useLocale();
  const actionLabel = process.actionLabelMock
    ? t('processActionAttach', { item: translateMock(locale, process.actionLabelMock) })
    : t('processActionFallback');

  return (
    <MiniPreviewShell
      panel="process"
      state={process.statusKey === 'pending' ? 'attention' : 'available'}
      title={t('processTitle')}
      icon="check"
      metric={actionLabel}
      statusLabel={t(`processStatus.${process.statusKey}`)}
      statusTone={process.statusKey === 'pending' ? 'attention' : 'default'}
      ctaLabel={t('ctaContinue')}
      onOpen={onOpen}
      visual={
        <div className={styles.processSteps} aria-hidden>
          <span className={styles.processStep} data-step="done" />
          <span className={styles.processStep} data-step={process.statusKey === 'pending' ? 'current' : 'done'} />
          <span className={styles.processStep} data-step={process.statusKey === 'ready' ? 'done' : 'upcoming'} />
          <span
            className={styles.processFill}
            style={{ width: `${Math.max(12, process.progressPercent)}%` }}
          />
        </div>
      }
    />
  );
}
