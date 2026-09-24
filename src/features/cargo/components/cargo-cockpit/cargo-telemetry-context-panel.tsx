'use client';

import { useMemo } from 'react';
import type { EChartsCoreOption } from '@/shared/design-system/patterns/operational-chart/operational-echart';
import { OperationalEChart } from '@/shared/design-system/patterns/operational-chart/operational-echart';
import styles from './cargo-cockpit-panels.module.sass';

const values = [6.8, 7.6, 7.1, 8.6, 8.1, 9.4, 8.9, 10.2, 9.5, 11.8, 10.7, 11.4];

export function CargoTelemetryContextPanel() {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#111317',
      borderColor: '#34383f',
      borderWidth: 1,
      textStyle: { color: '#f4f5f7', fontSize: 10 },
      formatter: (params: unknown) => {
        const point = Array.isArray(params) ? params[0] as { data?: number; dataIndex?: number } : null;
        return point ? `T-${11 - Number(point.dataIndex ?? 0)} · ${point.data ?? ''} nós` : '';
      },
    },
    xAxis: { type: 'category', data: values.map((_, index) => String(index)), show: false },
    yAxis: { type: 'value', show: false, min: 0, max: 14 },
    series: [{
      type: 'bar',
      data: values.map((value, index) => ({
        value,
        itemStyle: {
          color: index >= values.length - 3 ? '#39c5d0' : '#34383f',
          borderRadius: [3, 3, 2, 2],
        },
      })),
      barWidth: 14,
      barCategoryGap: '35%',
      emphasis: { disabled: true },
    }],
  }), []);

  return (
    <article className={styles.telemetryPanel} data-testid="page62-d04-telemetry">
      <h3 className={styles.panelTitle}>Telemetria &amp; contexto</h3>
      <div className={styles.metricRow}>
        <div className={styles.metric}>
          <small>VELOCIDADE</small>
          <strong>11,8 nós</strong>
        </div>
        <div className={styles.metric}>
          <small>NÍVEL / CORREDOR</small>
          <span>faixa DEMO normal</span>
        </div>
      </div>
      <OperationalEChart
        option={option}
        ariaLabel="Velocidade das últimas duas horas, com atualização há quatro minutos"
        className={styles.chart}
      />
      <small className={styles.footer}>últimas 2 h · atualização 4 min</small>
    </article>
  );
}
