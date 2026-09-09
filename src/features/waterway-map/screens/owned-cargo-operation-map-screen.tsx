'use client';

import { useTranslations } from 'next-intl';

import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  OwnedCargoMapScreen,
  type OwnedCargoMapBottomSheetProps,
} from '@/features/cargo/owned/screens/owned-cargo-map-screen';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { ShipperOperationMap } from '@/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map';
import { getShipperMapRouteForCargo } from '@/features/waterway-map/domain/owned-cargo-operation-route';

const BottomSheetAdapter = (props: OwnedCargoMapBottomSheetProps) => <BottomSheet {...props} />;

type OperationMapScreenProps = {
  cargo: OwnedCargo;
};

export function OperationMapScreen({ cargo }: OperationMapScreenProps) {
  const t = useTranslations('shipperMobileFlow.map');
  const tCorridors = useTranslations('shipperMobileFlow.map.corridors');
  const routeData = getShipperMapRouteForCargo(cargo);
  const mapContent = (
    <ShipperOperationMap
      routeData={routeData}
      ariaLabel={t('routeAria', { code: cargo.code })}
      fallbackHintLabel={t('fallbackHint')}
    />
  );

  return (
    <MobileAppShell title={cargo.code} backHref={`/minhas-cargas/${cargo.id}`} forceHideBottomNav fullBleedContent>
      <OwnedCargoMapScreen
        cargo={cargo}
        corridorLabel={tCorridors(routeData.routeLabelKey)}
        mapContent={mapContent}
        BottomSheetComponent={BottomSheetAdapter}
      />
    </MobileAppShell>
  );
}
