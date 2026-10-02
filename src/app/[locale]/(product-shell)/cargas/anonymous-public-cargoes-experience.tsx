'use client';

import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import {
  PublicCargoesScreen,
  type PublicCargoBottomSheetProps,
} from '@/features/cargo/public/screens/public-cargoes-screen';
import { BottomSheet } from '@/features/product-shell/components/bottom-sheet/bottom-sheet';
import { EmptyState } from '@/features/product-shell/components/product-state/product-state';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import { SearchFilterStack } from '@/features/product-shell/components/search-filter-stack/search-filter-stack';

const BottomSheetAdapter = (props: PublicCargoBottomSheetProps) => <BottomSheet {...props} />;

export function AnonymousPublicCargoesExperience({
  initialCargoes,
}: {
  initialCargoes: PublicCargoSafeView[];
}) {
  return (
    <section data-public-cargoes-canonical="anonymous">
      <PublicCargoesScreen
        initialCargoes={initialCargoes}
        SearchFilter={SearchFilterStack}
        BottomSheet={BottomSheetAdapter}
        EmptyState={EmptyState}
        ActionButton={PrimaryButton}
      />
    </section>
  );
}
