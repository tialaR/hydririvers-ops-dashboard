'use client';

import { Cloud, Layers, Waves } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';
import { getShipperMapRouteForCargo } from '@/features/shipper-mobile-flow/data/map-data';
import { BottomSheet } from '@/features/shipper-mobile-flow/components/bottom-sheet/bottom-sheet';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import { FreshnessIndicator } from '@/features/shipper-mobile-flow/components/freshness-indicator/freshness-indicator';
import { ShipperOperationMap } from '@/features/shipper-mobile-flow/components/shipper-operation-map/shipper-operation-map';

import styles from '../shared-ui/shared-ui.module.sass';

type OperationMapScreenProps = {
  cargo: ShipperOwnedCargo;
};

export function OperationMapScreen({ cargo }: OperationMapScreenProps) {
  const t = useTranslations('shipperMobileFlow.map');
  const tCorridors = useTranslations('shipperMobileFlow.map.corridors');
  const [sheetOpen, setSheetOpen] = useState(false);
  const routeData = useMemo(() => getShipperMapRouteForCargo(cargo), [cargo]);

  const routeAria = t('routeAria', { code: cargo.code });
  const corridorLabel = tCorridors(routeData.routeLabelKey);

  return (
    <>
      <div className={styles.mapFullScreen}>
        <ShipperOperationMap
          routeData={routeData}
          ariaLabel={routeAria}
          fallbackHintLabel={t('fallbackHint')}
        />
        <div className={styles.mapControlsStack}>
          <button type="button" className={styles.mapControl} aria-label={t('layerStatus')} onClick={() => setSheetOpen(true)}>
            <Layers size={18} aria-hidden />
          </button>
          <button type="button" className={styles.mapControl} aria-label={t('layerRiver')}>
            <Waves size={18} aria-hidden />
          </button>
          <button type="button" className={styles.mapControl} aria-label={t('layerWeather')}>
            <Cloud size={18} aria-hidden />
          </button>
        </div>
        <div className={styles.mapStatusCard}>
          <div className={styles.mapStatusHeader}>
            <div>
              <p className={styles.mapStatusCode}>{cargo.code}</p>
              <p className={styles.mapStatusCorridor}>{corridorLabel}</p>
            </div>
            <RiskBadge level={cargo.riskLevel} />
          </div>
          <div className={styles.mapStatusGrid}>
            <div className={styles.mapStatusCell}>
              <span className={styles.mapStatusLabel}>{t('origin')}</span>
              <span className={styles.mapStatusValue}>{cargo.origin}</span>
            </div>
            <div className={styles.mapStatusCell}>
              <span className={styles.mapStatusLabel}>{t('destination')}</span>
              <span className={styles.mapStatusValue}>{cargo.destination}</span>
            </div>
            <div className={styles.mapStatusCell}>
              <span className={styles.mapStatusLabel}>{t('etaLabel')}</span>
              <span className={styles.mapStatusValue}>{t('eta', { hours: cargo.etaHours })}</span>
            </div>
            <div className={styles.mapStatusCell}>
              <span className={styles.mapStatusLabel}>{t('freshnessLabel')}</span>
              <FreshnessIndicator minutes={cargo.freshnessMinutes} state={cargo.freshnessState} />
            </div>
          </div>
          <button type="button" className={styles.mapStatusAction} onClick={() => setSheetOpen(true)}>
            {t('openContext')}
          </button>
        </div>
      </div>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('contextTitle')} size="compact">
        <div className={styles.mapContextSheet}>
          <p className={styles.summary}>{t('contextBody')}</p>
          <div className={styles.mapContextRow}>
            <span className={styles.mapStatusLabel}>{t('riskLabel')}</span>
            <RiskBadge level={cargo.riskLevel} />
          </div>
          <div className={styles.mapContextRow}>
            <span className={styles.mapStatusLabel}>{t('etaLabel')}</span>
            <span className={styles.mapStatusValue}>{t('eta', { hours: cargo.etaHours })}</span>
          </div>
          <div className={styles.mapContextRow}>
            <span className={styles.mapStatusLabel}>{t('freshnessLabel')}</span>
            <FreshnessIndicator minutes={cargo.freshnessMinutes} state={cargo.freshnessState} />
          </div>
          <p className={styles.mapContextAction}>{t('contextAction')}</p>
        </div>
      </BottomSheet>
    </>
  );
}
