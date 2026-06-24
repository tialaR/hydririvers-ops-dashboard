'use client';

import { useTranslations } from 'next-intl';
import { BarChartCard } from '@/features/shipper-mobile-flow/components/bar-chart-card/bar-chart-card';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';
import type { ImpactSummary } from '@/features/shipper-mobile-flow/domain/repositories/hydro-repository';

import styles from '../components/shared-ui/shared-ui.module.sass';

type ImpactScreenProps = {
  summary: ImpactSummary;
  chart: ShipperOperationalChartSlice;
};

export function ImpactScreen({ summary, chart }: ImpactScreenProps) {
  const t = useTranslations('shipperMobileFlow.impact');
  const { metrics } = summary;
  const co2Metric = metrics.find((metric) => metric.id === 'co2');

  return (
    <MobileAppShell title={t('title')}>
      {co2Metric ? (
        <article className={styles.impactHighlight}>
          <p className={styles.impactHighlightLabel}>{t(co2Metric.labelKey)}</p>
          <p className={styles.impactHighlightValue}>{co2Metric.valueLabel}</p>
        </article>
      ) : null}
      <BarChartCard
        title={t('chart.title')}
        changeInsight={t('chart.summary')}
        actionHint={t('chart.action')}
        points={chart.points}
        legendLabel={t('chart.legend')}
        unit={t('chart.unit')}
        riskLevel={chart.riskLevel}
        freshnessMinutes={chart.freshnessMinutes}
        freshnessState={chart.freshnessState}
        ariaLabel={t('chart.aria')}
      />
      <div className={styles.list}>
        {metrics.map((metric) => (
          <article key={metric.id} className={styles.docRow}>
            <span className={styles.title}>{t(metric.labelKey)}</span>
            <span className={styles.tileValue}>{metric.valueLabel}</span>
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
