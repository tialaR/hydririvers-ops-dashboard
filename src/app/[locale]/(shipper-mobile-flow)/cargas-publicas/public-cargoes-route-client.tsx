'use client';

import { useTranslations } from 'next-intl';

import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import {
  PublicCargoesScreen,
  type PublicCargoBottomSheetProps,
} from '@/features/cargo/public/screens/public-cargoes-screen';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { EmptyState } from '@/features/product-shell/components/product-state/product-state';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';

const BottomSheetAdapter = (props: PublicCargoBottomSheetProps) => <BottomSheet {...props} />;

type PublicCargoesRouteClientProps = {
  initialCargoes: PublicCargoSafeView[];
};

export function PublicCargoesRouteClient({ initialCargoes }: PublicCargoesRouteClientProps) {
  const t = useTranslations('shipperMobileFlow.publicList');

  return (
    <MobileAppShell title={t('title')}>
      <PublicCargoesScreen
        initialCargoes={initialCargoes}
        SearchFilter={SearchFilterStack}
        BottomSheet={BottomSheetAdapter}
        EmptyState={EmptyState}
        ActionButton={PrimaryButton}
      />
    </MobileAppShell>
  );
}
