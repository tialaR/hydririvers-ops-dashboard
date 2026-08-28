'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { OwnedCargoOperationalMetric } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-detail-summary.module.sass';

const METRIC_LABEL_KEYS = {
  window: 'metricWindow',
  progress: 'metricProgress',
  cargoType: 'metricCargoType',
  pending: 'metricPending',
} as const;

export function OwnedCargoDetailSummary({ metrics }: { metrics: OwnedCargoOperationalMetric[] }) {
  const t = useTranslations('pages.minhasCargas.detail');
  const locale = useLocale();

  return (
    <section className={styles.root} aria-label={t('summaryAria')}>
      <h2 className={styles.title}>{t('summaryTitle')}</h2>
      <div className={styles.grid}>
        {metrics.map((metric) => {
          const displayValue = metric.mockValue ? translateMock(locale, metric.mockValue) : metric.value;

          return (
            <article key={metric.key} className={styles.metric} data-metric={metric.key}>
              <span className={styles.label}>{t(METRIC_LABEL_KEYS[metric.key])}</span>
              <strong className={styles.value}>{displayValue}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
