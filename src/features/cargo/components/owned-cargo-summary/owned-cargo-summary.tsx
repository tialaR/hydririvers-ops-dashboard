'use client';

import { useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { OwnedCargoesSummary } from '@/features/cargo/domain/summarize-owned-cargoes';
import styles from './owned-cargo-summary.module.sass';

type SummaryMetricKey = 'active' | 'proposals' | 'pending' | 'transit';

const METRICS: Array<{
  key: SummaryMetricKey;
  icon: 'cargo' | 'message' | 'document' | 'ship';
  valueKey: keyof OwnedCargoesSummary;
  labelKey: 'summaryActiveLabel' | 'summaryProposalsLabel' | 'summaryPendingLabel' | 'summaryTransitLabel';
  hintKey: 'summaryActiveHint' | 'summaryProposalsHint' | 'summaryPendingHint' | 'summaryTransitHint';
}> = [
  {
    key: 'active',
    icon: 'cargo',
    valueKey: 'active',
    labelKey: 'summaryActiveLabel',
    hintKey: 'summaryActiveHint',
  },
  {
    key: 'proposals',
    icon: 'message',
    valueKey: 'proposals',
    labelKey: 'summaryProposalsLabel',
    hintKey: 'summaryProposalsHint',
  },
  {
    key: 'pending',
    icon: 'document',
    valueKey: 'pending',
    labelKey: 'summaryPendingLabel',
    hintKey: 'summaryPendingHint',
  },
  {
    key: 'transit',
    icon: 'ship',
    valueKey: 'inTransit',
    labelKey: 'summaryTransitLabel',
    hintKey: 'summaryTransitHint',
  },
];

export function OwnedCargoSummary({ stats }: { stats: OwnedCargoesSummary }) {
  const t = useTranslations('pages.minhasCargas');

  return (
    <section
      className={styles.root}
      data-testid="minhas-cargas-summary"
      aria-label={t('summary.metricsRegionAria')}
    >
      <h2 className={styles.title}>{t('summaryTitle')}</h2>
      <div className={styles.grid}>
        {METRICS.map((metric) => (
          <article key={metric.key} className={styles.metric} data-metric={metric.key}>
            <span className={styles.iconWrap} aria-hidden>
              <HydroIcon name={metric.icon} size={18} />
            </span>
            <strong className={styles.value}>{stats[metric.valueKey]}</strong>
            <span className={styles.label}>{t(metric.labelKey)}</span>
            <span className={styles.hint}>{t(metric.hintKey)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
