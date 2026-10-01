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

function paddedBounds(a: number, b: number, minimumSpread: number, floor = 0) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const spread = Math.max(high - low, minimumSpread);
  return {
    min: Math.max(floor, low - (spread * 0.45)),
    max: high + (spread * 0.8),
  };
}

export function ActionOutcomeLedgerChart({
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
    const docValue = { blocked: 0, attention: 1, ready: 2 } as const;
    const docLabel = (value: number) => value >= 1.5 ? 'Pronto' : value >= 0.5 ? 'Revisar' : 'Bloqueado';
    const arrivalBounds = paddedBounds(arrivalBeforeMinutes, arrivalAfterMinutes, 30);
    const demurrageBounds = paddedBounds(demurrageBefore, demurrageAfter, 120);
    const draftBounds = paddedBounds(draftBefore, draftAfter, 0.4);

    const formatMetric = (metricIndex: number, value: number) => {
      if (metricIndex === 0) return formatClockMinutes(value);
      if (metricIndex === 1) return 'R$ ' + Math.round(value).toLocaleString('pt-BR') + '/h';
      if (metricIndex === 2) return value.toFixed(1).replace('.', ',') + ' m';
      return docLabel(value);
    };

    const rows = [
      { label: 'Chegada', before: arrivalBeforeMinutes, after: arrivalAfterMinutes, min: arrivalBounds.min, max: arrivalBounds.max, delta: (arrivalAfterMinutes - arrivalBeforeMinutes >= 0 ? '+' : '−') + Math.abs(arrivalAfterMinutes - arrivalBeforeMinutes) + ' min' },
      { label: 'Demurrage', before: demurrageBefore, after: demurrageAfter, min: demurrageBounds.min, max: demurrageBounds.max, delta: (demurrageAfter - demurrageBefore >= 0 ? '+' : '−') + 'R$ ' + Math.abs(demurrageAfter - demurrageBefore).toLocaleString('pt-BR') + '/h' },
      { label: 'Calado contratado', before: draftBefore, after: draftAfter, min: draftBounds.min, max: draftBounds.max, delta: (draftAfter - draftBefore >= 0 ? '+' : '−') + Math.abs(draftAfter - draftBefore).toFixed(1).replace('.', ',') + ' m' },
      { label: 'Documentos', before: docValue[documentsBefore], after: docValue[documentsAfter], min: 0, max: 2, delta: docLabel(docValue[documentsBefore]) + ' → ' + docLabel(docValue[documentsAfter]) },
    ];

    const normalize = (value: number, min: number, max: number) => {
      if (max <= min) return 64;
      return Math.max(34, Math.min(100, 34 + (((value - min) / (max - min)) * 66)));
    };

    const beforeData = rows.map((row) => normalize(row.before, row.min, row.max));
    const afterData = rows.map((row) => normalize(row.after, row.min, row.max));

    return {
      animation: false,
      tooltip: {
        ...operationalTooltipShell,
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255,255,255,.025)' } },
        formatter: (raw: unknown) => {
          const items = Array.isArray(raw) ? raw as Array<{ dataIndex?: number }> : [];
          const metricIndex = items[0]?.dataIndex ?? 0;
          const row = rows[metricIndex];
          return buildOperationalTooltip({
            eyebrow: 'EFEITO DO ACEITE',
            title: row?.label ?? 'Métrica',
            rows: [
              { label: 'Antes', value: formatMetric(metricIndex, Number(row?.before ?? 0)) },
              { label: 'Depois', value: formatMetric(metricIndex, Number(row?.after ?? 0)) },
              { label: 'Variação', value: row?.delta ?? '—' },
            ],
            footer: 'Cada linha usa uma escala local para tornar a mudança daquela métrica legível.',
          });
        },
      },
      grid: {
        left: 154,
        right: 24,
        top: 26,
        bottom: 18,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false,
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          align: 'right',
          margin: 18,
          width: 126,
          overflow: 'break',
          formatter: (_value: string, index: number) => {
            const row = rows[index];
            return '{metric|' + row.label + '}\n{delta|' + row.delta + '}';
          },
          rich: {
            metric: { color: '#f0f1f2', fontSize: 13, fontWeight: 680, lineHeight: 21 },
            delta: { color: '#9ca3ab', fontSize: 12, fontWeight: 520, lineHeight: 18 },
          },
        },
      },
      series: [
        {
          name: 'Antes',
          type: 'bar',
          data: beforeData,
          barWidth: 20,
          barGap: '38%',
          barCategoryGap: '34%',
          itemStyle: { color: '#62676e', borderRadius: 12 },
          showBackground: true,
          backgroundStyle: { color: '#252a30', borderRadius: 12 },
          emphasis: { disabled: true },
          label: {
            show: true,
            position: 'inside',
            color: '#f1f3f5',
            fontSize: 12,
            fontWeight: 650,
            formatter: (raw: unknown) => {
              const item = raw as { dataIndex?: number };
              const index = item.dataIndex ?? 0;
              return 'Antes · ' + formatMetric(index, rows[index].before);
            },
          },
        },
        {
          name: 'Depois',
          type: 'bar',
          data: afterData,
          barWidth: 20,
          itemStyle: { color: '#e3e5e7', borderRadius: 12 },
          showBackground: true,
          backgroundStyle: { color: '#252a30', borderRadius: 12 },
          emphasis: { disabled: true },
          label: {
            show: true,
            position: 'inside',
            color: '#17191c',
            fontSize: 12,
            fontWeight: 760,
            formatter: (raw: unknown) => {
              const item = raw as { dataIndex?: number };
              const index = item.dataIndex ?? 0;
              return 'Depois · ' + formatMetric(index, rows[index].after);
            },
          },
        },
      ],
    };
  }, [
    arrivalAfterMinutes,
    arrivalBeforeMinutes,
    demurrageAfter,
    demurrageBefore,
    documentsAfter,
    documentsBefore,
    draftAfter,
    draftBefore,
  ]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel="Comparação pós-aceite em quatro linhas para chegada, demurrage, calado contratado e documentos, com barras espessas e valores antes e depois centralizados dentro do gráfico"
      className={styles.actionLedger}
      renderer="svg"
    />
  );
}

export function PostActionReadinessArcChart({ pendingDocument }: { pendingDocument: boolean }) {
  const stableCount = pendingDocument ? 3 : 4;
  const value = stableCount;

  const option = useMemo<EChartsCoreOption>(() => ({
    animation: false,
    tooltip: { show: false },
    series: [{
      type: 'gauge',
      min: 0,
      max: 4,
      splitNumber: 4,
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '110%',
      pointer: { show: false },
      progress: { show: false },
      axisLine: {
        lineStyle: {
          width: 2,
          color: pendingDocument
            ? [
                [0.50, '#62676e'],
                [0.75, '#e1e3e5'],
                [0.88, '#8b9096'],
                [1, '#f59e0b'],
              ]
            : [
                [0.50, '#62676e'],
                [0.75, '#a8adb3'],
                [1, '#e1e3e5'],
              ],
        },
      },
      axisTick: {
        show: true,
        splitNumber: 9,
        distance: -43,
        length: 40,
        lineStyle: {
          color: 'auto',
          width: 12,
        },
      },
      splitLine: {
        show: true,
        distance: -43,
        length: 40,
        lineStyle: {
          color: 'auto',
          width: 12,
        },
      },
      axisLabel: { show: false },
      anchor: { show: false },
      title: {
        show: true,
        offsetCenter: [0, '18%'],
        color: '#aeb3b9',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: 620,
      },
      detail: {
        show: true,
        valueAnimation: false,
        offsetCenter: [0, '-9%'],
        color: '#f5f6f7',
        fontSize: 56,
        fontWeight: 760,
        formatter: (current: number) => String(Math.round(current)) + '/4',
      },
      data: [{
        value,
        name: pendingDocument ? '1 frente em validação' : 'sem pendências',
      }],
    }],
  }), [pendingDocument, value]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={pendingDocument
        ? 'Prontidão pós-aceite: três de quatro frentes estáveis, uma em validação e nenhuma bloqueada'
        : 'Prontidão pós-aceite: quatro de quatro frentes estáveis e nenhuma pendência'}
      className={styles.readinessArc}
      renderer="svg"
    />
  );
}

export function DocumentWeightComparisonChart({
  submitted = 18.4,
  evidence = 16.8,
  variant = 'semantic',
}: {
  submitted?: number;
  evidence?: number;
  variant?: 'semantic' | 'correction';
}) {
  const option = useMemo<EChartsCoreOption>(() => {
    const correctionMode = variant === 'correction';
    const labels = correctionMode ? ['MDF-e atual', 'Evidência confirmada'] : ['Evidência', 'Enviado'];
    const values = correctionMode ? [submitted, evidence] : [evidence, submitted];
    const colors = correctionMode ? ['#666b72', '#e2e4e7'] : ['#10b981', '#ef4444'];

    return {
      animation: false,
      grid: correctionMode
        ? { left: 128, right: 34, top: 18, bottom: 32 }
        : { left: 72, right: 36, top: 12, bottom: 18 },
      tooltip: {
        ...operationalTooltipShell,
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: '#52525b', type: 'dashed' } },
        formatter: (raw: unknown) => {
          const items = Array.isArray(raw) ? raw as Array<{ axisValue?: string; value?: number }> : [];
          const row = items[0];
          return buildOperationalTooltip({
            eyebrow: correctionMode ? 'CORREÇÃO DOCUMENTAL' : 'EVIDÊNCIA',
            title: row?.axisValue ?? 'Peso',
            rows: [{ label: 'Peso', value: String(row?.value ?? '—').replace('.', ',') + ' t' }],
            footer: correctionMode
              ? 'A cor do gráfico permanece neutra; o estado da divergência é comunicado nos indicadores semânticos da tela.'
              : undefined,
          });
        },
      },
      xAxis: {
        type: 'value',
        min: Math.max(0, Math.floor(Math.min(submitted, evidence) - 2)),
        max: Math.ceil(Math.max(submitted, evidence) + 1),
        axisLine: { lineStyle: { color: '#303740' } },
        splitLine: { lineStyle: { color: '#232a31', type: 'dashed' } },
        axisLabel: { color: '#7f8994', fontSize: correctionMode ? 11 : 10, formatter: '{value} t' },
      },
      yAxis: {
        type: 'category',
        inverse: correctionMode,
        data: labels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: correctionMode ? '#c5c9ce' : '#aab2bb',
          fontSize: correctionMode ? 12 : 11,
          fontWeight: 650,
          margin: correctionMode ? 14 : 8,
        },
      },
      series: [{
        type: 'bar',
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index], borderRadius: [0, 9, 9, 0] },
          label: correctionMode && index === 1 ? { color: '#17191c' } : undefined,
        })),
        barWidth: correctionMode ? 24 : 18,
        barCategoryGap: correctionMode ? '46%' : '30%',
        showBackground: correctionMode,
        backgroundStyle: correctionMode ? { color: '#23272c', borderRadius: 9 } : undefined,
        emphasis: { disabled: true },
        label: {
          show: true,
          position: correctionMode ? 'insideRight' : 'right',
          distance: correctionMode ? 12 : 8,
          color: '#e5e7eb',
          fontSize: correctionMode ? 12 : 11,
          fontWeight: correctionMode ? 720 : 600,
          formatter: (raw: unknown) => {
            const item = raw as { value?: number };
            return String(item.value ?? '—').replace('.', ',') + ' t';
          },
        },
      }],
    };
  }, [evidence, submitted, variant]);

  return (
    <OperationalEChart
      option={option}
      ariaLabel={'Comparação de peso: documento enviado ' + submitted + ' toneladas e evidência ' + evidence + ' toneladas'}
      className={variant === 'correction' ? styles.comparisonCorrection : styles.comparison}
      renderer={variant === 'correction' ? 'svg' : 'canvas'}
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

