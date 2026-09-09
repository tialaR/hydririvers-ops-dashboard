import { notFound } from 'next/navigation';

import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';

import { OwnedCargoDetailRouteClient } from './owned-cargo-detail-route-client';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';

type PageProps = { params: Promise<{ id: string; locale: string }> };

export default async function CargoDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const user = await requireShipperSession(locale);
  const cargo = await getOwnedCargoById(id, user.id);
  if (!cargo) notFound();
  return <OwnedCargoDetailRouteClient cargo={cargo} />;
}
