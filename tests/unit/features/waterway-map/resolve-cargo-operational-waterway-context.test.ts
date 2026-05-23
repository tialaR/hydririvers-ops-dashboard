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
