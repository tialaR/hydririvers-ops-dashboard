'use client';

import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { OwnedCargoDetailScreen } from '@/features/cargo/owned/screens/owned-cargo-detail-screen';
import { MapPreviewCard } from '@/features/cargo/owned/components/owned-cargo-route-preview/owned-cargo-route-preview';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';

type OwnedCargoDetailRouteClientProps = {
  cargo: OwnedCargo;
};

export function OwnedCargoDetailRouteClient({ cargo }: OwnedCargoDetailRouteClientProps) {
  const mapPreview = (
    <MapPreviewCard
      cargoId={cargo.id}
      corridorId={cargo.corridorId}
      origin={cargo.origin}
      destination={cargo.destination}
    />
  );

  return (
    <MobileAppShell title={cargo.code} backHref="/minhas-cargas">
      <OwnedCargoDetailScreen cargo={cargo} mapPreview={mapPreview} />
    </MobileAppShell>
  );
}
