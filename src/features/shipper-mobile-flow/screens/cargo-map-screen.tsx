'use client';

import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { OperationMapScreen } from '@/features/shipper-mobile-flow/components/operation-map-screen/operation-map-screen';
import type { ShipperOwnedCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

type CargoMapScreenProps = {
  cargo: ShipperOwnedCargo;
};

export function CargoMapScreen({ cargo }: CargoMapScreenProps) {
  return (
    <MobileAppShell title={cargo.code} backHref={`/minhas-cargas/${cargo.id}`} forceHideBottomNav fullBleedContent>
      <OperationMapScreen cargo={cargo} />
    </MobileAppShell>
  );
}
