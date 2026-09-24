'use client';

import { useMemo } from 'react';
import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import styles from './operational-chart-card.module.sass';

export type OperationalTelemetryMetric = {
  name: string;
  unit: string;
  values: number[];
};

type OperationalTelemetryChartProps = {
  labels: string[];
  metrics: OperationalTelemetryMetric[];
  ariaLabel: string;
};

export function OperationalTelemetryChart({
  labels,
  metrics,
  ariaLabel,
}: OperationalTelemetryChartProps) {
  const option = useMemo<EChartsCoreOption>(() => {
    const rowHeight = 30;
    const rowGap = 17;
    const gridTop = 8;

    return {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#12161b',
        borderColor: '#2c333a',
        borderWidth: 1,
        textStyle: { color: '#f4f5f7', fontSize: 11 },
      },
      grid: metrics.map((_, index) => ({
        left: 96,
        right: 14,
        top: gridTop + index * (rowHeight + rowGap),
        height: rowHeight,
      })),
      xAxis: metrics.map((_, index) => ({
        type: 'category',
        gridIndex: index,
        boundaryGap: false,
        data: labels,
        axisTick: { show: false },
        axisLine: {
          show: index === metrics.length - 1,
          lineStyle: { color: '#283038' },
        },
        axisLabel: {
          show: index === metrics.length - 1,
          color: '#6f7a85',
          fontSize: 9,
          margin: 8,
          interval: Math.max(0, Math.floor(labels.length / 5) - 1),
        },
      })),
      yAxis: metrics.map((metric, index) => ({
        type: 'value',
        gridIndex: index,
        scale: true,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: '#7f8994',
          fontSize: 9,
          formatter: (value: number) => `${value}${metric.unit}`,
        },
      })),
      series: metrics.map((metric, index) => ({
        name: metric.name,
        type: 'line',
        xAxisIndex: index,
        yAxisIndex: index,
        data: metric.values,
        smooth: 0.32,
        showSymbol: false,
        symbol: 'none',
        lineStyle: {
          width: 1.8,
          color: index === 0 ? '#22d3ee' : index === 1 ? '#38bdf8' : '#67e8f9',
        },
        areaStyle: {
          opacity: 0.08,
          color: index === 0 ? '#22d3ee' : index === 1 ? '#38bdf8' : '#67e8f9',
        },
      })),
      graphic: metrics.map((metric, index) => ({
        type: 'text',
        left: 8,
        top: gridTop + index * (rowHeight + rowGap) + 8,
        style: {
          text: metric.name,
          fill: '#8b949f',
          font: '500 10px Inter, system-ui, sans-serif',
        },
      })),
    };
  }, [labels, metrics]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={ariaLabel}
      className={styles.telemetryViewport}
    />
  );
}
