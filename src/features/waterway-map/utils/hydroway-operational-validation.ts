import type {
  CargoWaterwayOperationalContext,
  HydrowayAlertSeverity,
  HydrowayLngLat,
  HydrowayOperationalDataset,
} from '../domain/hydroway-operational-domain.types';

/** Valida par [lng, lat] finito dentro dos limites WGS84 usuais. */
export function isValidLngLat(value: unknown): value is HydrowayLngLat {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    Number.isFinite(value[0]) &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1]) &&
    value[1] >= -90 &&
    value[1] <= 90
  );
}

/** Valida LineString como lista de coordenadas [lng, lat]. */
export function isValidLineStringCoordinates(value: unknown): value is HydrowayLngLat[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every((coordinate) => isValidLngLat(coordinate))
  );
}

/** Garante progresso entre 0 e 1. */
export function clampProgress01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function hasOperationalAlertSeverity(
  dataset: HydrowayOperationalDataset,
  severity: HydrowayAlertSeverity,
): boolean {
  return dataset.alerts.some((alert) => alert.severity === severity);
}

export type OperationalDatasetIntegrityIssue = {
  code: string;
  message: string;
  entityId?: string;
};

function idSet(ids: string[]): Set<string> {
  return new Set(ids);
}

/** Valida integridade referencial do dataset — retorna lista de problemas (para testes). */
export function assertOperationalDatasetIntegrity(
  dataset: HydrowayOperationalDataset,
): OperationalDatasetIntegrityIssue[] {
  const issues: OperationalDatasetIntegrityIssue[] = [];
  const corridorIds = idSet(dataset.corridors.map((c) => c.id));
  const segmentIds = idSet(dataset.segments.map((s) => s.id));
  const terminalIds = idSet(dataset.terminals.map((t) => t.id));
  const alertIds = idSet(dataset.alerts.map((a) => a.id));
  const checkpointIds = idSet(dataset.checkpoints.map((c) => c.id));

  for (const corridor of dataset.corridors) {
    if (!corridor.id || !corridor.name) {
      issues.push({ code: 'corridor-missing-id-name', message: 'Corridor sem id ou name', entityId: corridor.id });
    }
    if (!isValidLineStringCoordinates(corridor.coordinates)) {
      issues.push({
        code: 'corridor-invalid-coordinates',
        message: 'Corridor com coordinates inválidas',
        entityId: corridor.id,
      });
    }
  }

  for (const segment of dataset.segments) {
    if (!corridorIds.has(segment.corridorId)) {
      issues.push({
        code: 'segment-unknown-corridor',
        message: `Segment referencia corridorId inexistente: ${segment.corridorId}`,
        entityId: segment.id,
      });
    }
    if (!isValidLineStringCoordinates(segment.coordinates)) {
      issues.push({
        code: 'segment-invalid-coordinates',
        message: 'Segment com coordinates inválidas',
        entityId: segment.id,
      });
    }
  }

  for (const terminal of dataset.terminals) {
    if (!isValidLngLat(terminal.coordinates)) {
      issues.push({
        code: 'terminal-invalid-coordinates',
        message: 'Terminal com coordinates inválidas',
        entityId: terminal.id,
      });
    }
    for (const corridorId of terminal.corridorIds) {
      if (!corridorIds.has(corridorId)) {
        issues.push({
          code: 'terminal-unknown-corridor',
          message: `Terminal referencia corridorId inexistente: ${corridorId}`,
          entityId: terminal.id,
        });
      }
    }
  }

  for (const alert of dataset.alerts) {
    if (!alert.severity || !alert.type || !alert.shortMessage) {
      issues.push({
        code: 'alert-incomplete',
        message: 'Alert sem severity, type ou shortMessage',
        entityId: alert.id,
      });
    }
    if (!isValidLngLat(alert.coordinates)) {
      issues.push({
        code: 'alert-invalid-coordinates',
        message: 'Alert com coordinates inválidas',
        entityId: alert.id,
      });
    }
    if (alert.segmentId && !segmentIds.has(alert.segmentId)) {
      issues.push({
        code: 'alert-unknown-segment',
        message: `Alert referencia segmentId inexistente: ${alert.segmentId}`,
        entityId: alert.id,
      });
    }
    if (alert.corridorId && !corridorIds.has(alert.corridorId)) {
      issues.push({
        code: 'alert-unknown-corridor',
        message: `Alert referencia corridorId inexistente: ${alert.corridorId}`,
        entityId: alert.id,
      });
    }
  }

  for (const signal of dataset.signals) {
    if (!segmentIds.has(signal.segmentId)) {
      issues.push({
        code: 'signal-unknown-segment',
        message: `Signal referencia segmentId inexistente: ${signal.segmentId}`,
        entityId: signal.id,
      });
    }
    if (!isValidLngLat(signal.coordinates)) {
      issues.push({
        code: 'signal-invalid-coordinates',
        message: 'Signal com coordinates inválidas',
        entityId: signal.id,
      });
    }
  }

  for (const ctx of dataset.cargoContexts) {
    validateCargoContextRefs(ctx, { corridorIds, segmentIds, terminalIds, alertIds, checkpointIds }, issues);
  }

  return issues;
}

function validateCargoContextRefs(
  ctx: CargoWaterwayOperationalContext,
  refs: {
    corridorIds: Set<string>;
    segmentIds: Set<string>;
    terminalIds: Set<string>;
    alertIds: Set<string>;
    checkpointIds: Set<string>;
  },
  issues: OperationalDatasetIntegrityIssue[],
): void {
  const { corridorIds, segmentIds, terminalIds, alertIds, checkpointIds } = refs;

  if (!corridorIds.has(ctx.corridorId)) {
    issues.push({
      code: 'context-unknown-corridor',
      message: `CargoContext referencia corridorId inexistente: ${ctx.corridorId}`,
      entityId: ctx.cargoId,
    });
  }
  if (!segmentIds.has(ctx.activeSegmentId)) {
    issues.push({
      code: 'context-unknown-segment',
      message: `CargoContext referencia activeSegmentId inexistente: ${ctx.activeSegmentId}`,
      entityId: ctx.cargoId,
    });
  }
  if (!terminalIds.has(ctx.originTerminalId)) {
    issues.push({
      code: 'context-unknown-origin',
      message: `CargoContext referencia originTerminalId inexistente: ${ctx.originTerminalId}`,
      entityId: ctx.cargoId,
    });
  }
  if (!terminalIds.has(ctx.destinationTerminalId)) {
    issues.push({
      code: 'context-unknown-destination',
      message: `CargoContext referencia destinationTerminalId inexistente: ${ctx.destinationTerminalId}`,
      entityId: ctx.cargoId,
    });
  }
  if (!isValidLngLat(ctx.currentPosition.coordinates)) {
    issues.push({
      code: 'context-invalid-position',
      message: 'CargoContext com currentPosition inválida',
      entityId: ctx.cargoId,
    });
  }
  const progress = ctx.progress01;
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    issues.push({
      code: 'context-invalid-progress',
      message: `CargoContext com progress01 fora de [0,1]: ${progress}`,
      entityId: ctx.cargoId,
    });
  }
  for (const alertId of ctx.activeAlertIds) {
    if (!alertIds.has(alertId)) {
      issues.push({
        code: 'context-unknown-alert',
        message: `CargoContext referencia alertId inexistente: ${alertId}`,
        entityId: ctx.cargoId,
      });
    }
  }
  if (ctx.nextTerminalId && !terminalIds.has(ctx.nextTerminalId)) {
    issues.push({
      code: 'context-unknown-next-terminal',
      message: `CargoContext referencia nextTerminalId inexistente: ${ctx.nextTerminalId}`,
      entityId: ctx.cargoId,
    });
  }
  if (ctx.nextCheckpointId && !checkpointIds.has(ctx.nextCheckpointId)) {
    issues.push({
      code: 'context-unknown-next-checkpoint',
      message: `CargoContext referencia nextCheckpointId inexistente: ${ctx.nextCheckpointId}`,
      entityId: ctx.cargoId,
    });
  }
}
