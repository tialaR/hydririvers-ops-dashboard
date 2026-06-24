'use client';

import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { LineChartCard } from '@/features/shipper-mobile-flow/components/line-chart-card/line-chart-card';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/shipper-mobile-flow/components/search-filter-bar/search-filter-bar';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';
import type { ShipperCockpitMetric } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type CockpitScreenProps = {
  metrics: ShipperCockpitMetric[];
  trend: ShipperOperationalChartSlice;
  defaultCargoId: string;
};

export function CockpitScreen({ metrics, trend, defaultCargoId }: CockpitScreenProps) {
  const t = useTranslations('shipperMobileFlow.cockpit');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filters.all') },
      { id: 'critical', label: t('filters.critical') },
      { id: 'docs', label: t('filters.docs') }
    ],
    [t]
  );

  return (
    <MobileAppShell title={t('title')}>
      <SearchFilterStack
        value={query}
        onChange={setQuery}
        chips={chips}
        activeChip={chip}
        onChipChange={setChip}
      />
      <Link href={`/minhas-cargas/${defaultCargoId}`} className={styles.primaryDecision}>
        <div>
          <p className={styles.primaryDecisionLabel}>{t('primaryAction.title')}</p>
          <p className={styles.primaryDecisionBody}>{t('primaryAction.body')}</p>
        </div>
        <span className={styles.primaryDecisionCta}>
          {t('primaryAction.cta')} <ChevronRight size={16} aria-hidden />
        </span>
      </Link>
      <article className={styles.criticalBanner}>
        <h2 className={styles.criticalTitle}>{t('criticalAlert.title')}</h2>
        <p className={styles.criticalBody}>{t('criticalAlert.body')}</p>
      </article>
      <LineChartCard
        title={t('trend.title')}
        changeInsight={t('trend.summary')}
        actionHint={t('trend.action')}
        points={trend.points}
        legendLabel={t('trend.legend')}
        unit={t('trend.unit')}
        riskLevel={trend.riskLevel}
        freshnessMinutes={trend.freshnessMinutes}
        freshnessState={trend.freshnessState}
        ariaLabel={t('trend.aria')}
        size="micro"
        ctaHref="/hidrologia"
        ctaLabel={t('trend.cta')}
      />
      <div className={styles.grid}>
        {metrics.map((metric) => (
          <article key={metric.id} className={styles.metric}>
            <p className={styles.metricValue}>{metric.value}</p>
            <p className={styles.metricLabel}>{t(metric.labelKey)}</p>
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
