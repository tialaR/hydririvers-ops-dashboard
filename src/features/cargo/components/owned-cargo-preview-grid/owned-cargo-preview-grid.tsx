'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import type { OwnedCargoPreviewPanel } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoPreviewCard } from '@/features/cargo/components/owned-cargo-preview-card/owned-cargo-preview-card';
import styles from './owned-cargo-preview-grid.module.sass';

export function OwnedCargoPreviewGrid({
  cargo,
  onOpenPanel,
}: {
  cargo: Cargo;
  onOpenPanel: (panel: OwnedCargoPreviewPanel) => void;
}) {
  const t = useTranslations('pages.minhasCargas.detail.preview');
  const derivation = useMemo(() => deriveOwnedCargoDetail(cargo), [cargo]);

  const mapSummary = t('mapSummary', {
    route: derivation.map.routeLabel,
    progress: derivation.map.progressPercent,
    checkpoint: derivation.map.checkpointLabel,
  });

  const timelineSummary =
    derivation.timeline.state === 'empty'
      ? t('timelineSummaryEmpty')
      : t('timelineSummary', { count: derivation.timeline.eventCount });

  const documentsSummary =
    derivation.documents.state === 'empty'
      ? t('documentsSummaryEmpty')
      : t('documentsSummary', {
          total: derivation.documents.totalCount,
          pending: derivation.documents.pendingCount,
          readiness: derivation.documents.readinessPercent,
        });

  const risksSummary =
    derivation.risks.state === 'clear'
      ? t('risksSummaryClear')
      : t('risksSummary', { count: derivation.risks.count });

  return (
    <section className={styles.root} aria-label={t('gridAria')}>
      <h2 className={styles.title}>{t('gridTitle')}</h2>
      <div className={styles.grid}>
        <OwnedCargoPreviewCard
          panel="map"
          state={derivation.map.state === 'unavailable' ? 'unavailable' : 'available'}
          title={t('mapTitle')}
          summary={derivation.map.state === 'unavailable' ? t('mapUnavailable') : mapSummary}
          statusLabel={
            derivation.map.state === 'unavailable'
              ? t('statusUnavailable')
              : t('statusRoute', { progress: derivation.map.progressPercent })
          }
          icon="map"
          onOpen={onOpenPanel}
        />
        <OwnedCargoPreviewCard
          panel="timeline"
          state={derivation.timeline.state === 'empty' ? 'empty' : 'available'}
          title={t('timelineTitle')}
          summary={timelineSummary}
          statusLabel={
            derivation.timeline.state === 'empty'
              ? t('statusNoTimeline')
              : t('statusEvents', { count: derivation.timeline.eventCount })
          }
          icon="clock"
          detailMock={derivation.timeline.nextEventMock}
          onOpen={onOpenPanel}
        />
        <OwnedCargoPreviewCard
          panel="documents"
          state={derivation.documents.state === 'empty' ? 'empty' : derivation.documents.pendingCount > 0 ? 'attention' : 'available'}
          title={t('documentsTitle')}
          summary={documentsSummary}
          statusLabel={
            derivation.documents.state === 'empty'
              ? t('statusNoDocuments')
              : derivation.documents.pendingCount > 0
                ? t('statusPendingDocs', { count: derivation.documents.pendingCount })
                : t('statusDocsReady', { readiness: derivation.documents.readinessPercent })
          }
          icon="document"
          detailMock={derivation.documents.topPendingName}
          onOpen={onOpenPanel}
        />
        <OwnedCargoPreviewCard
          panel="risks"
          state={derivation.risks.state === 'clear' ? 'available' : derivation.risks.state === 'attention' ? 'attention' : 'empty'}
          title={t('risksTitle')}
          summary={risksSummary}
          statusLabel={
            derivation.risks.state === 'clear'
              ? t('statusNoCriticalRisks')
              : t('statusRiskCount', { count: derivation.risks.count })
          }
          icon="shield"
          detailMock={derivation.risks.primaryRiskMock}
          onOpen={onOpenPanel}
        />
      </div>
    </section>
  );
}
