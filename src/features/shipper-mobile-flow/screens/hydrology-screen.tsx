'use client';

import { useTranslations } from 'next-intl';
import { LineChartCard } from '@/features/shipper-mobile-flow/components/line-chart-card/line-chart-card';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';
import type { HydrologySummary } from '@/features/shipper-mobile-flow/domain/repositories/hydro-repository';

import styles from '../components/shared-ui/shared-ui.module.sass';

type HydrologyScreenProps = {
  summary: HydrologySummary;
  chart: ShipperOperationalChartSlice;
};

export function HydrologyScreen({ summary, chart }: HydrologyScreenProps) {
  const t = useTranslations('shipperMobileFlow.hydrology');
  const { basins } = summary;

  return (
    <MobileAppShell title={t('title')}>
      <LineChartCard
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
        ctaHref="/minhas-cargas/hr-4821"
        ctaLabel={t('chart.cta')}
      />
      <div className={styles.basinGrid}>
        {basins.map((basin) => (
          <article key={basin.id} className={styles.basin}>
            <p className={styles.title}>{t(`basins.${basin.nameKey}`)}</p>
            <p className={styles.summary}>{t(basin.trendKey, { draft: basin.draftMeters })}</p>
            <RiskBadge level={basin.status} />
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
