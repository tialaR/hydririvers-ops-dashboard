'use client';

import { useTranslations } from 'next-intl';
import type { OwnedCargoFreshnessState } from '@/features/cargo/owned/domain/owned-cargo-types';

import styles from './freshness-indicator.module.sass';

type FreshnessIndicatorProps = {
  minutes: number;
  state: OwnedCargoFreshnessState;
};

export function FreshnessIndicator({ minutes, state }: FreshnessIndicatorProps) {
  const t = useTranslations('shipperMobileFlow.freshness');

  return (
    <span className={`${styles.root} ${styles[state]}`}>
      <span className={styles.dot} aria-hidden />
      {t(state, { minutes })}
    </span>
  );
}
