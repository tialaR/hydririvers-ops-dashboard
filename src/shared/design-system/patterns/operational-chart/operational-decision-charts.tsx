'use client';

import { useMemo } from 'react';

import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import styles from './operational-decision-charts.module.sass';

export function ProposalTradeoffRadar() {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      textStyle: { color: '#8b949f', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 6,
    },
    radar: {
      radius: '58%',
      center: ['50%', '46%'],
      splitNumber: 4,
      axisName: { color: '#9aa4af', fontSize: 10 },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,.015)', 'rgba(255,255,255,.028)'] } },
      splitLine: { lineStyle: { color: '#2a3138' } },
      axisLine: { lineStyle: { color: '#2a3138' } },
      indicator: [
        { name: 'Custo', max: 100 },
        { name: 'ETA', max: 100 },
        { name: 'Calado', max: 100 },
        { name: 'Docs', max: 100 },
        { name: 'Risco', max: 100 },
      ],
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 4,
      data: [
        {
          value: [92, 62, 54, 68, 58],
          name: 'Navega Amazônia',
          lineStyle: { color: '#6b7280', width: 1.5 },
          itemStyle: { color: '#9ca3af' },
          areaStyle: { color: 'rgba(156,163,175,.08)' },
        },
        {
          value: [78, 88, 92, 96, 84],
          name: 'Rio Norte',
          lineStyle: { color: '#10b981', width: 2 },
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16,185,129,.12)' },
        },
      ],
    }],
  }), []);

  return (
    <OperationalEChart
      option={option}
      ariaLabel="Comparação visual entre as duas propostas por custo, ETA, compatibilidade de calado, prontidão documental e risco operacional"
      className={styles.radar}
    />
  );
}

export function DocumentWeightComparisonChart({
  submitted = 18.4,
  evidence = 16.8,
}: {
  submitted?: number;
  evidence?: number;
}) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: { left: 72, right: 36, top: 12, bottom: 18 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#475569', type: 'dashed' } },
      valueFormatter: (value: unknown) => String(value) + ' t',
    },
    xAxis: {
      type: 'value',
      min: Math.max(0, Math.floor(Math.min(submitted, evidence) - 2)),
      max: Math.ceil(Math.max(submitted, evidence) + 1),
      axisLine: { lineStyle: { color: '#303740' } },
      splitLine: { lineStyle: { color: '#232a31', type: 'dashed' } },
      axisLabel: { color: '#7f8994', fontSize: 10, formatter: '{value} t' },
    },
    yAxis: {
      type: 'category',
      data: ['Evidência', 'Enviado'],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#aab2bb', fontSize: 11, fontWeight: 600 },
    },
    series: [{
      type: 'bar',
      data: [
        { value: evidence, itemStyle: { color: '#10b981', borderRadius: [0, 6, 6, 0] } },
        { value: submitted, itemStyle: { color: '#ef4444', borderRadius: [0, 6, 6, 0] } },
      ],
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        color: '#e5e7eb',
        fontSize: 11,
        formatter: '{c} t',
      },
    }],
  }), [evidence, submitted]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={'Comparação de peso: documento enviado ' + submitted + ' toneladas e evidência ' + evidence + ' toneladas'}
      className={styles.comparison}
    />
  );
}

export function FollowUpHealthChart() {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: { left: 38, right: 18, top: 30, bottom: 26 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#475569', type: 'dashed' } },
      valueFormatter: (value: unknown) => String(value) + '%',
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#8b949f', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 6,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['16:10', '16:30', '16:50', '17:10', '17:30', 'agora'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#303740' } },
      axisLabel: { color: '#7f8994', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitNumber: 4,
      axisLabel: { color: '#7f8994', fontSize: 9, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#232a31', type: 'dashed' } },
    },
    series: [
      {
        name: 'Confiança ETA',
        type: 'line',
        data: [58, 64, 72, 78, 84, 88],
        smooth: 0.35,
        symbol: 'none',
        lineStyle: { color: '#22d3ee', width: 2 },
        areaStyle: { color: 'rgba(34,211,238,.08)' },
      },
      {
        name: 'Prontidão docs',
        type: 'line',
        data: [62, 72, 84, 92, 100, 100],
        smooth: 0.35,
        symbol: 'none',
        lineStyle: { color: '#10b981', width: 2 },
      },
      {
        name: 'Saúde do sinal',
        type: 'line',
        data: [76, 80, 82, 86, 89, 92],
        smooth: 0.35,
        symbol: 'none',
        lineStyle: { color: '#8b5cf6', width: 1.6 },
      },
    ],
  }), []);

  return (
    <OperationalEChart
      option={option}
      ariaLabel="Evolução pós-ação de confiança do ETA, prontidão documental e saúde do sinal"
      className={styles.followUp}
    />
  );
}

export function HydroLevelTrendChart() {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: { left: 42, right: 16, top: 18, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#475569', type: 'dashed' } },
      valueFormatter: (value: unknown) => String(value) + ' m',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Hoje'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#303740' } },
      axisLabel: { color: '#7f8994', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      min: 13,
      max: 16,
      splitNumber: 3,
      axisLabel: { color: '#7f8994', fontSize: 9, formatter: '{value} m' },
      splitLine: { lineStyle: { color: '#232a31', type: 'dashed' } },
    },
    series: [
      {
        name: 'Nível DEMO',
        type: 'line',
        data: [15.6, 15.3, 15.0, 14.7, 14.4, 14.1],
        smooth: 0.32,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#22d3ee', width: 2 },
        itemStyle: { color: '#22d3ee' },
        areaStyle: { color: 'rgba(34,211,238,.09)' },
      },
      {
        name: 'Faixa atenção DEMO',
        type: 'line',
        data: [13.8, 13.8, 13.8, 13.8, 13.8, 13.8],
        symbol: 'none',
        lineStyle: { color: '#f59e0b', width: 1, type: 'dashed' },
      },
    ],
  }), []);

  return (
    <OperationalEChart
      option={option}
      ariaLabel="Tendência demonstrativa de nível do rio nos últimos seis dias com faixa de atenção demonstrativa"
      className={styles.hydro}
    />
  );
}
