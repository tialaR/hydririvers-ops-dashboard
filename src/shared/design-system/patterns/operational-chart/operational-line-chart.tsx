'use client';

import { useMemo } from 'react';
import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import type { OperationalChartPoint } from './operational-chart-types';
import styles from './operational-chart-card.module.sass';
import { buildOperationalTooltip, operationalTooltipShell } from './operational-tooltip';

export type OperationalLineChartProps = {
  points: OperationalChartPoint[];
  unit?: string;
  size?: 'micro' | 'main';
  ariaLabel: string;
};

export function OperationalLineChart({
  points,
  unit,
  size = 'main',
  ariaLabel,
}: OperationalLineChartProps) {
  const option = useMemo<EChartsCoreOption>(() => {
    const values = points.map((point) => point.value);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const padding = Math.max((max - min) * 0.18, 1);

    return {
      animation: false,
      grid: {
        left: size === 'micro' ? 8 : 34,
        right: 12,
        top: size === 'micro' ? 12 : 18,
        bottom: 24,
        containLabel: false,
      },
      tooltip: {
        ...operationalTooltipShell,
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: '#52525b', type: 'dashed' } },
        formatter: (raw: unknown) => {
          const items = Array.isArray(raw) ? raw as Array<{ axisValue?: string; value?: number }> : [];
          const item = items[0];
          return buildOperationalTooltip({
            eyebrow: 'SÉRIE OPERACIONAL',
            title: item?.axisValue ?? 'Período',
            rows: [{ label: 'Valor', value: String(item?.value ?? '—') + (unit ? ' ' + unit : '') }],
          });
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: points.map((point) => point.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#2d343b' } },
        axisLabel: {
          color: '#747f8b',
          fontSize: 10,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value',
        show: size !== 'micro',
        min: min - padding,
        max: max + padding,
        splitNumber: 3,
        axisLabel: {
          color: '#747f8b',
          fontSize: 10,
          formatter: (value: number) => unit ? `${value}${unit}` : String(value),
        },
        splitLine: {
          lineStyle: { color: '#22292f', type: 'dashed' },
        },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: 0.35,
          symbol: 'circle',
          symbolSize: size === 'micro' ? 4 : 6,
          showSymbol: size !== 'micro',
          lineStyle: {
            width: 2,
            color: '#d4d4d8',
          },
          itemStyle: {
            color: '#d4d4d8',
            borderColor: '#18181b',
            borderWidth: 2,
          },
          areaStyle: size === 'main'
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(212,212,216,.16)' },
                    { offset: 1, color: 'rgba(212,212,216,0)' },
                  ],
                },
              }
            : undefined,
          emphasis: {
            focus: 'series',
            lineStyle: { width: 3 },
          },
        },
      ],
    };
  }, [points, size, unit]);

  const viewportClass =
    size === 'micro'
      ? `${styles.chartViewport} ${styles.chartViewportMicro}`
      : `${styles.chartViewport} ${styles.chartViewportMain}`;

  return (
    <OperationalEChart
      option={option}
      ariaLabel={ariaLabel}
      className={viewportClass}
    />
  );
}
