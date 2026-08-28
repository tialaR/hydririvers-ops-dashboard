import { notFound } from 'next/navigation';

import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';

import { OwnedCargoDetailRouteClient } from './owned-cargo-detail-route-client';

type PageProps = { params: Promise<{ id: string }> };

export default async function CargoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getOwnedCargoById(id);
  if (!cargo) notFound();
  return <OwnedCargoDetailRouteClient cargo={cargo} />;
}
