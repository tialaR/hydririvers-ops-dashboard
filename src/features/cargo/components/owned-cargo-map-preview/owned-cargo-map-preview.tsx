'use client';

import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { OwnedCargoMapPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoRouteVisual } from '@/features/cargo/components/owned-cargo-route-visual/owned-cargo-route-visual';
import styles from './owned-cargo-map-preview.module.sass';

type OwnedCargoMapPreviewProps = {
  cargo: Cargo;
  map: OwnedCargoMapPreview;
  onOpen: () => void;
};

function resolveOriginShort(origin: string): string {
  return origin.split(',')[0]?.trim() || origin;
}

export function OwnedCargoMapPreviewCard({ cargo, map, onOpen }: OwnedCargoMapPreviewProps) {
  const t = useTranslations('pages.minhasCargas.detail.preview');

  if (map.state === 'unavailable') {
    return (
      <button
        type="button"
        className={styles.mapPreview}
        data-panel-target="map"
        data-preview-state="unavailable"
        data-testid="owned-cargo-preview-map"
        aria-label={t('openAria', { panel: t('mapTitle') })}
        onClick={onOpen}
      >
        <span className={styles.unavailable}>{t('mapUnavailable')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.mapPreview}
      data-panel-target="map"
      data-preview-state="available"
      data-testid="owned-cargo-preview-map"
      aria-label={t('openAria', { panel: t('mapTitle') })}
      onClick={onOpen}
    >
      <div className={styles.header}>
        <span className={styles.headerTitle}>{t('mapTitle')}</span>
        <span className={styles.headerCta}>{t('ctaViewFullMap')}</span>
      </div>

      <div className={styles.canvas}>
        <OwnedCargoRouteVisual
          variant="map"
          cargo={cargo}
          progressPercent={map.progressPercent}
          originLabel={cargo.origin}
          destinationLabel={cargo.destination}
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.endpoint}>{resolveOriginShort(cargo.origin)}</span>
        <span className={styles.progressBadge}>{map.progressPercent}%</span>
        <span className={styles.endpoint}>{resolveOriginShort(cargo.destination)}</span>
      </div>
    </button>
  );
}
