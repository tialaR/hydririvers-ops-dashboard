'use client';

import type { OwnedCargoDesktopViewModel } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';
import type { StatusBadgeStatus } from '@/shared/components/status-badge';

type OwnedCargoShipmentCardProps = {
  viewModel: OwnedCargoDesktopViewModel;
  selected: boolean;
  onSelect: () => void;
};

function mapOwnedCargoStatusTone(status: OwnedCargoDesktopViewModel['cargo']['status']): StatusBadgeStatus {
  if (status === 'attention') return 'delayed';
  if (status === 'inTransit') return 'inTransit';
  if (status === 'delivered') return 'completed';
  if (status === 'blocked') return 'blocked';
  return 'open';
}

function normalizeStateLabel(value: string, fallbackCode: string): string {
  const normalized = value.replace(/,+\s*$/, '').trim();
  if (normalized) return normalized;
  return fallbackCode || 'Estado';
}

export function OwnedCargoShipmentCard({ viewModel, selected, onSelect }: OwnedCargoShipmentCardProps) {
  const { cargo } = viewModel;

  return (
    <ShipmentCard
      code={viewModel.codeLabel}
      statusLabel={viewModel.statusLabel}
      statusTone={mapOwnedCargoStatusTone(cargo.status)}
      origin={{
        stateCode: viewModel.originStateCode,
        stateLabel: normalizeStateLabel(viewModel.originRegion, viewModel.originStateCode),
        city: viewModel.originCity,
      }}
      destination={{
        stateCode: viewModel.destinationStateCode,
        stateLabel: normalizeStateLabel(viewModel.destinationRegion, viewModel.destinationStateCode),
        city: viewModel.destinationCity,
      }}
      cargoLabel="Carga"
      cargoValue={viewModel.cargoType}
      etaValue={viewModel.cardEta}
      etaSuffix={viewModel.cardEtaDay}
      selected={selected}
      onSelect={onSelect}
      testId="page61-shipment-card"
    />
  );
}
