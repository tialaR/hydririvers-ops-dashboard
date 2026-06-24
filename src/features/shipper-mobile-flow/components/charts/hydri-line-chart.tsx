'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import type { ShipperChartPoint } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from './hydri-chart-card.module.sass';

export type HydriLineChartProps = {
  points: ShipperChartPoint[];
  unit?: string;
  size?: 'micro' | 'main';
  ariaLabel: string;
};

type ChartRow = {
  name: string;
  value: number;
};

function formatValueLabel(value: unknown, unit?: string) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) return '';
  return unit ? `${numeric} ${unit}` : String(numeric);
}

const HY_CHART_VIEWPORT_INITIAL_DIMENSION = {
  micro: { width: 360, height: 88 },
  main: { width: 360, height: 144 }
} as const;

const HY_CHART_VIEWPORT_MIN_HEIGHT = {
  micro: '5.5rem',
  main: '9rem'
} as const;

export function HydriLineChart({ points, unit, size = 'main', ariaLabel }: HydriLineChartProps) {
  const data = useMemo<ChartRow[]>(
    () => points.map((point) => ({ name: point.label, value: point.value })),
    [points]
  );
  const viewportClass =
    size === 'micro'
      ? `${styles.chartViewport} ${styles.chartViewportMicro}`
      : `${styles.chartViewport} ${styles.chartViewportMain}`;
  const showValueLabels = size === 'main';
  const yPadding = size === 'micro' ? 0.05 : 0.1;
  const values = points.map((point) => point.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  return (
    <div className={viewportClass} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={HY_CHART_VIEWPORT_MIN_HEIGHT[size]}
        initialDimension={HY_CHART_VIEWPORT_INITIAL_DIMENSION[size]}
      >
        <LineChart data={data} margin={{ top: showValueLabels ? 14 : 6, right: 4, left: size === 'micro' ? -8 : -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--hy-chart-grid)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--hy-chart-axis)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--hy-chart-axis-line)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            hide={size === 'micro'}
            tick={{ fill: 'var(--hy-chart-axis)', fontSize: 10 }}
            width={size === 'micro' ? 0 : 28}
            axisLine={false}
            tickLine={false}
            domain={[minValue - yPadding, maxValue + yPadding]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--hy-chart-series-primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--hy-chart-series-primary)', r: 3, strokeWidth: 0 }}
            activeDot={false}
            isAnimationActive={false}
          >
            {showValueLabels ? (
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value) => formatValueLabel(value, unit)}
                className={styles.chartValueLabel}
              />
            ) : null}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
