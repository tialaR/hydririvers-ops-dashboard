import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';
import { mapCargoStatusToLabV2Status } from '@/features/cargo/utils/cargo-status-semantic';

export type MapMarketplaceCargoToLabV2Options = {
  statusLabel: string;
  vesselLabel?: string;
  etaLabel?: string;
  deliveryLabel?: string;
};

function buildSubtitle(cargo: Cargo): string {
  const parts = [cargo.cargoType, cargo.producer, cargo.serviceType].filter(Boolean);
  return parts[0]?.trim() ?? cargo.description?.trim() ?? '';
}

function buildTerminal(cargo: Cargo, kind: 'origin' | 'destination'): string {
  if (kind === 'origin') {
    return cargo.originContext?.trim() || cargo.corridor?.trim() || cargo.mainRiver?.trim() || cargo.origin;
  }

  return cargo.riverRoute?.trim() || cargo.destination;
}

export function mapMarketplaceCargoToLabV2(
  cargo: Cargo,
  options: MapMarketplaceCargoToLabV2Options,
): CargoLabV2 {
  const { statusLabel, vesselLabel = '', etaLabel = '', deliveryLabel = '' } = options;

  return {
    id: cargo.id,
    title: cargo.title,
    subtitle: buildSubtitle(cargo),
    status: mapCargoStatusToLabV2Status(cargo.status),
    statusLabel,
    origin: cargo.origin,
    originTerminal: buildTerminal(cargo, 'origin'),
    destination: cargo.destination,
    destinationTerminal: buildTerminal(cargo, 'destination'),
    eta: etaLabel,
    delivery: deliveryLabel,
    volume: cargo.volume || cargo.weight || '',
    vessel: vesselLabel,
    cargoType: cargo.cargoType,
  };
}

export function getPublicCargoCardActionLabel(status: CargoStatus): 'view' | 'track' {
  if (status === 'open' || status === 'bidding') {
    return 'view';
  }

  return 'track';
}
