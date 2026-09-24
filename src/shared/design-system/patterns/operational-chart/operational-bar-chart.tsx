'use client';

import { useMemo } from 'react';
import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import type { OperationalChartPoint } from './operational-chart-types';
import styles from './operational-chart-card.module.sass';

export type OperationalBarChartProps = {
  points: OperationalChartPoint[];
  unit?: string;
  size?: 'micro' | 'main';
  ariaLabel: string;
};

export function OperationalBarChart({
  points,
  unit,
  size = 'main',
  ariaLabel,
}: OperationalBarChartProps) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: {
      left: size === 'micro' ? 8 : 34,
      right: 12,
      top: 16,
      bottom: 24,
      containLabel: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#12161b',
      borderColor: '#2c333a',
      borderWidth: 1,
      textStyle: { color: '#f4f5f7', fontSize: 11 },
      valueFormatter: (value: unknown) => `${value}${unit ? ` ${unit}` : ''}`,
    },
    xAxis: {
      type: 'category',
      data: points.map((point) => point.label),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#2d343b' } },
      axisLabel: { color: '#747f8b', fontSize: 10, hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      show: size !== 'micro',
      splitNumber: 3,
      axisLabel: { color: '#747f8b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#22292f', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: points.map((point) => point.value),
        barMaxWidth: size === 'micro' ? 18 : 28,
        itemStyle: {
          color: '#22d3ee',
          borderRadius: [5, 5, 2, 2],
        },
        emphasis: {
          itemStyle: { color: '#67e8f9' },
        },
      },
    ],
  }), [points, size, unit]);

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
