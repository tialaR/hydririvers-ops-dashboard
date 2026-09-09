'use client';

import type { ReactNode } from 'react';
import { Link } from '@/core/i18n/navigation';
import type {
  OperationalChartCopy,
  OperationalChartPoint,
  OperationalFreshnessState,
  OperationalRiskLevel
} from './operational-chart-types';

import styles from './operational-chart-card.module.sass';

type OperationalChartCardProps = {
  title: string;
  changeInsight: string;
  actionHint: string;
  legendLabel: string;
  unit?: string;
  points: OperationalChartPoint[];
  riskLevel?: OperationalRiskLevel;
  freshnessMinutes?: number;
  freshnessState?: OperationalFreshnessState;
  isEmpty?: boolean;
  ariaLabel?: string;
  size?: 'micro' | 'main';
  ctaHref?: string;
  ctaLabel?: string;
  copy: OperationalChartCopy;
  children: ReactNode;
};

function riskClass(level: OperationalRiskLevel) {
  if (level === 'low') return styles.riskLow;
  if (level === 'medium') return styles.riskMedium;
  if (level === 'critical') return styles.riskCritical;
  return styles.riskHigh;
}

function freshnessClass(state: OperationalFreshnessState) {
  if (state === 'fresh') return styles.freshnessFresh;
  if (state === 'stale') return styles.freshnessStale;
  return styles.freshnessOffline;
}

export function OperationalChartCard({
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
  copy,
  children
}: OperationalChartCardProps) {
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
        {riskLevel && copy.riskLabel ? (
          <span className={`${styles.risk} ${riskClass(riskLevel)}`}>
            <span className={styles.dot} aria-hidden />
            {copy.riskLabel}
          </span>
        ) : null}
      </div>
      <p className={styles.insight}>{changeInsight}</p>
      {isStale && freshnessMinutes !== undefined && freshnessState ? (
        <p className={styles.staleBanner}>{copy.staleBanner}</p>
      ) : null}
      {!hasData ? <p className={styles.empty}>{copy.empty}</p> : children}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatch} aria-hidden />
          {legendLabel}
          {unit ? ` (${unit})` : ''}
        </span>
        {freshnessMinutes !== undefined && freshnessState && copy.freshnessLabel ? (
          <span className={`${styles.freshness} ${freshnessClass(freshnessState)}`}>
            <span className={styles.dot} aria-hidden />
            {copy.freshnessLabel}
          </span>
        ) : null}
      </div>
      <p className={styles.actionHint}>
        <span className={styles.actionLabel}>{copy.actionLabel}</span> {actionHint}
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
            <th scope="col">{copy.tablePeriod}</th>
            <th scope="col">{copy.tableValue}</th>
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
