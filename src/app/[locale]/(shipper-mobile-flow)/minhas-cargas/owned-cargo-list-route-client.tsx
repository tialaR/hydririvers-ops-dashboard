'use client';

import { useTranslations } from 'next-intl';

import {
  OwnedCargoListScreen,
  type OwnedCargoBottomSheetProps,
  type OwnedCargoEmptyStateProps,
  type OwnedCargoSearchFilterProps,
} from '@/features/cargo/owned/screens/owned-cargo-list-screen';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { OwnedCargoDesktopFoundation } from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { EmptyState } from '@/features/product-shell/components/product-state/product-state';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';
import styles from './owned-cargo-list-route-client.module.sass';

type OwnedCargoListRouteClientProps = {
  initialCargoes: OwnedCargo[];
};

const SearchFilterAdapter = (props: OwnedCargoSearchFilterProps) => <SearchFilterStack {...props} />;
const BottomSheetAdapter = (props: OwnedCargoBottomSheetProps) => <BottomSheet {...props} />;
const EmptyStateAdapter = (props: OwnedCargoEmptyStateProps) => <EmptyState {...props} />;

export function OwnedCargoListRouteClient({ initialCargoes }: OwnedCargoListRouteClientProps) {
  const t = useTranslations('shipperMobileFlow.myCargoes');

  return <>
    <div className={styles.mobile}><MobileAppShell title={t('title')}>
      <OwnedCargoListScreen
        initialCargoes={initialCargoes}
        SearchFilter={SearchFilterAdapter}
        BottomSheet={BottomSheetAdapter}
        EmptyState={EmptyStateAdapter}
      />
    </MobileAppShell></div>
    <div className={styles.desktop}><OwnedCargoDesktopFoundation cargoes={initialCargoes} /></div>
  </>;
}
