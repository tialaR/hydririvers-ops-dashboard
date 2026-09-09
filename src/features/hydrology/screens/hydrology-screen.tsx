'use client';

import { useTranslations } from 'next-intl';
import {
  OperationalChartCard,
  OperationalLineChart,
  type OperationalChartSlice,
  type OperationalRiskLevel
} from '@/shared/design-system/patterns/operational-chart';
import type { HydrologySummary } from '../domain/hydrology-types';
import styles from './hydrology-screen.module.sass';

type HydrologyScreenProps = {
  summary: HydrologySummary;
  chart: OperationalChartSlice;
};

function riskClass(level: OperationalRiskLevel) {
  if (level === 'low') return styles.riskLow;
  if (level === 'medium') return styles.riskMedium;
  if (level === 'critical') return styles.riskCritical;
  return styles.riskHigh;
}

export function HydrologyScreen({ summary, chart }: HydrologyScreenProps) {
  const t = useTranslations('shipperMobileFlow.hydrology');
  const chartT = useTranslations('shipperMobileFlow.chart');
  const riskT = useTranslations('shipperMobileFlow.risk');
  const freshnessT = useTranslations('shipperMobileFlow.freshness');
  const accessibleSummary = t('chart.aria');

  return (
    <section className={styles.root}>
      <OperationalChartCard
        title={t('chart.title')}
        changeInsight={t('chart.summary')}
        actionHint={t('chart.action')}
        points={chart.points}
        legendLabel={t('chart.legend')}
        unit={t('chart.unit')}
        riskLevel={chart.riskLevel}
        freshnessMinutes={chart.freshnessMinutes}
        freshnessState={chart.freshnessState}
        ariaLabel={accessibleSummary}
        ctaHref="/minhas-cargas/hr-4821"
        ctaLabel={t('chart.cta')}
        copy={{
          staleBanner: chartT('staleBanner'),
          empty: chartT('empty'),
          actionLabel: chartT('actionLabel'),
          tablePeriod: chartT('tablePeriod'),
          tableValue: chartT('tableValue'),
          riskLabel: riskT(chart.riskLevel),
          freshnessLabel: freshnessT(chart.freshnessState, { minutes: chart.freshnessMinutes })
        }}
      >
        <OperationalLineChart points={chart.points} unit={t('chart.unit')} ariaLabel={accessibleSummary} />
      </OperationalChartCard>

      <div className={styles.basinGrid}>
        {summary.basins.map((basin) => (
          <article key={basin.id} className={styles.basin}>
            <p className={styles.title}>{t(`basins.${basin.nameKey}`)}</p>
            <p className={styles.summary}>{t(basin.trendKey, { draft: basin.draftMeters })}</p>
            <span className={`${styles.risk} ${riskClass(basin.status)}`}>
              <span className={styles.dot} aria-hidden />
              {riskT(basin.status)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
