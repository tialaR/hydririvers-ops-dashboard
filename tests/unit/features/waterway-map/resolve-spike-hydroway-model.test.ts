import { describe, expect, it } from 'vitest';

import {
  normalizeSpikeCargoId,
  resolveSpikeHydrowayMapModel,
  SPIKE_DEFAULT_CARGO_ID,
} from '@/features/waterway-map/data/resolve-spike-hydroway-model';

describe('resolveSpikeHydrowayMapModel', () => {
  it('usa CARGO-001 como default', () => {
    expect(normalizeSpikeCargoId(null)).toBe(SPIKE_DEFAULT_CARGO_ID);
    expect(normalizeSpikeCargoId(undefined)).toBe('CARGO-001');
    expect(normalizeSpikeCargoId('invalid')).toBe('CARGO-001');

    const model = resolveSpikeHydrowayMapModel();
    expect(model.cargoId).toBe('CARGO-001');
    expect(model.progress01).toBe(0.15);
  });

  it('resolve cargas demo distintas via cargoId', () => {
    const model002 = resolveSpikeHydrowayMapModel('CARGO-002');
    const model004 = resolveSpikeHydrowayMapModel('cargo-004');

    expect(model002.cargoId).toBe('CARGO-002');
    expect(model002.corridorId).toBe('madeira');
    expect(model002.progress01).toBe(0.25);

    expect(model004.cargoId).toBe('CARGO-004');
    expect(model004.corridorId).toBe('tocantins-araguaia');
    expect(model004.progress01).toBe(0.4);
  });

  it('preenche camadas dinâmicas para visualização no spike', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');

    expect(model.geo.routeTrack.features).toHaveLength(1);
    expect(model.geo.routeTraveled.features).toHaveLength(1);
    expect(model.geo.origin.features).toHaveLength(1);
    expect(model.geo.destination.features).toHaveLength(1);
    expect(model.geo.vessel.features).toHaveLength(1);
    expect(model.bbox).toHaveLength(4);
  });
});
