'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { OperationalChartPoint } from './operational-chart-types';
import styles from './operational-chart-card.module.sass';

export type OperationalBarChartProps = {
  points: OperationalChartPoint[];
  unit?: string;
  size?: 'micro' | 'main';
  ariaLabel: string;
};

type ChartRow = { name: string; value: number };

function formatValueLabel(value: unknown, unit?: string) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) return '';
  return unit ? `${numeric}${unit}` : String(numeric);
}

const INITIAL_DIMENSION = {
  micro: { width: 360, height: 88 },
  main: { width: 360, height: 144 }
} as const;

const MIN_HEIGHT = { micro: '5.5rem', main: '9rem' } as const;

export function OperationalBarChart({ points, unit, size = 'main', ariaLabel }: OperationalBarChartProps) {
  const data = useMemo<ChartRow[]>(() => points.map((point) => ({ name: point.label, value: point.value })), [points]);
  const viewportClass = size === 'micro' ? `${styles.chartViewport} ${styles.chartViewportMicro}` : `${styles.chartViewport} ${styles.chartViewportMain}`;
  const maxValue = points.length ? Math.max(...points.map((point) => point.value), 1) : 1;

  return (
    <div className={viewportClass} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={MIN_HEIGHT[size]} initialDimension={INITIAL_DIMENSION[size]}>
        <BarChart data={data} margin={{ top: 16, right: 4, left: -12, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid stroke="var(--hy-chart-grid)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--hy-chart-axis)', fontSize: 10 }} axisLine={{ stroke: 'var(--hy-chart-axis-line)' }} tickLine={false} interval={0} />
          <YAxis hide={size === 'micro'} tick={{ fill: 'var(--hy-chart-axis)', fontSize: 10 }} width={size === 'micro' ? 0 : 32} axisLine={false} tickLine={false} domain={[0, maxValue * 1.15]} />
          <Bar dataKey="value" fill="var(--hy-chart-series-primary)" radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={size === 'micro' ? 28 : 40}>
            <LabelList dataKey="value" position="top" formatter={(value) => formatValueLabel(value, unit)} className={styles.chartValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
