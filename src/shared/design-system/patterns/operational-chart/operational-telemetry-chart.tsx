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
    const rowHeight = 44;
    const rowGap = 22;
    const gridTop = 14;

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
        left: 92,
        right: 58,
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
      yAxis: metrics.map((_, index) => ({
        type: 'value',
        gridIndex: index,
        scale: true,
        show: false,
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
      graphic: metrics.flatMap((metric, index) => {
        const top = gridTop + index * (rowHeight + rowGap);
        const lastValue = metric.values.at(-1);
        return [
          {
            type: 'text',
            left: 8,
            top: top + 8,
            style: {
              text: metric.name,
              fill: '#8b949f',
              font: '500 10px Inter, system-ui, sans-serif',
            },
          },
          {
            type: 'text',
            right: 6,
            top: top + 8,
            style: {
              text: lastValue == null ? '—' : String(lastValue) + metric.unit,
              fill: '#c8d0d8',
              font: '600 10px Inter, system-ui, sans-serif',
              textAlign: 'right',
            },
          },
        ];
      }),
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
