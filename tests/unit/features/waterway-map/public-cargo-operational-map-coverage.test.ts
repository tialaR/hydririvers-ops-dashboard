import { describe, expect, it } from 'vitest';

import { VISIBLE_CARGO_LIST_IDS } from '@/features/cargo/constants/public-marketplace-cargos';
import { getCargoById } from '@/features/cargo/services/cargo.service';
import { findPublicMarketplaceCargo } from '@/features/cargo/data/resolve-public-marketplace-cargo-list';
import {
  resolveCargoHydrowayMapModel,
  validateHydrowayMapModel,
} from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import {
  resolveCargoOperationalWaterwayContext,
  resolveOperationalDatasetForCargo,
} from '@/features/waterway-map/data/resolve-cargo-operational-waterway-context';
import { HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER } from '@/features/waterway-map/constants/hydroway-operational-layer-order';
import {
  buildOperationalGeoJsonFromSlice,
  getOperationalModePaintConfig,
  HYDRI_OP_LAYER_IDS,
  resolveOperationalLineDasharrayPaint,
} from '@/features/waterway-map/utils/hydro-maplibre-operational-overlay';

const PUBLIC_LIST_CARGO_IDS = VISIBLE_CARGO_LIST_IDS;

function collectNumericGeoJsonValues(
  value: unknown,
  path = '',
  hits: Array<{ path: string; value: unknown }> = [],
): Array<{ path: string; value: unknown }> {
  if (value === null || value === undefined) {
    if (path) hits.push({ path, value });
    return hits;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectNumericGeoJsonValues(entry, `${path}[${index}]`, hits);
    });
    return hits;
  }
  if (typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = path ? `${path}.${key}` : key;
      if (entry === null || entry === undefined) {
        hits.push({ path: nextPath, value: entry });
        continue;
      }
      collectNumericGeoJsonValues(entry, nextPath, hits);
    }
  }
  return hits;
}

describe('public cargo list — map and operational coverage', () => {
  it('every visible public cargo resolves a valid Hydroway map model', async () => {
    for (const cargoId of PUBLIC_LIST_CARGO_IDS) {
      const cargo =
        (await getCargoById(cargoId)) ?? findPublicMarketplaceCargo(cargoId);
      expect(cargo, cargoId).toBeDefined();

      const model = resolveCargoHydrowayMapModel(cargo!);
      expect(model, cargoId).not.toBeNull();
      expect(model!.cargoId).toBe(cargoId);
      expect(model!.geo.routeTrack.features.length).toBeGreaterThan(0);
      expect(model!.geo.vessel.features.length).toBeGreaterThan(0);
      expect(typeof model!.progress01).toBe('number');
      expect(validateHydrowayMapModel(model!)).toBe(true);
    }
  });

  it('every visible public cargo resolves operational context and dataset slice', () => {
    for (const cargoId of PUBLIC_LIST_CARGO_IDS) {
      const context = resolveCargoOperationalWaterwayContext(cargoId);
      expect(context, cargoId).not.toBeNull();
      expect(context!.corridorId).toBeTruthy();
      expect(context!.activeSegmentId).toBeTruthy();
      expect(context!.originTerminalId).toBeTruthy();
      expect(context!.destinationTerminalId).toBeTruthy();
      expect(context!.currentPosition.coordinates).toHaveLength(2);
      expect(context!.eta.length).toBeGreaterThan(0);
      expect(context!.progress01).toBeGreaterThanOrEqual(0);
      expect(context!.progress01).toBeLessThanOrEqual(1);
      expect(Array.isArray(context!.activeAlertIds)).toBe(true);

      const slice = resolveOperationalDatasetForCargo(cargoId);
      expect(slice, cargoId).not.toBeNull();
      expect(slice!.corridor).toBeTruthy();
      expect(slice!.segments.length).toBeGreaterThan(0);
      expect(slice!.terminals.length).toBeGreaterThan(0);
      expect(slice!.checkpoints.length).toBeGreaterThan(0);
      expect(Array.isArray(slice!.alerts)).toBe(true);
      expect(Array.isArray(slice!.signals)).toBe(true);
      expect(Array.isArray(slice!.planningAreas)).toBe(true);
    }
  });

  it('operational GeoJSON for public cargos has no nullish feature properties', () => {
    for (const cargoId of PUBLIC_LIST_CARGO_IDS) {
      const slice = resolveOperationalDatasetForCargo(cargoId);
      const geo = buildOperationalGeoJsonFromSlice(slice);
      for (const collection of Object.values(geo)) {
        for (const feature of collection.features) {
          const nullish = collectNumericGeoJsonValues(feature.properties ?? {});
          expect(nullish, `${cargoId} ${JSON.stringify(nullish)}`).toEqual([]);
        }
      }
    }
  });

  it('mode paint sync for dredging never resolves undefined dash when layer is visible', () => {
    for (const cargoId of PUBLIC_LIST_CARGO_IDS) {
      for (const mode of HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER) {
        const opacity = getOperationalModePaintConfig(mode).segmentsDredging;
        if (opacity <= 0.02) continue;

        const dash = resolveOperationalLineDasharrayPaint(HYDRI_OP_LAYER_IDS.segmentsDredging, {
          visibility: 'visible',
          opacity,
          lineDasharray:
            mode === 'navigation' || mode === 'risk' ? [2.5, 1.4] : undefined,
        });

        expect(dash, `${cargoId}:${mode}`).toBeDefined();
        expect(dash!.every((value) => typeof value === 'number' && Number.isFinite(value))).toBe(
          true,
        );
      }
    }
  });
});
