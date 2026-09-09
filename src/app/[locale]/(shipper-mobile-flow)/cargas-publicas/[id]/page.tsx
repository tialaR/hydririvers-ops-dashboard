import { notFound } from 'next/navigation';

import { getPublicCargoById } from '@/features/cargo/public/application/get-public-cargo-by-id';

import { PublicCargoDetailRouteClient } from './public-cargo-detail-route-client';

type PublicCargoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicCargoDetailPage({ params }: PublicCargoDetailPageProps) {
  const { id } = await params;
  const cargo = await getPublicCargoById(id);

  if (!cargo) {
    notFound();
  }

  return <PublicCargoDetailRouteClient cargo={cargo} />;
}
