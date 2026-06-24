'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { FreshnessIndicator } from '@/features/shipper-mobile-flow/components/freshness-indicator/freshness-indicator';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import type {
  ShipperChartPoint,
  ShipperFreshnessState,
  ShipperRiskLevel
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from './hydri-chart-card.module.sass';

export type HydriChartCardProps = {
  title: string;
  changeInsight: string;
  actionHint: string;
  legendLabel: string;
  unit?: string;
  points: ShipperChartPoint[];
  riskLevel?: ShipperRiskLevel;
  freshnessMinutes?: number;
  freshnessState?: ShipperFreshnessState;
  isEmpty?: boolean;
  ariaLabel?: string;
  size?: 'micro' | 'main';
  ctaHref?: string;
  ctaLabel?: string;
  children: ReactNode;
};

export function HydriChartCard({
  title,
  changeInsight,
  actionHint,
  legendLabel,
  unit,
  points,
  riskLevel,
  freshnessMinutes,
  freshnessState,
  isEmpty = false,
  ariaLabel,
  size = 'main',
  ctaHref,
  ctaLabel,
  children
}: HydriChartCardProps) {
  const t = useTranslations('shipperMobileFlow.chart');
  const hasData = !isEmpty && points.length > 0;
  const isStale = freshnessState === 'stale' || freshnessState === 'offline';
  const accessibleSummary = ariaLabel ?? `${title}. ${changeInsight}. ${actionHint}`;

  return (
    <article
      className={`${styles.card} ${size === 'micro' ? styles.cardMicro : ''} ${isStale ? styles.cardStale : ''}`}
      aria-label={accessibleSummary}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {riskLevel ? <RiskBadge level={riskLevel} /> : null}
      </div>
      <p className={styles.insight}>{changeInsight}</p>
      {isStale && freshnessMinutes !== undefined && freshnessState ? (
        <p className={styles.staleBanner}>{t('staleBanner')}</p>
      ) : null}
      {!hasData ? <p className={styles.empty}>{t('empty')}</p> : children}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatch} aria-hidden />
          {legendLabel}
          {unit ? ` (${unit})` : ''}
        </span>
        {freshnessMinutes !== undefined && freshnessState ? (
          <FreshnessIndicator minutes={freshnessMinutes} state={freshnessState} />
        ) : null}
      </div>
      <p className={styles.actionHint}>
        <span className={styles.actionLabel}>{t('actionLabel')}</span> {actionHint}
      </p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
        </Link>
      ) : null}
      <table className={styles.srTable}>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{t('tablePeriod')}</th>
            <th scope="col">{t('tableValue')}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>
                {point.value}
                {unit ? ` ${unit}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
