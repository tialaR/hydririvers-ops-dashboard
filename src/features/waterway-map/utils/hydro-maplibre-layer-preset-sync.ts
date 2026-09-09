import type { Map } from 'maplibre-gl';

import {
  type HydrowayMapLayerPresetConfig,
  type HydrowayMapLayerPresetId,
  type MapPaintAdjustment,
  resolveHydrowayMapLayerPreset,
} from '../constants/hydroway-map-layer-presets';
import {
  HYDROWAY_CONTEXT_LAYER_IDS,
  isMapLibreOverlayMapUsable,
  layerExistsOnMap,
  setLayoutIfLayerExists,
  setPaintIfLayerExists,
  syncRouteFlowPaint,
} from './hydro-maplibre-overlay';
import type { RouteFlowPalette } from './hydro-maplibre-route-style';

const OPENFREEMAP_TILE_HOST = 'tiles.openfreemap.org';

export function isNonFatalOpenFreeMapTileError(error: unknown): boolean {
  if (error === null || error === undefined) return false;

  const message =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : String(error);

  return message.includes(OPENFREEMAP_TILE_HOST);
}

function applyPaintAdjustments(
  map: Map,
  adjustments: readonly MapPaintAdjustment[],
): number {
  let applied = 0;

  for (const adjustment of adjustments) {
    if (setPaintIfLayerExists(map, adjustment.layerId, adjustment.property, adjustment.value)) {
      applied += 1;
    }
  }

  return applied;
}

export type SyncHydrowayLayerPresetContext = {
  progress01: number;
  hydrographyEmphasis?: boolean;
  flowPhase01?: number;
  elapsedMs?: number;
  reducedMotion?: boolean;
};

export function syncHydrowayMapLayerPresetPaint(
  map: Map | null | undefined,
  presetId: HydrowayMapLayerPresetId,
  context: SyncHydrowayLayerPresetContext,
): { appliedCount: number; preset: HydrowayMapLayerPresetConfig } {
  const preset = resolveHydrowayMapLayerPreset(presetId);

  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) {
    return { appliedCount: 0, preset };
  }

  let appliedCount = 0;
  appliedCount += applyPaintAdjustments(map, preset.basemapPaint);
  appliedCount += applyPaintAdjustments(map, preset.waterwayPaint);
  appliedCount += applyPaintAdjustments(map, preset.routePaint);
  if (preset.contextPaint?.length) {
    appliedCount += applyPaintAdjustments(map, preset.contextPaint);
  }

  syncRouteFlowPaint(map, context.progress01, {
    hydrographyEmphasis: context.hydrographyEmphasis,
  });

  const contextResult = syncHydrowayContextLayers(map, presetId);
  appliedCount += contextResult.appliedCount;

  return { appliedCount, preset };
}

function visibilityForOpacity(opacity: number): 'visible' | 'none' {
  return opacity > 0.02 ? 'visible' : 'none';
}

export function syncHydrowayContextLayers(
  map: Map | null | undefined,
  presetId: HydrowayMapLayerPresetId,
): { appliedCount: number } {
  const preset = resolveHydrowayMapLayerPreset(presetId);
  const visibility = preset.contextLayers;

  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) {
    return { appliedCount: 0 };
  }

  let appliedCount = 0;

  const applyOpacity = (layerId: string, property: string, opacity: number): void => {
    if (!layerExistsOnMap(map, layerId)) return;

    const layoutVisibility = visibilityForOpacity(opacity);
    setLayoutIfLayerExists(map, layerId, 'visibility', layoutVisibility);

    if (layoutVisibility === 'visible') {
      if (setPaintIfLayerExists(map, layerId, property, opacity)) {
        appliedCount += 1;
      }
      return;
    }

    appliedCount += 1;
  };

  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.corridorsShadow,
    'line-opacity',
    visibility.corridors * 0.45,
  );
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore, 'line-opacity', visibility.corridors);
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
    'line-opacity',
    visibility.corridorsHighlight,
  );
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.terminalsHalo, 'circle-opacity', visibility.terminals * 0.55);
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint, 'circle-opacity', visibility.terminals);
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
    'circle-opacity',
    visibility.infrastructure,
  );
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint, 'circle-opacity', visibility.signals);
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.basinsFill, 'fill-opacity', visibility.basins);
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.basinsOutline,
    'line-opacity',
    visibility.basinsOutline,
  );
  applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill, 'fill-opacity', visibility.alerts);
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.alertZonesOutline,
    'line-opacity',
    visibility.alertsOutline,
  );
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    'circle-opacity',
    visibility.corridors * 0.72,
  );
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint,
    'circle-opacity',
    Math.max(visibility.basins, visibility.basinsOutline) * 0.85,
  );
  applyOpacity(
    HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint,
    'circle-opacity',
    Math.max(visibility.alerts, visibility.alertsOutline) * 0.9,
  );

  if (presetId === 'dark') {
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.corridorsShadow, 'line-opacity', 0.54);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore, 'line-opacity', 0.42);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight, 'line-opacity', 0.12);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint, 'circle-opacity', 0.62);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.terminalsHalo, 'circle-opacity', 0.1);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint, 'circle-opacity', 0.7);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint, 'circle-opacity', 0.66);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint, 'circle-opacity', 0.58);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.basinsFill, 'fill-opacity', 0.03);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.basinsOutline, 'line-opacity', 0.08);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint, 'circle-opacity', 0.48);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill, 'fill-opacity', 0.06);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.alertZonesOutline, 'line-opacity', 0.18);
    applyOpacity(HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint, 'circle-opacity', 0.55);
  }

  const labelVisibility = visibility.showInfrastructureLabels ? 'visible' : 'none';
  if (layerExistsOnMap(map, HYDROWAY_CONTEXT_LAYER_IDS.infrastructureLabel)) {
    setLayoutIfLayerExists(
      map,
      HYDROWAY_CONTEXT_LAYER_IDS.infrastructureLabel,
      'visibility',
      labelVisibility,
    );
    appliedCount += 1;
  }

  return { appliedCount };
}

export function resolveRouteFlowPaletteForPreset(
  presetId: HydrowayMapLayerPresetId,
): RouteFlowPalette {
  return resolveHydrowayMapLayerPreset(presetId).routeFlowPalette;
}
