'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { deriveOwnedCargoDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import type { OwnedCargoPreviewPanel } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoMapPreviewCard } from '@/features/cargo/owned/components/owned-cargo-map-preview/owned-cargo-map-preview';
import {
  OwnedCargoDocumentsMiniPreview,
  OwnedCargoProcessMiniPreview,
  OwnedCargoRisksMiniPreview,
  OwnedCargoTimelineMiniPreview,
  OwnedCargoTrackingMiniPreview,
} from '@/features/cargo/owned/components/owned-cargo-mini-previews/owned-cargo-mini-previews';
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

  return (
    <section className={styles.root} aria-label={t('gridAria')}>
      <h2 className={styles.title}>{t('gridTitle')}</h2>

      <OwnedCargoMapPreviewCard
        cargo={cargo}
        map={derivation.map}
        onOpen={() => onOpenPanel('map')}
      />

      <div className={styles.grid}>
        <OwnedCargoTimelineMiniPreview timeline={derivation.timeline} onOpen={onOpenPanel} />
        <OwnedCargoDocumentsMiniPreview documents={derivation.documents} onOpen={onOpenPanel} />
        <OwnedCargoRisksMiniPreview risks={derivation.risks} onOpen={onOpenPanel} />
        {derivation.showTrackingPreview ? (
          <OwnedCargoTrackingMiniPreview tracking={derivation.tracking} onOpen={onOpenPanel} />
        ) : null}
        {derivation.showProcessPreview ? (
          <OwnedCargoProcessMiniPreview process={derivation.process} onOpen={onOpenPanel} />
        ) : null}
      </div>
    </section>
  );
}
