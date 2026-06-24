'use client';

import { useTranslations } from 'next-intl';
import type { ShipperRiskLevel } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from './risk-badge.module.sass';

type RiskBadgeProps = {
  level: ShipperRiskLevel;
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const t = useTranslations('shipperMobileFlow.risk');

  return (
    <span className={`${styles.badge} ${styles[level === 'critical' ? 'critical' : level]}`}>
      <span className={styles.dot} aria-hidden />
      {t(level)}
    </span>
  );
}
