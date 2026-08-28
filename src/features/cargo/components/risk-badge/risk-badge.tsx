'use client';

import { useTranslations } from 'next-intl';
import type { OwnedCargoRiskLevel } from '@/features/cargo/owned/domain/owned-cargo-types';

import styles from './risk-badge.module.sass';

type RiskBadgeProps = {
  level: OwnedCargoRiskLevel;
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
