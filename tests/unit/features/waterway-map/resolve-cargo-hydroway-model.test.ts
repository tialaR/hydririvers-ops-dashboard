import { describe, expect, it } from 'vitest';

import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import {
  isValidLngLat,
  resolveCargoHydrowayMapModel,
  sanitizeHydrowayMapModel,
  validateHydrowayMapModel,
} from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { adaptCargoToHydrowayMapModel } from '@/features/waterway-map/adapters/cargo-to-hydroway-geo.adapter';

describe('resolveCargoHydrowayMapModel', () => {
  it('resolve CARGO-001 com geometria de rota demo válida', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    expect(cargo).toBeDefined();

    const model = resolveCargoHydrowayMapModel(cargo!);

    expect(model).not.toBeNull();
    expect(model!.cargoId).toBe('CARGO-001');
    expect(model!.geo.routeTrack.features).toHaveLength(1);
    expect(model!.geo.vessel.features).toHaveLength(1);
    expect(validateHydrowayMapModel(model!)).toBe(true);
  });

  it('resolve CARGO-004 com corredor tocantins-araguaia', () => {
    const model = resolveCargoHydrowayMapModel({
      id: 'CARGO-004',
      title: 'Grãos — corredor Tocantins (mock)',
      origin: 'Marabá, PA',
      destination: 'Vila do Conde, PA',
      volume: '40 t',
      window: '10-14 maio',
      cargoType: 'Seca',
      status: 'contracting',
      co2Saving: '-40% CO₂',
      targetPrice: 'R$ 12.000',
    });

    expect(model).not.toBeNull();
    expect(model!.cargoId).toBe('CARGO-004');
    expect(model!.corridorId).toBe('tocantins-araguaia');
    expect(validateHydrowayMapModel(model!)).toBe(true);
  });

  it('garante progress01 numérico e coordenadas finitas para CARGO-001', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);

    expect(typeof model!.progress01).toBe('number');
    expect(model!.progress01).toBeGreaterThanOrEqual(0);
    expect(model!.progress01).toBeLessThanOrEqual(1);

    const route = model!.geo.routeTrack.features[0];
    expect(route?.geometry.type).toBe('LineString');
    if (route?.geometry.type === 'LineString') {
      expect(route.geometry.coordinates.length).toBeGreaterThanOrEqual(2);
      for (const coordinate of route.geometry.coordinates) {
        expect(isValidLngLat(coordinate)).toBe(true);
      }
    }
  });

  it('retorna null para cargo sem rota válida', () => {
    const invalid = adaptCargoToHydrowayMapModel({
      cargo: {
        id: 'CARGO-INVALID',
        title: 'Sem rota',
        origin: '',
        destination: '',
        volume: '1 t',
        window: '1 maio',
        cargoType: 'Seca',
        status: 'open',
        co2Saving: '-1% CO₂',
        targetPrice: 'R$ 1',
      },
    });

    invalid.geo.routeTrack = { type: 'FeatureCollection', features: [] };
    expect(sanitizeHydrowayMapModel(invalid)).toBeNull();
  });
});
