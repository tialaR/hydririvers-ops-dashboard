'use client';

import { useTranslations } from 'next-intl';

import {
  OwnedCargoListScreen,
  type OwnedCargoBottomSheetProps,
  type OwnedCargoEmptyStateProps,
  type OwnedCargoSearchFilterProps,
} from '@/features/cargo/owned/screens/owned-cargo-list-screen';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { EmptyState } from '@/features/product-shell/components/product-state/product-state';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';

type OwnedCargoListRouteClientProps = {
  initialCargoes: OwnedCargo[];
};

const SearchFilterAdapter = (props: OwnedCargoSearchFilterProps) => <SearchFilterStack {...props} />;
const BottomSheetAdapter = (props: OwnedCargoBottomSheetProps) => <BottomSheet {...props} />;
const EmptyStateAdapter = (props: OwnedCargoEmptyStateProps) => <EmptyState {...props} />;

export function OwnedCargoListRouteClient({ initialCargoes }: OwnedCargoListRouteClientProps) {
  const t = useTranslations('shipperMobileFlow.myCargoes');

  return (
    <MobileAppShell title={t('title')}>
      <OwnedCargoListScreen
        initialCargoes={initialCargoes}
        SearchFilter={SearchFilterAdapter}
        BottomSheet={BottomSheetAdapter}
        EmptyState={EmptyStateAdapter}
      />
    </MobileAppShell>
  );
}
