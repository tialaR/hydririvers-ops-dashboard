'use client';

import { useMemo } from 'react';

import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import type { OperationalTelemetryMetric } from './operational-telemetry-chart';
import { buildOperationalTooltip, operationalTooltipShell } from './operational-tooltip';
import styles from './operational-telemetry-overview-chart.module.sass';

type OperationalTelemetryOverviewChartProps = {
  labels: string[];
  metrics: OperationalTelemetryMetric[];
  ariaLabel: string;
};

const seriesColors = ['#e4e4e7', '#8b8b93', '#52525b'];

export function OperationalTelemetryOverviewChart({
  labels,
  metrics,
  ariaLabel,
}: OperationalTelemetryOverviewChartProps) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    color: seriesColors,
    tooltip: {
      ...operationalTooltipShell,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        snap: true,
        lineStyle: { color: '#52525b', width: 1, type: 'dashed' },
      },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw)
          ? raw as Array<{ seriesName?: string; value?: number; axisValue?: string; seriesIndex?: number }>
          : [];
        const period = items[0]?.axisValue ?? 'Agora';

        return buildOperationalTooltip({
          eyebrow: 'TELEMETRIA OPERACIONAL',
          title: period,
          rows: items.map((item) => {
            const metric = metrics[item.seriesIndex ?? 0];
            return {
              label: item.seriesName ?? metric?.name ?? 'Métrica',
              value: String(item.value ?? '—') + (metric?.unit ?? ''),
              tone: 'neutral',
            };
          }),
          footer: 'Cada série mantém sua própria escala para preservar a leitura de tendência.',
        });
      },
    },
    legend: {
      top: 2,
      right: 6,
      itemWidth: 12,
      itemHeight: 3,
      itemGap: 18,
      textStyle: {
        color: '#a1a1aa',
        fontSize: 11,
        fontWeight: 500,
      },
      data: metrics.map((metric) => metric.name),
    },
    grid: {
      left: 18,
      right: 18,
      top: 48,
      bottom: 34,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#2d2d31' } },
      axisLabel: {
        color: '#71717a',
        fontSize: 10,
        margin: 12,
      },
    },
    yAxis: metrics.map(() => ({
      type: 'value',
      show: false,
      scale: true,
      splitNumber: 4,
    })),
    series: metrics.map((metric, index) => ({
      name: metric.name,
      type: 'line',
      yAxisIndex: index,
      data: metric.values,
      smooth: 0.32,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: {
        width: index === 0 ? 2.4 : 1.8,
        color: seriesColors[index] ?? seriesColors[2],
      },
      areaStyle: index === 0
        ? { color: 'rgba(228,228,231,.06)', opacity: 1 }
        : undefined,
      emphasis: {
        focus: 'series',
        lineStyle: { width: index === 0 ? 3 : 2.4 },
      },
    })),
  }), [labels, metrics]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={ariaLabel}
      className={styles.chart}
    />
  );
}
