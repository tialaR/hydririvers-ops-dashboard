import { describe, expect, it } from 'vitest';

import { HYDROWAY_OPERATIONAL_LAYER_MODES } from '@/features/waterway-map/constants/hydroway-operational-layer-modes';
import {
  HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER,
  isHydrowayOperationalLayerMode,
} from '@/features/waterway-map/constants/hydroway-operational-layer-order';
import { resolveOperationalDatasetForCargo } from '@/features/waterway-map/data/resolve-cargo-operational-waterway-context';
import { HYDRI_MAPLIBRE_TEXT_FONT } from '@/features/waterway-map/utils/hydro-maplibre-glyphs';
import {
  buildOperationalGeoJsonFromSlice,
  buildOperationalModePaintSnapshot,
  getOperationalModePaintConfig,
  getHydrowayOperationalLayerDefinitions,
  HYDRI_OP_ICON_LAYER_IDS,
  HYDRI_OP_ICON_SYMBOL_LAYER_IDS,
  HYDRI_OP_LAYER_IDS,
  ICON_SYMBOLS_BY_MODE,
  OPERATIONAL_LINE_DASHARRAY_SOLID,
  OPERATIONAL_MODE_DOMINANT_COLORS,
  resolveOperationalLineDasharrayPaint,
} from '@/features/waterway-map/utils/hydro-maplibre-operational-overlay';
import {
  toAlertsFeatureCollection,
  mergeAttentionIconPoints,
} from '@/features/waterway-map/utils/hydroway-operational-geojson';

describe('hydro-maplibre operational overlay', () => {
  it('define paint config for all operational modes', () => {
    for (const mode of HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER) {
      const paint = getOperationalModePaintConfig(mode);
      expect(paint.corridorsCore).toBeGreaterThanOrEqual(0);
      expect(paint.alertsPoint).toBeGreaterThanOrEqual(0);
      expect(isHydrowayOperationalLayerMode(mode)).toBe(true);
    }
  });

  it('each mode config exposes visible and muted feature kinds', () => {
    for (const mode of HYDROWAY_OPERATIONAL_LAYER_MODES) {
      expect(mode.visibleFeatureKinds.length).toBeGreaterThan(0);
      expect(Array.isArray(mode.mutedFeatureKinds)).toBe(true);
    }
  });

  it('registers expected MapLibre layer ids', () => {
    const layerIds = getHydrowayOperationalLayerDefinitions().map((layer) => layer.id);
    expect(layerIds).toContain(HYDRI_OP_LAYER_IDS.corridorsCore);
    expect(layerIds).toContain(HYDRI_OP_LAYER_IDS.segmentsRestricted);
    expect(layerIds).toContain(HYDRI_OP_LAYER_IDS.alertsCriticalRing);
    expect(layerIds).toContain(HYDRI_OP_LAYER_IDS.planningAreasFill);
    expect(layerIds).toContain(HYDRI_OP_LAYER_IDS.checkpointsPoint);
    expect(layerIds).toContain(HYDRI_OP_ICON_SYMBOL_LAYER_IDS.alertsCriticalIcon);
    expect(layerIds).toContain(HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIconBadge);
    expect(layerIds).toContain(HYDRI_OP_ICON_SYMBOL_LAYER_IDS.draftRestrictionIcon);
    expect(layerIds).toContain(HYDRI_OP_ICON_SYMBOL_LAYER_IDS.governmentIcon);
  });

  it('CARGO-001 resolves planning areas for government mode', () => {
    const slice = resolveOperationalDatasetForCargo('CARGO-001');
    expect(slice).not.toBeNull();
    expect(slice!.planningAreas.length).toBeGreaterThan(0);
  });

  it('all public list cargos resolve datasets with features for core sources', () => {
    for (const cargoId of ['CARGO-001', 'CARGO-002', 'CARGO-003', 'CARGO-004'] as const) {
      const slice = resolveOperationalDatasetForCargo(cargoId);
      expect(slice).not.toBeNull();
      const geo = buildOperationalGeoJsonFromSlice(slice);
      expect(geo.corridors.features.length).toBeGreaterThan(0);
      expect(geo.segments.features.length).toBeGreaterThan(0);
      expect(geo.terminals.features.length).toBeGreaterThan(0);
      expect(geo.alerts.features.length).toBeGreaterThan(0);
      expect(geo.checkpoints.features.length).toBeGreaterThan(0);
    }
  });

  it('navigation mode emphasizes segments and hides corridors', () => {
    const navigation = getOperationalModePaintConfig('navigation');
    const operation = getOperationalModePaintConfig('operation');
    expect(navigation.segmentsAttention).toBeGreaterThan(0.8);
    expect(operation.segmentsAttention).toBe(0);
    expect(navigation.corridorsCore).toBe(0);
    expect(operation.corridorsCore).toBeGreaterThan(0.7);
  });

  it('risk mode emphasizes alerts over terminals', () => {
    const risk = getOperationalModePaintConfig('risk');
    const logistics = getOperationalModePaintConfig('logistics');
    expect(risk.alertsPoint).toBeGreaterThan(logistics.alertsPoint);
    expect(risk.terminalsPoint).toBeLessThan(logistics.terminalsPoint);
  });

  it('government mode hides navigability segments', () => {
    const government = getOperationalModePaintConfig('government');
    expect(government.segmentsNormal).toBe(0);
    expect(government.segmentsAttention).toBe(0);
    expect(government.segmentsRestricted).toBe(0);
    expect(government.planningAreasFill).toBeGreaterThanOrEqual(0.12);
    expect(government.corridorsCore).toBeGreaterThanOrEqual(0.7);
  });

  it('buildOperationalModePaintSnapshot exposes corridor and alert paint', () => {
    const snapshot = buildOperationalModePaintSnapshot('navigation');
    expect(snapshot.corridors).toBeTruthy();
    expect(snapshot.segmentsAttention).toBeTruthy();
    expect(snapshot.alerts).toBeTruthy();
    expect(snapshot.dominantColors).toEqual(OPERATIONAL_MODE_DOMINANT_COLORS.navigation);
  });

  it('each mode uses exclusive dominant colors', () => {
    expect(OPERATIONAL_MODE_DOMINANT_COLORS.operation.corridorColor).toBe('#00E6D0');
    expect(OPERATIONAL_MODE_DOMINANT_COLORS.navigation.normalColor).toBe('#22C55E');
    expect(OPERATIONAL_MODE_DOMINANT_COLORS.logistics.terminalColor).toBe('#8B5CF6');
    expect(OPERATIONAL_MODE_DOMINANT_COLORS.risk.criticalColor).toBe('#FF2D55');
    expect(OPERATIONAL_MODE_DOMINANT_COLORS.government.corridorColor).toBe('#2563EB');

    const operationSnapshot = buildOperationalModePaintSnapshot('operation');
    const navigationSnapshot = buildOperationalModePaintSnapshot('navigation');
    const logisticsSnapshot = buildOperationalModePaintSnapshot('logistics');
    const riskSnapshot = buildOperationalModePaintSnapshot('risk');
    const governmentSnapshot = buildOperationalModePaintSnapshot('government');

    expect(operationSnapshot.corridors).toMatchObject({ color: '#00E6D0' });
    expect(navigationSnapshot.segmentsNormal).toMatchObject({ color: '#22C55E' });
    expect(logisticsSnapshot.terminals).toMatchObject({ color: '#8B5CF6' });
    expect(riskSnapshot.alerts).toMatchObject({ color: '#FF2D55' });
    expect(governmentSnapshot.corridors).toMatchObject({ color: '#2563EB' });
  });

  it('GeoJSON helpers attach iconSymbol and iconColor to attention points', () => {
    const slice = resolveOperationalDatasetForCargo('CARGO-001');
    expect(slice).not.toBeNull();
    const alerts = toAlertsFeatureCollection(slice!.alerts);
    expect(alerts.features[0]?.properties?.iconSymbol).toBeTruthy();
    expect(alerts.features[0]?.properties?.iconColor).toMatch(/^#/);
    const segmentIcons = mergeAttentionIconPoints(
      slice!.segments,
      slice!.planningAreas,
      slice!.alerts,
      slice!.checkpoints,
    );
    expect(segmentIcons.features.length).toBeGreaterThan(0);
    expect(segmentIcons.features.some((f) => f.properties?.iconKind === 'draft-restriction')).toBe(
      true,
    );
    expect(alerts.features.every((f) => typeof f.properties?.iconSymbol === 'string')).toBe(true);
  });

  it('ICON_SYMBOLS_BY_MODE lists expected ASCII symbols per mode', () => {
    expect(ICON_SYMBOLS_BY_MODE.risk).toContain('!');
    expect(ICON_SYMBOLS_BY_MODE.navigation).toContain('D');
    expect(ICON_SYMBOLS_BY_MODE.logistics).toContain('Q');
    expect(ICON_SYMBOLS_BY_MODE.government).toContain('G');
  });

  it('resolveOperationalLineDasharrayPaint never returns undefined for visible dredging without dash', () => {
    const solid = resolveOperationalLineDasharrayPaint(HYDRI_OP_LAYER_IDS.segmentsDredging, {
      visibility: 'visible',
      opacity: 0.5,
    });
    expect(solid).toEqual(OPERATIONAL_LINE_DASHARRAY_SOLID);
    expect(solid).not.toBeUndefined();
  });

  it('resolveOperationalLineDasharrayPaint preserves explicit dash arrays', () => {
    const dashed = resolveOperationalLineDasharrayPaint(HYDRI_OP_LAYER_IDS.segmentsDredging, {
      visibility: 'visible',
      opacity: 0.9,
      lineDasharray: [2.5, 1.4],
    });
    expect(dashed).toEqual([2.5, 1.4]);
  });

  it('resolveOperationalLineDasharrayPaint skips dash for non-dredging line layers', () => {
    const dash = resolveOperationalLineDasharrayPaint(HYDRI_OP_LAYER_IDS.segmentsNormal, {
      visibility: 'visible',
      opacity: 0.9,
    });
    expect(dash).toBeUndefined();
  });

  it('all operational mode visuals avoid nullish numeric paint when syncing dredging dash', () => {
    for (const mode of HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER) {
      const dredgingDash = resolveOperationalLineDasharrayPaint(
        HYDRI_OP_LAYER_IDS.segmentsDredging,
        {
          visibility: 'visible',
          opacity: getOperationalModePaintConfig(mode).segmentsDredging,
          lineDasharray: mode === 'navigation' || mode === 'risk' ? [2.5, 1.4] : undefined,
        },
      );
      if (mode === 'navigation' || mode === 'risk') {
        expect(dredgingDash).toEqual([2.5, 1.4]);
      } else if (
        getOperationalModePaintConfig(mode).segmentsDredging > 0.02
      ) {
        expect(dredgingDash).toEqual(OPERATIONAL_LINE_DASHARRAY_SOLID);
      }
    }
  });

  it('symbol layers with text-field use OpenFreeMap-compatible text-font', () => {
    const textLayers = getHydrowayOperationalLayerDefinitions().filter(
      (layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout,
    );
    expect(textLayers.length).toBeGreaterThan(0);
    for (const layer of textLayers) {
      expect(layer.layout && 'text-font' in layer.layout && layer.layout['text-font']).toEqual(
        HYDRI_MAPLIBRE_TEXT_FONT,
      );
    }
  });
});
