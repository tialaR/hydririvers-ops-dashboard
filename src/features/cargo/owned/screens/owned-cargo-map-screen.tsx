'use client';

import { Cloud, Layers, Waves } from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { FreshnessIndicator } from '@/features/cargo/components/freshness-indicator/freshness-indicator';
import { RiskBadge } from '@/features/cargo/components/risk-badge/risk-badge';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';

import styles from './owned-cargo-map-screen.module.sass';

export type OwnedCargoMapBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'compact' | 'medium' | 'full';
  children: ReactNode;
};

type OwnedCargoMapScreenProps = {
  cargo: OwnedCargo;
  corridorLabel: string;
  mapContent: ReactNode;
  BottomSheetComponent: ComponentType<OwnedCargoMapBottomSheetProps>;
};

export function OwnedCargoMapScreen({
  cargo,
  corridorLabel,
  mapContent,
  BottomSheetComponent,
}: OwnedCargoMapScreenProps) {
  const t = useTranslations('shipperMobileFlow.map');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className={styles.mapFullScreen}>
        {mapContent}
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
      <BottomSheetComponent open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('contextTitle')} size="compact">
        <div className={styles.mapContextSheet}>
          <p className={styles.contextBody}>{t('contextBody')}</p>
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
      </BottomSheetComponent>
    </>
  );
}
