'use client';

import { useTranslations } from 'next-intl';
import {
  OperationalBarChart,
  OperationalChartCard,
  type OperationalChartSlice
} from '@/shared/design-system/patterns/operational-chart';
import type { ImpactSummary } from '../domain/impact-operations';
import styles from './impact-screen.module.sass';

type ImpactScreenProps = {
  summary: ImpactSummary;
  chart: OperationalChartSlice;
};

export function ImpactScreen({ summary, chart }: ImpactScreenProps) {
  const t = useTranslations('shipperMobileFlow.impact');
  const chartT = useTranslations('shipperMobileFlow.chart');
  const riskT = useTranslations('shipperMobileFlow.risk');
  const freshnessT = useTranslations('shipperMobileFlow.freshness');
  const co2Metric = summary.metrics.find((metric) => metric.id === 'co2');
  const accessibleSummary = t('chart.aria');

  return (
    <section className={styles.root}>
      {co2Metric ? (
        <article className={styles.highlight}>
          <p className={styles.highlightLabel}>{t(co2Metric.labelKey)}</p>
          <p className={styles.highlightValue}>{co2Metric.valueLabel}</p>
        </article>
      ) : null}

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
        <OperationalBarChart points={chart.points} unit={t('chart.unit')} ariaLabel={accessibleSummary} />
      </OperationalChartCard>

      <div className={styles.list}>
        {summary.metrics.map((metric) => (
          <article key={metric.id} className={styles.row}>
            <span className={styles.title}>{t(metric.labelKey)}</span>
            <span className={styles.value}>{metric.valueLabel}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
