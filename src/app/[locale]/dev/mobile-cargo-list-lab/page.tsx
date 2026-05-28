import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { MobileCargoListLab } from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';
import { cargoListService } from '@/features/cargo/services/cargo-list.service';
import { isMobileCargoListLabRouteEnabled } from '@/shared/config/env';

type MobileCargoListLabPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function MobileCargoListLabPage({ params }: MobileCargoListLabPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isMobileCargoListLabRouteEnabled()) {
    notFound();
  }

  const viewModel = await cargoListService.getMobileCargoListViewModel();

  return <MobileCargoListLab locale={locale} {...viewModel} />;
}
