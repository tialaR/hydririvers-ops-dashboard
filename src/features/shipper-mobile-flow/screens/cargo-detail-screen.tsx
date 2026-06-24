'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { MapPreviewCard } from '@/features/shipper-mobile-flow/components/map-preview-card/map-preview-card';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import { FreshnessIndicator } from '@/features/shipper-mobile-flow/components/freshness-indicator/freshness-indicator';
import type { ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type CargoDetailScreenProps = {
  cargo: ShipperOwnedCargo;
};

export function CargoDetailScreen({ cargo }: CargoDetailScreenProps) {
  const t = useTranslations('shipperMobileFlow.cargoDetail');
  const tStatus = useTranslations('shipperMobileFlow.cargoDetail.status');

  return (
    <MobileAppShell title={cargo.code} backHref="/minhas-cargas">
      <article className={styles.detailRiskBanner}>
        <div className={styles.detailRiskHeader}>
          <div>
            <p className={styles.detailRiskLabel}>{t('tiles.risk')}</p>
            <h2 className={styles.detailRiskStatus}>{tStatus(cargo.status)}</h2>
          </div>
          <RiskBadge level={cargo.riskLevel} />
        </div>
        <FreshnessIndicator minutes={cargo.freshnessMinutes} state={cargo.freshnessState} />
        <p className={styles.detailRoute}>
          {cargo.origin} → {cargo.destination}
        </p>
      </article>
      <MapPreviewCard
        cargoId={cargo.id}
        corridorId={cargo.corridorId}
        origin={cargo.origin}
        destination={cargo.destination}
      />
      <div className={styles.detailGrid}>
        <Link href={`/minhas-cargas/${cargo.id}/mapa`} className={`${styles.detailTile} ${styles.detailTileAccent}`}>
          <span className={styles.tileLabel}>{t('tiles.map')}</span>
          <span className={styles.tileValue}>{t('tiles.mapValue')}</span>
        </Link>
        <Link href={`/minhas-cargas/${cargo.id}/documentos`} className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.docs')}</span>
          <span className={styles.tileValue}>{cargo.pendingDocsCount}</span>
        </Link>
        <div className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.window')}</span>
          <span className={styles.tileValue}>{t('tiles.windowValue')}</span>
        </div>
        <Link href={`/minhas-cargas/${cargo.id}/negociacao`} className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.negotiation')}</span>
          <span className={styles.tileValue}>{t('tiles.offers', { count: cargo.offersCount })}</span>
        </Link>
      </div>
    </MobileAppShell>
  );
}
