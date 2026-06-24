import { notFound } from 'next/navigation';

import { getPublicCargoById } from '@/features/shipper-mobile-flow/application/get-public-cargo-by-id';
import { PublicCargoDetailScreen } from '@/features/shipper-mobile-flow/screens/public-cargo-detail-screen';

type PublicCargoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicCargoDetailPage({ params }: PublicCargoDetailPageProps) {
  const { id } = await params;
  const cargo = await getPublicCargoById(id);

  if (!cargo) {
    notFound();
  }

  return <PublicCargoDetailScreen cargo={cargo} />;
}
