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
  hydroContext?: {
    riverGaugeLevelsM: number[];
    operatingDraftM: number;
    requiredDepthM: number;
    sourceLabel: string;
    dataAgeMin: number;
    demo?: boolean;
  };
};

const seriesColors = ['#e4e4e7', '#8b8b93', '#52525b'];

export function OperationalTelemetryOverviewChart({
  labels,
  metrics,
  ariaLabel,
  hydroContext,
}: OperationalTelemetryOverviewChartProps) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    color: seriesColors,
    tooltip: {
      ...operationalTooltipShell,
      trigger: 'axis',
      transitionDuration: 0,
      hideDelay: 0,
      enterable: false,
      confine: true,
      axisPointer: {
        type: 'line',
        snap: true,
        animation: false,
        lineStyle: { color: '#52525b', width: 1, type: 'dashed' },
      },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw)
          ? raw as Array<{ seriesName?: string; value?: number; axisValue?: string; seriesIndex?: number }>
          : [];
        const period = items[0]?.axisValue ?? 'Agora';
        const dataIndex = items[0]?.dataIndex ?? 0;
        const hydroRows = hydroContext
          ? [
              {
                label: hydroContext.demo ? 'Cota fluviométrica · DEMO' : 'Cota fluviométrica',
                value: String(hydroContext.riverGaugeLevelsM[dataIndex] ?? hydroContext.riverGaugeLevelsM.at(-1) ?? '—') + ' m',
                tone: 'info' as const,
              },
              {
                label: 'Calado operacional',
                value: hydroContext.operatingDraftM.toFixed(2) + ' m',
                tone: 'neutral' as const,
              },
              {
                label: 'Profundidade requerida',
                value: hydroContext.requiredDepthM.toFixed(2) + ' m',
                tone: 'neutral' as const,
              },
            ]
          : [];

        return buildOperationalTooltip({
          eyebrow: 'TELEMETRIA OPERACIONAL',
          title: period,
          rows: [
            ...items.map((item) => {
              const metric = metrics[item.seriesIndex ?? 0];
              return {
                label: item.seriesName ?? metric?.name ?? 'Métrica',
                value: String(item.value ?? '—') + (metric?.unit ?? ''),
                tone: 'neutral' as const,
              };
            }),
            ...hydroRows,
          ],
          footer: hydroContext
            ? hydroContext.sourceLabel + ' · freshness ' + hydroContext.dataAgeMin + ' min'
            : 'Cada série mantém sua própria escala para preservar a leitura de tendência.',
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
        fontSize: 12,
        fontWeight: 500,
      },
      formatter: (name: string) => {
        const metric = metrics.find((item) => item.name === name);
        const latest = metric?.values.at(-1);
        return latest === undefined
          ? name
          : name + '  ' + latest + (metric?.unit ?? '');
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
        fontSize: 11,
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
        disabled: true,
      },
    })),
  }), [hydroContext, labels, metrics]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={ariaLabel}
      className={styles.chart}
    />
  );
}
