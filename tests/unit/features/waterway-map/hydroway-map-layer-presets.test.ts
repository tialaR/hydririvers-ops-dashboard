import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HYDROWAY_MAP_LAYER_PRESET_ID,
  HYDROWAY_MAP_LAYER_PRESET_ORDER,
  HYDROWAY_MAP_LAYER_PRESETS,
  isHydrowayMapLayerPresetId,
} from '@/features/waterway-map/constants/hydroway-map-layer-presets';
import { isNonFatalOpenFreeMapTileError } from '@/features/waterway-map/utils/hydro-maplibre-layer-preset-sync';

describe('hydroway-map-layer-presets', () => {
  it('expõe cinco presets com chaves i18n alinhadas', () => {
    expect(HYDROWAY_MAP_LAYER_PRESET_ORDER).toHaveLength(5);
    expect(DEFAULT_HYDROWAY_MAP_LAYER_PRESET_ID).toBe('dark');

    for (const presetId of HYDROWAY_MAP_LAYER_PRESET_ORDER) {
      const preset = HYDROWAY_MAP_LAYER_PRESETS[presetId];
      expect(preset.id).toBe(presetId);
      expect(preset.labelKey).toMatch(/^layerPreset/);
      expect(preset.descriptionKey).toMatch(/Description$/);
      expect(preset.basemapPaint.length).toBeGreaterThan(0);
      expect(preset.routePaint.length).toBeGreaterThan(0);
      expect(preset.waterwayPaint.length).toBeGreaterThan(0);
      expect(preset.routeFlowPalette.base).toBeTruthy();
      expect(preset.contextLayers.corridors).toBeGreaterThanOrEqual(0);
      expect(preset.contextLayers.terminals).toBeGreaterThanOrEqual(0);
    }
  });

  it('government preset exibe mais contexto que realistic', () => {
    const government = HYDROWAY_MAP_LAYER_PRESETS.government.contextLayers;
    const realistic = HYDROWAY_MAP_LAYER_PRESETS.realistic.contextLayers;
    expect(government.basins).toBeGreaterThan(realistic.basins);
    expect(government.signals).toBeGreaterThan(realistic.signals);
    expect(government.showInfrastructureLabels).toBe(true);
  });

  it('valida ids de preset', () => {
    expect(isHydrowayMapLayerPresetId('dark')).toBe(true);
    expect(isHydrowayMapLayerPresetId('unknown')).toBe(false);
  });

  it('preset dark define pintura de contexto técnica', () => {
    const dark = HYDROWAY_MAP_LAYER_PRESETS.dark;
    expect(dark.contextPaint?.length).toBeGreaterThan(0);
    expect(dark.contextLayers.basins).toBeCloseTo(0.03, 3);
    expect(dark.routeFlowPalette.base).toBe('#4dc4b8');
  });

  it('marca erro de tile OpenFreeMap como não fatal', () => {
    expect(
      isNonFatalOpenFreeMapTileError(
        new Error('AJAXError: Failed to fetch (0): https://tiles.openfreemap.org/data/v3/0/0/0.pbf'),
      ),
    ).toBe(true);
    expect(isNonFatalOpenFreeMapTileError(new Error('maplibre-init-failed'))).toBe(false);
  });
});
