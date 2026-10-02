'use client';

import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import { PublicCargoDetailScreen } from '@/features/cargo/public/screens/public-cargo-detail-screen';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';

export function AnonymousPublicCargoDetailExperience({
  cargo,
}: {
  cargo: PublicCargoSafeView;
}) {
  return (
    <section data-public-cargo-detail-canonical="anonymous">
      <PublicCargoDetailScreen cargo={cargo} ActionButton={PrimaryButton} />
    </section>
  );
}
