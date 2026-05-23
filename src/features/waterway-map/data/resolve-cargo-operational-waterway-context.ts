import { getHydrowayOperationalLayerModeConfig } from '../constants/hydroway-operational-layer-modes';
import type {
  CargoWaterwayOperationalContext,
  HydrowayAlert,
  HydrowayOperationalDataset,
  HydrowayOperationalDatasetSlice,
  HydrowayOperationalLayerMode,
  HydrowaySegment,
  HydrowayTerminal,
} from '../domain/hydroway-operational-domain.types';
import { hydrowayOperationalDatasetMock } from '../mocks/hydroway-operational-layers.mock';
import { clampProgress01 } from '../utils/hydroway-operational-validation';

const SUPPORTED_CARGO_IDS = ['CARGO-001', 'CARGO-004'] as const;

export type SupportedOperationalCargoId = (typeof SUPPORTED_CARGO_IDS)[number];

export function isSupportedOperationalCargoId(
  cargoId: string,
): cargoId is SupportedOperationalCargoId {
  return (SUPPORTED_CARGO_IDS as readonly string[]).includes(cargoId);
}

function findCargoContext(
  dataset: HydrowayOperationalDataset,
  cargoId: string,
): CargoWaterwayOperationalContext | undefined {
  return dataset.cargoContexts.find((ctx) => ctx.cargoId === cargoId);
}

function enrichContext(
  raw: CargoWaterwayOperationalContext,
  dataset: HydrowayOperationalDataset,
): CargoWaterwayOperationalContext {
  const recommendedLayerMode = resolveRecommendedLayerMode(raw, dataset);
  return {
    ...raw,
    progress01: clampProgress01(raw.progress01),
    recommendedLayerMode,
  };
}

/**
 * Retorna contexto operacional enriquecido para a carga.
 * `null` para cargo inexistente ou fora do escopo mock.
 */
export function resolveCargoOperationalWaterwayContext(
  cargoId: string,
  dataset: HydrowayOperationalDataset = hydrowayOperationalDatasetMock,
): CargoWaterwayOperationalContext | null {
  const raw = findCargoContext(dataset, cargoId);
  if (!raw) return null;
  return enrichContext(raw, dataset);
}

function segmentIdsForCorridor(dataset: HydrowayOperationalDataset, corridorId: string): Set<string> {
  return new Set(
    dataset.segments.filter((segment) => segment.corridorId === corridorId).map((s) => s.id),
  );
}

function collectRelevantSegments(
  dataset: HydrowayOperationalDataset,
  context: CargoWaterwayOperationalContext,
): HydrowaySegment[] {
  const corridorSegmentIds = segmentIdsForCorridor(dataset, context.corridorId);
  const active = dataset.segments.find((s) => s.id === context.activeSegmentId);
  const related = dataset.segments.filter(
    (segment) =>
      corridorSegmentIds.has(segment.id) ||
      context.activeAlertIds.some((alertId) => {
        const alert = dataset.alerts.find((a) => a.id === alertId);
        return alert?.segmentId === segment.id;
      }),
  );
  const byId = new Map<string, HydrowaySegment>();
  if (active) byId.set(active.id, active);
  for (const segment of related) {
    byId.set(segment.id, segment);
  }
  return [...byId.values()];
}

function collectRelevantTerminals(
  dataset: HydrowayOperationalDataset,
  context: CargoWaterwayOperationalContext,
): HydrowayTerminal[] {
  const ids = new Set<string>([
    context.originTerminalId,
    context.destinationTerminalId,
  ]);
  if (context.nextTerminalId) ids.add(context.nextTerminalId);

  return dataset.terminals.filter(
    (terminal) =>
      ids.has(terminal.id) ||
      terminal.corridorIds.includes(context.corridorId),
  );
}

function collectRelevantAlerts(
  dataset: HydrowayOperationalDataset,
  context: CargoWaterwayOperationalContext,
): HydrowayAlert[] {
  const activeSet = new Set(context.activeAlertIds);
  return dataset.alerts.filter(
    (alert) =>
      activeSet.has(alert.id) ||
      alert.corridorId === context.corridorId ||
      alert.segmentId === context.activeSegmentId,
  );
}

function collectRelevantSignals(
  dataset: HydrowayOperationalDataset,
  segmentIds: Set<string>,
): HydrowayOperationalDataset['signals'] {
  return dataset.signals.filter((signal) => segmentIds.has(signal.segmentId));
}

function collectRelevantCheckpoints(
  dataset: HydrowayOperationalDataset,
  cargoId: string,
): HydrowayOperationalDataset['checkpoints'] {
  return dataset.checkpoints.filter((checkpoint) => checkpoint.cargoId === cargoId);
}

function collectRelevantPlanningAreas(
  dataset: HydrowayOperationalDataset,
  corridorId: string,
): HydrowayOperationalDataset['planningAreas'] {
  const corridor = dataset.corridors.find((c) => c.id === corridorId);
  if (!corridor) return [];

  const nameTokens = corridor.name.toLowerCase().split(/[\s-]+/);
  return dataset.planningAreas.filter((area) => {
    const areaName = area.name.toLowerCase();
    return nameTokens.some((token) => token.length > 3 && areaName.includes(token));
  });
}

/**
 * Recorte do dataset operacional relevante para uma carga.
 * `null` se a carga não tiver contexto mock.
 */
export function resolveOperationalDatasetForCargo(
  cargoId: string,
  dataset: HydrowayOperationalDataset = hydrowayOperationalDatasetMock,
): HydrowayOperationalDatasetSlice | null {
  const context = resolveCargoOperationalWaterwayContext(cargoId, dataset);
  if (!context) return null;

  const corridor = dataset.corridors.find((c) => c.id === context.corridorId);
  if (!corridor) return null;

  const segments = collectRelevantSegments(dataset, context);
  const segmentIdSet = new Set(segments.map((s) => s.id));
  const terminals = collectRelevantTerminals(dataset, context);
  const alerts = collectRelevantAlerts(dataset, context);
  const signals = collectRelevantSignals(dataset, segmentIdSet);
  const checkpoints = collectRelevantCheckpoints(dataset, cargoId);
  const planningAreas = collectRelevantPlanningAreas(dataset, context.corridorId);

  return {
    cargoId,
    corridor,
    segments,
    terminals,
    alerts,
    signals,
    planningAreas,
    checkpoints,
    context,
  };
}

function getActiveSegment(
  dataset: HydrowayOperationalDataset,
  context: CargoWaterwayOperationalContext,
): HydrowaySegment | undefined {
  return dataset.segments.find((segment) => segment.id === context.activeSegmentId);
}

function getNextTerminal(
  dataset: HydrowayOperationalDataset,
  context: CargoWaterwayOperationalContext,
): HydrowayTerminal | undefined {
  if (!context.nextTerminalId) return undefined;
  return dataset.terminals.find((terminal) => terminal.id === context.nextTerminalId);
}

function hasCriticalAlert(context: CargoWaterwayOperationalContext, dataset: HydrowayOperationalDataset): boolean {
  return context.activeAlertIds.some((alertId) => {
    const alert = dataset.alerts.find((a) => a.id === alertId);
    return alert?.severity === 'critical';
  });
}

/**
 * Modo recomendado com base em alertas, navegabilidade e fila no próximo terminal.
 */
export function resolveRecommendedLayerMode(
  context: CargoWaterwayOperationalContext,
  dataset: HydrowayOperationalDataset = hydrowayOperationalDatasetMock,
): HydrowayOperationalLayerMode {
  if (hasCriticalAlert(context, dataset)) {
    return 'risk';
  }

  const activeSegment = getActiveSegment(dataset, context);
  if (
    activeSegment &&
    (activeSegment.navigabilityStatus === 'attention' ||
      activeSegment.navigabilityStatus === 'restricted')
  ) {
    return 'navigation';
  }

  const nextTerminal = getNextTerminal(dataset, context);
  if (nextTerminal?.queueRisk === 'high') {
    return 'logistics';
  }

  return 'operation';
}

export type OperationalLayerModeSummary = {
  mode: HydrowayOperationalLayerMode;
  headline: string;
  detail: string;
  businessGoal: string;
  primaryAudience: string;
};

/**
 * Resumo curto para futura UI de seleção de modo operacional.
 */
export function getOperationalLayerModeSummary(
  mode: HydrowayOperationalLayerMode,
  slice?: HydrowayOperationalDatasetSlice | null,
): OperationalLayerModeSummary {
  const config = getHydrowayOperationalLayerModeConfig(mode);
  const businessGoal = config?.businessGoal ?? 'Monitoramento operacional hidroviário.';
  const primaryAudience = config?.primaryAudience ?? 'mixed';

  if (!slice) {
    return {
      mode,
      headline: config?.visualIntent ?? mode,
      detail: businessGoal,
      businessGoal,
      primaryAudience,
    };
  }

  const { context, alerts, segments } = slice;
  const activeSegment = segments.find((s) => s.id === context.activeSegmentId);

  switch (mode) {
    case 'risk': {
      const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
      return {
        mode,
        headline: `${criticalCount} alerta(s) crítico(s) na rota`,
        detail: alerts[0]?.shortMessage ?? 'Revisar impacto em ETA, custo e segurança.',
        businessGoal,
        primaryAudience,
      };
    }
    case 'navigation':
      return {
        mode,
        headline: activeSegment?.name ?? 'Trecho ativo',
        detail:
          activeSegment?.businessImpactSummary ??
          'Verificar calado, sinalização e recomendação de velocidade.',
        businessGoal,
        primaryAudience,
      };
    case 'logistics': {
      const nextTerminal = slice.terminals.find((t) => t.id === context.nextTerminalId);
      return {
        mode,
        headline: nextTerminal?.name ?? 'Próximo terminal',
        detail: nextTerminal?.businessImpactSummary ?? 'Confirmar janela e fila portuária.',
        businessGoal,
        primaryAudience,
      };
    }
    case 'government':
      return {
        mode,
        headline: `${slice.planningAreas.length} área(s) de planejamento`,
        detail: slice.corridor.strategicRole,
        businessGoal,
        primaryAudience,
      };
    case 'operation':
    default:
      return {
        mode: 'operation',
        headline: `${Math.round(context.progress01 * 100)}% da rota — ${context.operationalStatus}`,
        detail: context.businessSummary,
        businessGoal,
        primaryAudience,
      };
  }
}
