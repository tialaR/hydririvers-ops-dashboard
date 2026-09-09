import type { HydrowayMapLayerPresetId } from '../constants/hydroway-map-layer-presets';

export type { HydrowayMapLayerPresetId };

/** Opacidade relativa (0–1) por grupo de camadas mock de contexto hidroviário. */
export type HydrowayContextLayerVisibility = {
  corridors: number;
  corridorsHighlight: number;
  terminals: number;
  infrastructure: number;
  signals: number;
  basins: number;
  basinsOutline: number;
  alerts: number;
  alertsOutline: number;
  showInfrastructureLabels: boolean;
};
