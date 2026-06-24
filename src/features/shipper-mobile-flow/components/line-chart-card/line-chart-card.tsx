'use client';

import { HydriChartCard } from '@/features/shipper-mobile-flow/components/charts/hydri-chart-card';
import { HydriLineChart } from '@/features/shipper-mobile-flow/components/charts/hydri-line-chart';
import type {
  ShipperChartPoint,
  ShipperFreshnessState,
  ShipperRiskLevel
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type OperationalLineChartProps = {
  title: string;
  changeInsight: string;
  actionHint: string;
  points: ShipperChartPoint[];
  legendLabel: string;
  unit?: string;
  riskLevel?: ShipperRiskLevel;
  freshnessMinutes?: number;
  freshnessState?: ShipperFreshnessState;
  isEmpty?: boolean;
  ariaLabel?: string;
  size?: 'micro' | 'main';
  ctaHref?: string;
  ctaLabel?: string;
};

export function LineChartCard({
  title,
  changeInsight,
  actionHint,
  points,
  legendLabel,
  unit,
  riskLevel,
  freshnessMinutes,
  freshnessState,
  isEmpty = false,
  ariaLabel,
  size = 'main',
  ctaHref,
  ctaLabel
}: OperationalLineChartProps) {
  const accessibleSummary = ariaLabel ?? `${title}. ${changeInsight}. ${actionHint}`;

  return (
    <HydriChartCard
      title={title}
      changeInsight={changeInsight}
      actionHint={actionHint}
      legendLabel={legendLabel}
      unit={unit}
      points={points}
      riskLevel={riskLevel}
      freshnessMinutes={freshnessMinutes}
      freshnessState={freshnessState}
      isEmpty={isEmpty}
      ariaLabel={accessibleSummary}
      size={size}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
    >
      <HydriLineChart points={points} unit={unit} size={size} ariaLabel={accessibleSummary} />
    </HydriChartCard>
  );
}
