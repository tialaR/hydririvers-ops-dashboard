import { describe, expect, it } from 'vitest';

import { HYDROWAY_OPERATIONAL_LAYER_MODES } from '@/features/waterway-map/constants/hydroway-operational-layer-modes';
import {
  getOperationalLayerModeSummary,
  resolveCargoOperationalWaterwayContext,
  resolveOperationalDatasetForCargo,
  resolveRecommendedLayerMode,
} from '@/features/waterway-map/data/resolve-cargo-operational-waterway-context';
import { hydrowayOperationalDatasetMock } from '@/features/waterway-map/mocks/hydroway-operational-layers.mock';

const modeIds = HYDROWAY_OPERATIONAL_LAYER_MODES.map((m) => m.id);

describe('resolveCargoOperationalWaterwayContext', () => {
  it('resolve CARGO-001 com corridor, segmento ativo, posição e checkpoints', () => {
    const context = resolveCargoOperationalWaterwayContext('CARGO-001');
    expect(context).not.toBeNull();
    expect(context!.corridorId).toBe('corridor-amazonas-solimoes');
    expect(context!.activeSegmentId).toBeTruthy();
    expect(context!.originTerminalId).toBe('terminal-belem');
    expect(context!.destinationTerminalId).toBe('terminal-santarem');
    expect(context!.currentPosition.coordinates).toHaveLength(2);
    expect(modeIds).toContain(context!.recommendedLayerMode);

    const slice = resolveOperationalDatasetForCargo('CARGO-001');
    expect(slice!.checkpoints.length).toBeGreaterThanOrEqual(1);
  });

  it('recomenda navigation para CARGO-001 por trecho em atenção', () => {
    const context = resolveCargoOperationalWaterwayContext('CARGO-001');
    expect(resolveRecommendedLayerMode(context!)).toBe('navigation');
    expect(context!.recommendedLayerMode).toBe('navigation');
  });

  it('resolve CARGO-002 com contexto operacional e checkpoints', () => {
    const context = resolveCargoOperationalWaterwayContext('CARGO-002');
    expect(context).not.toBeNull();
    expect(context!.corridorId).toBe('corridor-amazonas-solimoes');
    expect(context!.originTerminalId).toBe('terminal-manaus');
    expect(context!.destinationTerminalId).toBe('terminal-belem');
    expect(context!.activeAlertIds).toEqual(['alert-traffic-estuario']);

    const slice = resolveOperationalDatasetForCargo('CARGO-002');
    expect(slice!.checkpoints.length).toBeGreaterThanOrEqual(1);
  });

  it('resolve CARGO-003 com alerta de sinalização e terminal Macapá', () => {
    const context = resolveCargoOperationalWaterwayContext('CARGO-003');
    expect(context).not.toBeNull();
    expect(context!.corridorId).toBe('corridor-barra-norte');
    expect(context!.destinationTerminalId).toBe('terminal-macapa-santana');
    expect(context!.activeAlertIds).toEqual(['alert-signaling-barra-norte']);

    const slice = resolveOperationalDatasetForCargo('CARGO-003');
    expect(slice!.alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('resolve CARGO-004 com alerta crítico e terminal relevante', () => {
    const context = resolveCargoOperationalWaterwayContext('CARGO-004');
    expect(context).not.toBeNull();
    expect(context!.corridorId).toBe('corridor-tocantins-araguaia');
    expect(context!.activeSegmentId).toBeTruthy();
    expect(context!.originTerminalId).toBe('terminal-maraba');
    expect(context!.destinationTerminalId).toBe('terminal-vila-conde');
    expect(context!.currentPosition.coordinates.every(Number.isFinite)).toBe(true);
    expect(context!.recommendedLayerMode).toBe('risk');

    const slice = resolveOperationalDatasetForCargo('CARGO-004');
    expect(slice!.alerts.length).toBeGreaterThanOrEqual(1);
    expect(slice!.terminals.some((t) => t.id === 'terminal-vila-conde')).toBe(true);
  });

  it('recorte inclui corredor ativo e segmentos do corredor', () => {
    const slice = resolveOperationalDatasetForCargo('CARGO-004');
    expect(slice).not.toBeNull();
    expect(slice!.corridor.id).toBe(slice!.context.corridorId);
    expect(slice!.segments.every((s) => s.corridorId === slice!.corridor.id || s.id === slice!.context.activeSegmentId)).toBe(
      true,
    );
  });

  it('resolve CARGO-006, CARGO-007 e CARGO-009 com contexto e checkpoints sintéticos', () => {
    for (const cargoId of ['CARGO-006', 'CARGO-007', 'CARGO-009'] as const) {
      const context = resolveCargoOperationalWaterwayContext(cargoId);
      expect(context, cargoId).not.toBeNull();
      expect(context!.corridorId).toBeTruthy();
      expect(context!.activeSegmentId).toBeTruthy();
      expect(Array.isArray(context!.activeAlertIds)).toBe(true);
      expect(context!.currentPosition.coordinates).toHaveLength(2);

      const slice = resolveOperationalDatasetForCargo(cargoId);
      expect(slice, cargoId).not.toBeNull();
      expect(slice!.checkpoints.length).toBeGreaterThan(0);
      expect(slice!.segments.length).toBeGreaterThan(0);
      expect(slice!.terminals.length).toBeGreaterThan(0);
    }
  });

  it('retorna null para cargo desconhecido sem lançar erro', () => {
    expect(() => resolveCargoOperationalWaterwayContext('CARGO-999')).not.toThrow();
    expect(resolveCargoOperationalWaterwayContext('CARGO-999')).toBeNull();
    expect(resolveOperationalDatasetForCargo('CARGO-INVALID')).toBeNull();
  });

  it('getOperationalLayerModeSummary retorna headline para cada modo', () => {
    const slice = resolveOperationalDatasetForCargo('CARGO-004');
    for (const mode of modeIds) {
      const summary = getOperationalLayerModeSummary(mode, slice);
      expect(summary.headline.length).toBeGreaterThan(0);
      expect(summary.businessGoal.length).toBeGreaterThan(0);
    }
  });
});
