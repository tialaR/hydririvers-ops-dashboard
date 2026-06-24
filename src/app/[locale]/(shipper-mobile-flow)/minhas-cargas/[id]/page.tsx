import { notFound } from 'next/navigation';
import { CargoDetailScreen } from '@/features/shipper-mobile-flow/screens/cargo-detail-screen';
import { getShipperCargoById } from '@/features/shipper-mobile-flow/application/get-shipper-cargo-by-id';

type PageProps = { params: Promise<{ id: string }> };

export default async function CargoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getShipperCargoById(id);
  if (!cargo) notFound();
  return <CargoDetailScreen cargo={cargo} />;
}
