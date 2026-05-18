import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getCargoById } from '@/features/cargo/services/cargo.service';
import { DesktopCargoMapExpandedPage } from '@/features/dashboard/components/operations-board/desktop-cargo-map';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

type CargoMapPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function CargoMapPage({ params }: CargoMapPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const normalizedCargoId = normalizeCargoId(id);
  const cargo = await getCargoById(normalizedCargoId);

  if (!cargo) {
    notFound();
  }

  return <DesktopCargoMapExpandedPage cargo={cargo} />;
}
