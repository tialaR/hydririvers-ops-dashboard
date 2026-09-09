import { describe, expect, it } from 'vitest';

import {
  isMapEligibleCargoId,
  VISIBLE_CARGO_LIST_IDS,
} from '@/features/cargo/constants/public-marketplace-cargos';
import {
  buildVisualCargoId,
  findVisualCargoById,
} from '@/features/cargo/data/build-visual-cargo-pool';
import { getCargoById } from '@/features/cargo/services/cargo.service';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';
import {
  resolveCargoHydrowayMapModel,
  validateHydrowayMapModel,
} from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { resolveCargoOperationalWaterwayContext } from '@/features/waterway-map/data/resolve-cargo-operational-waterway-context';
import { findHydrowayCargoRouteFeature } from '@/features/waterway-map/data/load-mock-geojson.server';
import { getCargoWaterwayTracking } from '@/features/waterway-tracking/waterway-compat';

describe('HYD-2026 cargo id contract', () => {
  it('normaliza hyd-2026-00020 para HYD-2026-00020', () => {
    expect(normalizeCargoId('hyd-2026-00020')).toBe('HYD-2026-00020');
    expect(normalizeCargoId('HYD-2026-00020')).toBe('HYD-2026-00020');
  });

  it('resolve getCargoById a partir do route param em lowercase', async () => {
    const cargo = await getCargoById('hyd-2026-00020');
    expect(cargo).toBeDefined();
    expect(cargo!.id).toBe('HYD-2026-00020');
    expect(cargo!.origin).toContain('Abaetetuba');
    expect(cargo!.destination).toContain('Vila do Conde');
    expect(cargo!.status).toBe('bidding');
  });

  it('HYD-2026-00020 possui rota demo, tracking 25% e modelo de mapa válido', async () => {
    const cargo = await getCargoById('HYD-2026-00020');
    expect(cargo).toBeDefined();

    const route = findHydrowayCargoRouteFeature('hyd-2026-00020');
    expect(route?.geometry.type).toBe('LineString');
    expect((route?.geometry.coordinates.length ?? 0)).toBeGreaterThanOrEqual(24);

    const tracking = getCargoWaterwayTracking('HYD-2026-00020');
    expect(tracking?.progressPercent).toBe(25);
    expect(tracking?.eta).toContain('30');

    const model = resolveCargoHydrowayMapModel(cargo!);
    expect(model).not.toBeNull();
    expect(model!.cargoId).toBe('HYD-2026-00020');
    expect(model!.progress01).toBe(0.25);
    expect(validateHydrowayMapModel(model!)).toBe(true);

    const routeCoords =
      model!.geo.routeTrack.features[0]?.geometry.type === 'LineString'
        ? model!.geo.routeTrack.features[0].geometry.coordinates
        : [];
    expect(routeCoords.length).toBeGreaterThanOrEqual(2);
  });

  it('HYD-2026-00020 possui contexto operacional com alertas explícitos vazios', () => {
    const context = resolveCargoOperationalWaterwayContext('HYD-2026-00020');
    expect(context).not.toBeNull();
    expect(context!.progress01).toBe(0.25);
    expect(context!.activeAlertIds).toEqual([]);
    expect(context!.eta).toContain('30');
  });

  it('pool visual inclui HYD-2026-00020 e é elegível para mapa', () => {
    expect(VISIBLE_CARGO_LIST_IDS).toContain('HYD-2026-00020');
    expect(isMapEligibleCargoId('hyd-2026-00020')).toBe(true);
    expect(findVisualCargoById('hyd-2026-00020')?.id).toBe('HYD-2026-00020');
    expect(buildVisualCargoId(20)).toBe('HYD-2026-00020');
  });
});

describe('visible cargo list — map coverage', () => {
  it('nenhum item visível depende exclusivamente de prefixo CARGO-*', () => {
    const nonLegacy = VISIBLE_CARGO_LIST_IDS.filter((id) => !/^CARGO-\d+$/i.test(id));
    expect(nonLegacy.length).toBeGreaterThan(0);
    expect(nonLegacy).toContain('HYD-2026-00020');
  });

  it('cada id visível abre mapa com modelo válido', async () => {
    for (const cargoId of VISIBLE_CARGO_LIST_IDS) {
      const cargo = await getCargoById(cargoId);
      expect(cargo, cargoId).toBeDefined();

      const model = resolveCargoHydrowayMapModel(cargo!);
      expect(model, cargoId).not.toBeNull();
      expect(validateHydrowayMapModel(model!), cargoId).toBe(true);
      expect(typeof model!.progress01).toBe('number');
      expect(Number.isFinite(model!.progress01)).toBe(true);

      const context = resolveCargoOperationalWaterwayContext(cargoId);
      expect(context, cargoId).not.toBeNull();
      expect(Array.isArray(context!.activeAlertIds)).toBe(true);
    }
  });
});
