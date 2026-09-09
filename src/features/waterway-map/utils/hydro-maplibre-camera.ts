import type { PaddingOptions } from 'maplibre-gl';

import type { HydrowayDemoCargoId } from '../domain/hydroway-entities.types';

export type HydroMapLibreFitOptions = {
  padding: PaddingOptions;
  maxZoom: number;
  pitch: number;
  bearing: number;
};

const DEFAULT_FIT: HydroMapLibreFitOptions = {
  padding: { top: 132, bottom: 88, left: 292, right: 104 },
  maxZoom: 9.5,
  pitch: 26,
  bearing: -10,
};

/** Enquadramento por carga demo — reduz espaço morto e evita rota espremida. */
const CARGO_FIT_OVERRIDES: Partial<Record<HydrowayDemoCargoId, Partial<HydroMapLibreFitOptions>>> = {
  'CARGO-001': {
    padding: { top: 116, bottom: 72, left: 276, right: 80 },
    maxZoom: 9.4,
    bearing: -8,
    pitch: 26,
  },
  'CARGO-002': {
    padding: { top: 112, bottom: 68, left: 272, right: 88 },
    maxZoom: 9.2,
    bearing: -14,
    pitch: 30,
  },
  'CARGO-004': {
    padding: { top: 108, bottom: 64, left: 264, right: 76 },
    maxZoom: 9.8,
    pitch: 24,
    bearing: -6,
  },
  'CARGO-009': {
    padding: { top: 104, bottom: 60, left: 258, right: 72 },
    maxZoom: 9.6,
    pitch: 22,
    bearing: -4,
  },
};

export function resolveHydroMapLibreFitOptions(cargoId: string): HydroMapLibreFitOptions {
  const override = CARGO_FIT_OVERRIDES[cargoId as HydrowayDemoCargoId];
  if (!override) return DEFAULT_FIT;

  return {
    padding: { ...DEFAULT_FIT.padding, ...override.padding },
    maxZoom: override.maxZoom ?? DEFAULT_FIT.maxZoom,
    pitch: override.pitch ?? DEFAULT_FIT.pitch,
    bearing: override.bearing ?? DEFAULT_FIT.bearing,
  };
}
