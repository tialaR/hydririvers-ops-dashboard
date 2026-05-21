import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';

import { adaptCargoToHydrowayMapModel } from '../adapters/cargo-to-hydroway-geo.adapter';
import {
  HYDROWAY_DEMO_CARGO_IDS,
  isHydrowayDemoCargoId,
  type HydrowayDemoCargoId,
} from '../domain/hydroway-entities.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';

export const SPIKE_DEFAULT_CARGO_ID: HydrowayDemoCargoId = 'CARGO-001';

const SPIKE_CARGO_004: Cargo = {
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
};

function spikeCargoById(cargoId: HydrowayDemoCargoId): Cargo {
  const found = publicCargosMock.find((entry) => entry.id === cargoId);
  if (found) return found;
  if (cargoId === 'CARGO-004') return SPIKE_CARGO_004;
  throw new Error(`missing spike cargo fixture: ${cargoId}`);
}

/** Normaliza query `cargoId` para uma das cargas demo do spike (default CARGO-001). */
export function normalizeSpikeCargoId(value: string | null | undefined): HydrowayDemoCargoId {
  const normalized = value?.trim().toUpperCase() ?? '';
  if (isHydrowayDemoCargoId(normalized)) {
    return normalized;
  }
  return SPIKE_DEFAULT_CARGO_ID;
}

/** Resolve HydrowayMapModel para a rota dev (V2.2c). */
export function resolveSpikeHydrowayMapModel(cargoIdParam?: string | null): HydrowayMapModel {
  const cargoId = normalizeSpikeCargoId(cargoIdParam);
  const cargo = spikeCargoById(cargoId);
  const tracking = cargoWaterwayTrackingByCargoId.get(cargoId);

  return adaptCargoToHydrowayMapModel({ cargo, tracking });
}

export { HYDROWAY_DEMO_CARGO_IDS };
