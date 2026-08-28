'use client';

import { useTranslations } from 'next-intl';

import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import { PublicCargoDetailScreen } from '@/features/cargo/public/screens/public-cargo-detail-screen';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';

type PublicCargoDetailRouteClientProps = {
  cargo: PublicCargoSafeView;
};

export function PublicCargoDetailRouteClient({ cargo }: PublicCargoDetailRouteClientProps) {
  const t = useTranslations('shipperMobileFlow.publicCargoDetail');

  return (
    <MobileAppShell title={t('title')} backHref="/cargas-publicas">
      <PublicCargoDetailScreen cargo={cargo} ActionButton={PrimaryButton} />
    </MobileAppShell>
  );
}
