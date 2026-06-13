'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoDetailHeader } from '@/features/cargo/components/owned-cargo-detail-header/owned-cargo-detail-header';
import { OwnedCargoStatusCard } from '@/features/cargo/components/owned-cargo-status-card/owned-cargo-status-card';
import { OwnedCargoPreviewGrid } from '@/features/cargo/components/owned-cargo-preview-grid/owned-cargo-preview-grid';
import { OwnedCargoSupportCards } from '@/features/cargo/components/owned-cargo-support-cards/owned-cargo-support-cards';
import { OwnedCargoMapSheet } from '@/features/cargo/components/owned-cargo-map-sheet/owned-cargo-map-sheet';
import { OwnedCargoTimelineSheet } from '@/features/cargo/components/owned-cargo-timeline-sheet/owned-cargo-timeline-sheet';
import { OwnedCargoDocumentsSheet } from '@/features/cargo/components/owned-cargo-documents-sheet/owned-cargo-documents-sheet';
import { OwnedCargoRisksSheet } from '@/features/cargo/components/owned-cargo-risks-sheet/owned-cargo-risks-sheet';
import { useOwnedCargoPanel } from '@/features/cargo/hooks/use-owned-cargo-panel';
import styles from './owned-cargo-detail.module.sass';

export function OwnedCargoDetail({ cargo }: { cargo: Cargo }) {
  const t = useTranslations('pages.minhasCargas.detail');
  const derivation = useMemo(() => deriveOwnedCargoDetail(cargo), [cargo]);
  const { panelTarget, openPanel, closePanel, isPanelOpen } = useOwnedCargoPanel();

  const actions = [
    derivation.showTrackAction ? { key: 'track' as const, label: t('actionTrack'), enabled: false } : null,
    derivation.showNegotiateAction ? { key: 'negotiate' as const, label: t('actionNegotiate'), enabled: false } : null,
    derivation.showUpdateStatusAction ? { key: 'updateStatus' as const, label: t('actionUpdateStatus'), enabled: false } : null,
    derivation.showObservationAction ? { key: 'observation' as const, label: t('actionObservation'), enabled: false } : null,
    derivation.showOpenDocumentsAction
      ? { key: 'openDocuments' as const, label: t('actionOpenDocuments'), enabled: true }
      : null,
  ].filter(Boolean);

  return (
    <div
      className={styles.root}
      data-testid="owned-cargo-detail"
      data-owned-cargo-id={cargo.id}
      data-panel-target={panelTarget ?? undefined}
    >
      <OwnedCargoDetailHeader cargo={cargo} />
      <OwnedCargoStatusCard cargo={cargo} statusCard={derivation.statusCard} />
      <OwnedCargoPreviewGrid cargo={cargo} onOpenPanel={openPanel} />
      <OwnedCargoSupportCards cards={derivation.supportCards} />

      {actions.length > 0 ? (
        <section className={styles.actions} aria-label={t('actionsAria')}>
          <h2 className={styles.actionsTitle}>{t('actionsTitle')}</h2>
          <div className={styles.actionRow}>
            {actions.map((action) =>
              action ? (
                <button
                  key={action.key}
                  type="button"
                  className={styles.actionChip}
                  data-action={action.key}
                  disabled={!action.enabled}
                  aria-label={
                    action.enabled
                      ? t('actionEnabledAria', { action: action.label })
                      : t('actionAria', { action: action.label })
                  }
                  onClick={
                    action.key === 'openDocuments' && action.enabled
                      ? () => openPanel('documents')
                      : undefined
                  }
                >
                  {action.label}
                </button>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <OwnedCargoMapSheet
        cargo={cargo}
        map={derivation.map}
        open={isPanelOpen('map')}
        onOpenChange={(open) => (open ? openPanel('map') : closePanel())}
      />
      <OwnedCargoTimelineSheet
        preview={derivation.timeline}
        events={derivation.timelineEvents}
        open={isPanelOpen('timeline')}
        onOpenChange={(open) => (open ? openPanel('timeline') : closePanel())}
      />
      <OwnedCargoDocumentsSheet
        preview={derivation.documents}
        documents={derivation.documentItems}
        open={isPanelOpen('documents')}
        onOpenChange={(open) => (open ? openPanel('documents') : closePanel())}
      />
      <OwnedCargoRisksSheet
        preview={derivation.risks}
        risks={derivation.riskItems}
        open={isPanelOpen('risks')}
        onOpenChange={(open) => (open ? openPanel('risks') : closePanel())}
      />
    </div>
  );
}
