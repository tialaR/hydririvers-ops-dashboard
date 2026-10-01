'use client';

import { useMemo } from 'react';

import type { EChartsCoreOption } from './operational-echart';
import { OperationalEChart } from './operational-echart';
import styles from './operational-decision-charts.module.sass';
import { buildOperationalTooltip, operationalTooltipShell } from './operational-tooltip';

export function ProposalTradeoffRadar() {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    tooltip: {
      ...operationalTooltipShell,
      trigger: 'item',
      formatter: (raw: unknown) => {
        const item = raw as { name?: string; value?: number[] };
        const values = item.value ?? [];
        const labels = ['Custo', 'ETA', 'Calado', 'Docs', 'Risco'];
        return buildOperationalTooltip({
          eyebrow: 'COMPARATIVO',
          title: item.name ?? 'Proposta',
          rows: labels.map((label, index) => ({ label, value: String(values[index] ?? '—') + '/100' })),
          footer: 'Quanto maior, melhor adequação relativa naquele eixo.',
        });
      },
    },
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
          lineStyle: { color: '#71717a', width: 1.5 },
          itemStyle: { color: '#a1a1aa' },
          areaStyle: { color: 'rgba(161,161,170,.08)' },
        },
        {
          value: [78, 88, 92, 96, 84],
          name: 'Rio Norte',
          lineStyle: { color: '#d4d4d8', width: 2 },
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(212,212,216,.10)' },
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


export function ProposalDecisionComparisonChart({
  selectedLabel,
  referenceLabel,
  selectedScores,
  referenceScores,
}: {
  selectedLabel: string;
  referenceLabel: string;
  selectedScores: [number, number, number, number, number, number];
  referenceScores: [number, number, number, number, number, number];
}) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    grid: { left: 88, right: 24, top: 34, bottom: 26 },
    tooltip: {
      ...operationalTooltipShell,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw as Array<{ seriesName?: string; value?: number; axisValue?: string }> : [];
        return buildOperationalTooltip({
          eyebrow: 'ADEQUAÇÃO OPERACIONAL',
          title: items[0]?.axisValue ?? 'Critério',
          rows: items.map((item) => ({
            label: item.seriesName ?? 'Proposta',
            value: String(item.value ?? '—') + '/100',
          })),
          footer: 'Índice comparativo DEMO. Quanto maior, melhor a adequação relativa no critério.',
        });
      },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#8b949f', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 6,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#6f7781', fontSize: 9, formatter: '{value}' },
      splitLine: { lineStyle: { color: '#232a31', type: 'dashed' } },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: ['Risco', 'Docs', 'Calado', 'Demurrage', 'Custo', 'Janela'],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#aab2bb', fontSize: 10, fontWeight: 600 },
    },
    series: [
      {
        name: referenceLabel,
        type: 'bar',
        data: referenceScores,
        barWidth: 8,
        itemStyle: { color: '#555b63', borderRadius: [0, 5, 5, 0] },
      },
      {
        name: selectedLabel,
        type: 'bar',
        data: selectedScores,
        barWidth: 8,
        itemStyle: { color: '#d7d9dc', borderRadius: [0, 5, 5, 0] },
      },
    ],
  }), [referenceLabel, referenceScores, selectedLabel, selectedScores]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={'Comparação de adequação operacional entre ' + selectedLabel + ' e ' + referenceLabel + ' por janela, custo, demurrage, calado, documentos e risco'}
      className={styles.decisionBars}
    />
  );
}

function formatClockMinutes(value: number) {
  const safe = Math.round(value);
  const hours = Math.floor(safe / 60) % 24;
  const minutes = safe % 60;
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

function numericBounds(a: number, b: number, minimumPadding: number) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const spread = Math.max(high - low, minimumPadding);
  return { min: low - (spread * 0.32), max: high + (spread * 0.32) };
}

export function ActionOutcomeSmallMultiplesChart({
  arrivalBeforeMinutes,
  arrivalAfterMinutes,
  demurrageBefore,
  demurrageAfter,
  draftBefore,
  draftAfter,
  documentsBefore,
  documentsAfter,
}: {
  arrivalBeforeMinutes: number;
  arrivalAfterMinutes: number;
  demurrageBefore: number;
  demurrageAfter: number;
  draftBefore: number;
  draftAfter: number;
  documentsBefore: 'ready' | 'attention' | 'blocked';
  documentsAfter: 'ready' | 'attention' | 'blocked';
}) {
  const option = useMemo<EChartsCoreOption>(() => {
    const arrivalBounds = numericBounds(arrivalBeforeMinutes, arrivalAfterMinutes, 30);
    const demurrageBounds = numericBounds(demurrageBefore, demurrageAfter, 120);
    const draftBounds = numericBounds(draftBefore, draftAfter, 0.4);
    const documentValue = { blocked: 0, attention: 1, ready: 2 } as const;
    const documentLabel = (value: number) => value >= 1.5 ? 'Pronto' : value >= 0.5 ? 'Revisar' : 'Bloqueado';
    const point = (name: string, value: number, after = false) => ({
      name,
      value,
      symbol: after ? 'diamond' : 'circle',
      symbolSize: after ? 12 : 9,
      itemStyle: { color: after ? '#e3e5e7' : '#646970' },
    });

    return {
      animation: false,
      tooltip: { ...operationalTooltipShell, trigger: 'item' },
      title: [
        { text: 'Chegada', subtext: formatClockMinutes(arrivalBeforeMinutes) + ' → ' + formatClockMinutes(arrivalAfterMinutes), left: '4%', top: 0, textStyle: { color: '#e5e7eb', fontSize: 12, fontWeight: 650 }, subtextStyle: { color: '#9ca3af', fontSize: 11 } },
        { text: 'Demurrage', subtext: 'R$ ' + Math.round(demurrageBefore).toLocaleString('pt-BR') + '/h → R$ ' + Math.round(demurrageAfter).toLocaleString('pt-BR') + '/h', left: '54%', top: 0, textStyle: { color: '#e5e7eb', fontSize: 12, fontWeight: 650 }, subtextStyle: { color: '#9ca3af', fontSize: 11 } },
        { text: 'Calado contratado', subtext: draftBefore.toFixed(1).replace('.', ',') + ' m → ' + draftAfter.toFixed(1).replace('.', ',') + ' m', left: '4%', top: '51%', textStyle: { color: '#e5e7eb', fontSize: 12, fontWeight: 650 }, subtextStyle: { color: '#9ca3af', fontSize: 11 } },
        { text: 'Documentos', subtext: documentLabel(documentValue[documentsBefore]) + ' → ' + documentLabel(documentValue[documentsAfter]), left: '54%', top: '51%', textStyle: { color: '#e5e7eb', fontSize: 12, fontWeight: 650 }, subtextStyle: { color: '#9ca3af', fontSize: 11 } },
      ],
      grid: [
        { left: '5%', top: '17%', width: '39%', height: '26%', containLabel: true },
        { left: '55%', top: '17%', width: '39%', height: '26%', containLabel: true },
        { left: '5%', top: '68%', width: '39%', height: '25%', containLabel: true },
        { left: '55%', top: '68%', width: '39%', height: '25%', containLabel: true },
      ],
      xAxis: [0, 1, 2, 3].map((gridIndex) => ({ type: 'category', gridIndex, data: ['Antes', 'Depois'], boundaryGap: true, axisTick: { show: false }, axisLine: { lineStyle: { color: '#343940' } }, axisLabel: { color: '#9ca3af', fontSize: 11, fontWeight: 600, margin: 9 } })),
      yAxis: [
        { type: 'value', gridIndex: 0, min: Math.floor(arrivalBounds.min), max: Math.ceil(arrivalBounds.max), splitNumber: 2, axisLabel: { color: '#7f8790', fontSize: 10, formatter: (value: number) => formatClockMinutes(value) }, splitLine: { lineStyle: { color: '#272c32', type: 'dashed' } } },
        { type: 'value', gridIndex: 1, min: Math.max(0, Math.floor(demurrageBounds.min)), max: Math.ceil(demurrageBounds.max), splitNumber: 2, axisLabel: { color: '#7f8790', fontSize: 10, formatter: (value: number) => 'R$ ' + Math.round(value) }, splitLine: { lineStyle: { color: '#272c32', type: 'dashed' } } },
        { type: 'value', gridIndex: 2, min: Math.max(0, Number(draftBounds.min.toFixed(1))), max: Number(draftBounds.max.toFixed(1)), splitNumber: 2, axisLabel: { color: '#7f8790', fontSize: 10, formatter: (value: number) => value.toFixed(1).replace('.', ',') + ' m' }, splitLine: { lineStyle: { color: '#272c32', type: 'dashed' } } },
        { type: 'value', gridIndex: 3, min: 0, max: 2, interval: 1, axisLabel: { color: '#7f8790', fontSize: 10, formatter: (value: number) => documentLabel(value) }, splitLine: { lineStyle: { color: '#272c32', type: 'dashed' } } },
      ],
      series: [
        { name: 'Chegada', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: [point('Antes', arrivalBeforeMinutes), point('Depois', arrivalAfterMinutes, true)], lineStyle: { color: '#747980', width: 2 }, label: { show: true, position: 'top', color: '#d8dadd', fontSize: 11, formatter: (item: { value?: number }) => formatClockMinutes(Number(item.value ?? 0)) } },
        { name: 'Demurrage', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: [point('Antes', demurrageBefore), point('Depois', demurrageAfter, true)], lineStyle: { color: '#747980', width: 2 }, label: { show: true, position: 'top', color: '#d8dadd', fontSize: 11, formatter: (item: { value?: number }) => 'R$ ' + Math.round(Number(item.value ?? 0)) } },
        { name: 'Calado', type: 'line', xAxisIndex: 2, yAxisIndex: 2, data: [point('Antes', draftBefore), point('Depois', draftAfter, true)], lineStyle: { color: '#747980', width: 2 }, label: { show: true, position: 'top', color: '#d8dadd', fontSize: 11, formatter: (item: { value?: number }) => Number(item.value ?? 0).toFixed(1).replace('.', ',') + ' m' } },
        { name: 'Documentos', type: 'line', xAxisIndex: 3, yAxisIndex: 3, data: [point('Antes', documentValue[documentsBefore]), point('Depois', documentValue[documentsAfter], true)], lineStyle: { color: '#747980', width: 2 }, label: { show: true, position: 'top', color: '#d8dadd', fontSize: 11, formatter: (item: { value?: number }) => documentLabel(Number(item.value ?? 0)) } },
      ],
    };
  }, [arrivalAfterMinutes, arrivalBeforeMinutes, demurrageAfter, demurrageBefore, documentsAfter, documentsBefore, draftAfter, draftBefore]);

  return <OperationalEChart option={option} ariaLabel="Mudanças pós-aceite em quatro painéis independentes, com escalas próprias para chegada, demurrage, calado contratado e documentos" className={styles.actionOutcome} />;
}

export function PostActionStateAllocationChart({ pendingDocument }: { pendingDocument: boolean }) {
  const stableCount = pendingDocument ? 3 : 4;
  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    tooltip: { ...operationalTooltipShell, trigger: 'item' },
    graphic: [
      { type: 'text', left: 'center', top: '38%', style: { text: stableCount + '/4', fill: '#f3f4f6', fontSize: 26, fontWeight: 700, textAlign: 'center' } },
      { type: 'text', left: 'center', top: '55%', style: { text: 'estáveis', fill: '#9ca3af', fontSize: 11, fontWeight: 600, textAlign: 'center' } },
    ],
    series: [{
      type: 'pie',
      radius: ['60%', '84%'],
      center: ['50%', '50%'],
      startAngle: 90,
      label: { show: false },
      emphasis: { scale: false },
      itemStyle: { borderColor: '#141416', borderWidth: 5, borderRadius: 8 },
      data: [
        { value: 1, name: 'Decisão', itemStyle: { color: '#d7d9dc' } },
        { value: 1, name: 'Comercial', itemStyle: { color: '#aaadb2' } },
        { value: 1, name: 'Documentos', itemStyle: { color: pendingDocument ? '#6d7177' : '#85898f' } },
        { value: 1, name: 'Hidrovia', itemStyle: { color: '#51555b' } },
      ],
    }],
  }), [pendingDocument, stableCount]);

  return <OperationalEChart option={option} ariaLabel={pendingDocument ? 'Três de quatro frentes pós-aceite estabilizadas, com documentos em revalidação' : 'Quatro de quatro frentes pós-aceite estabilizadas'} className={styles.stateAllocation} />;
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
      ...operationalTooltipShell,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#52525b', type: 'dashed' } },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw as Array<{ axisValue?: string; value?: number }> : [];
        const row = items[0];
        return buildOperationalTooltip({
          eyebrow: 'EVIDÊNCIA',
          title: row?.axisValue ?? 'Peso',
          rows: [{ label: 'Valor', value: String(row?.value ?? '—') + ' t', tone: row?.axisValue === 'Enviado' ? 'critical' : 'success' }],
        });
      },
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
      ...operationalTooltipShell,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#52525b', type: 'dashed' } },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw as Array<{ seriesName?: string; value?: number; axisValue?: string }> : [];
        return buildOperationalTooltip({
          eyebrow: 'SAÚDE PÓS-AÇÃO',
          title: items[0]?.axisValue ?? 'Agora',
          rows: items.map((item) => ({ label: item.seriesName ?? 'Métrica', value: String(item.value ?? '—') + '%' })),
        });
      },
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
    grid: { left: 52, right: 20, top: 54, bottom: 34 },
    tooltip: {
      ...operationalTooltipShell,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#52525b', type: 'dashed' } },
      formatter: (raw: unknown) => {
        const items = Array.isArray(raw) ? raw as Array<{ seriesName?: string; value?: number; axisValue?: string }> : [];
        return buildOperationalTooltip({
          eyebrow: 'AMAZONAS–SOLIMÕES · DEMO',
          title: items[0]?.axisValue ?? 'Período',
          rows: items.map((item) => ({
            label: item.seriesName ?? 'Cota',
            value: String(item.value ?? '—').replace('.', ',') + ' m',
          })),
          footer: 'Cota fluviométrica não é profundidade navegável. Produção: ANA/Hidroweb + contexto DNIT/CHM.',
        });
      },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#8b8b93', fontSize: 11 },
      itemWidth: 16,
      itemHeight: 7,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['22 set', '23 set', '24 set', '25 set', '26 set', '27 set'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#303033' } },
      axisLabel: { color: '#7f7f87', fontSize: 10, margin: 12 },
    },
    yAxis: {
      type: 'value',
      min: 13.6,
      max: 15.8,
      splitNumber: 4,
      axisLabel: { color: '#7f7f87', fontSize: 10, formatter: '{value} m' },
      splitLine: { lineStyle: { color: '#242427', type: 'dashed' } },
    },
    series: [
      {
        name: 'Cota DEMO',
        type: 'line',
        data: [15.6, 15.32, 15.02, 14.71, 14.4, 14.1],
        smooth: 0.26,
        symbol: 'none',
        lineStyle: { color: '#e4e4e7', width: 2.4 },
        areaStyle: { color: 'rgba(228,228,231,.07)' },
        emphasis: { disabled: true },
      },
      {
        name: 'Média 3d DEMO',
        type: 'line',
        data: [15.6, 15.46, 15.31, 15.02, 14.71, 14.4],
        smooth: 0.22,
        symbol: 'none',
        lineStyle: { color: '#71717a', width: 1.35, type: 'dashed' },
        emphasis: { disabled: true },
      },
    ],
  }), []);

  return (
    <OperationalEChart
      option={option}
      ariaLabel="Tendência demonstrativa da cota fluviométrica do corredor Amazonas–Solimões de 22 a 27 de setembro, com série diária e média de três dias"
      className={styles.hydro}
      renderer="svg"
    />
  );
}

