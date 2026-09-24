'use client';

import { useMemo } from 'react';
import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import styles from './operational-chart-card.module.sass';

type OperationalGaugeChartProps = {
  value: number;
  ariaLabel: string;
  label?: string;
};

export function OperationalGaugeChart({
  value,
  ariaLabel,
  label = 'Progresso',
}: OperationalGaugeChartProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '94%',
        center: ['50%', '50%'],
        pointer: { show: false },
        progress: {
          show: true,
          roundCap: true,
          width: 8,
          itemStyle: { color: '#22d3ee' },
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, '#273038']],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '34%'],
          color: '#7f8994',
          fontSize: 9,
          fontWeight: 500,
        },
        detail: {
          valueAnimation: false,
          offsetCenter: [0, '-6%'],
          color: '#f4f5f7',
          fontSize: 18,
          fontWeight: 650,
          formatter: '{value}%',
        },
        data: [{ value: safeValue, name: label }],
      },
    ],
  }), [label, safeValue]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={ariaLabel}
      className={styles.gaugeViewport}
    />
  );
}
