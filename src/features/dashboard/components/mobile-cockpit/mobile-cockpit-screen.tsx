'use client';

import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';
import type { OwnedCargoCockpitMetric } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  OperationalChartCard,
  OperationalLineChart,
  type OperationalChartSlice
} from '@/shared/design-system/patterns/operational-chart';
import styles from './mobile-cockpit-screen.module.sass';

type MobileCockpitScreenProps = {
  metrics: OwnedCargoCockpitMetric[];
  trend: OperationalChartSlice;
  defaultCargoId: string;
};

export function MobileCockpitScreen({ metrics, trend, defaultCargoId }: MobileCockpitScreenProps) {
  const t = useTranslations('shipperMobileFlow.cockpit');
  const chartT = useTranslations('shipperMobileFlow.chart');
  const riskT = useTranslations('shipperMobileFlow.risk');
  const freshnessT = useTranslations('shipperMobileFlow.freshness');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('all');
  const chips = useMemo(() => [
    { id: 'all', label: t('filters.all') },
    { id: 'critical', label: t('filters.critical') },
    { id: 'docs', label: t('filters.docs') }
  ], [t]);
  const heroMetric = metrics[0] ?? null;
  const chartCopy = {
    staleBanner: chartT('staleBanner'),
    empty: chartT('empty'),
    actionLabel: chartT('actionLabel'),
    tablePeriod: chartT('tablePeriod'),
    tableValue: chartT('tableValue'),
    riskLabel: riskT(trend.riskLevel),
    freshnessLabel: freshnessT(trend.freshnessState, { minutes: trend.freshnessMinutes })
  };
  const chartAria = t('trend.aria');

  return (
    <MobileAppShell title={t('title')}>
      <SearchFilterStack value={query} onChange={setQuery} chips={chips} activeChip={chip} onChipChange={setChip} />
      <section className={styles.cockpitTopMeta} aria-label={t('topMetaAria')}>
        <article className={styles.cockpitTopMetaCard}>
          <p className={styles.cockpitTopMetaLabel}>{t('topMeta.nextWindow')}</p>
          <p className={styles.cockpitTopMetaValue}>{t('topMeta.nextWindowValue')}</p>
        </article>
        <article className={styles.cockpitTopMetaCard}>
          <p className={styles.cockpitTopMetaLabel}>{t('topMeta.compliance')}</p>
          <p className={styles.cockpitTopMetaValue}>{t('topMeta.complianceValue')}</p>
        </article>
      </section>
      {heroMetric ? (
        <article className={styles.screenHero}>
          <p className={styles.screenHeroLabel}>{t(heroMetric.labelKey)}</p>
          <p className={styles.screenHeroValue}>{heroMetric.value}</p>
          <p className={styles.screenHeroMeta}>{t(heroMetric.hintKey)}</p>
        </article>
      ) : null}
      <Link href={`/minhas-cargas/${defaultCargoId}`} className={styles.primaryDecision}>
        <div>
          <p className={styles.primaryDecisionLabel}>{t('primaryAction.title')}</p>
          <p className={styles.primaryDecisionBody}>{t('primaryAction.body')}</p>
        </div>
        <span className={styles.primaryDecisionCta}>{t('primaryAction.cta')} <ChevronRight size={16} aria-hidden /></span>
      </Link>
      <article className={styles.criticalBanner}>
        <h2 className={styles.criticalTitle}>{t('criticalAlert.title')}</h2>
        <p className={styles.criticalBody}>{t('criticalAlert.body')}</p>
      </article>
      <OperationalChartCard
        title={t('trend.title')}
        changeInsight={t('trend.summary')}
        actionHint={t('trend.action')}
        points={trend.points}
        legendLabel={t('trend.legend')}
        unit={t('trend.unit')}
        riskLevel={trend.riskLevel}
        freshnessMinutes={trend.freshnessMinutes}
        freshnessState={trend.freshnessState}
        ariaLabel={chartAria}
        size="micro"
        ctaHref="/hidrologia"
        ctaLabel={t('trend.cta')}
        copy={chartCopy}
      >
        <OperationalLineChart points={trend.points} unit={t('trend.unit')} size="micro" ariaLabel={chartAria} />
      </OperationalChartCard>
      <section className={styles.cockpitOpsGrid} aria-label={t('title')}>
        {metrics.slice(0, 4).map((metric) => (
          <article key={`${metric.id}-ops`} className={styles.cockpitOpsCard}>
            <p className={styles.cockpitOpsLabel}>{t(metric.labelKey)}</p>
            <p className={styles.cockpitOpsValue}>{metric.value}</p>
            <p className={styles.cockpitOpsHint}>{t(metric.hintKey)}</p>
          </article>
        ))}
      </section>
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
