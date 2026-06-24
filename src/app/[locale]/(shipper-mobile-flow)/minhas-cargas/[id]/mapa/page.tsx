import { notFound } from 'next/navigation';
import { CargoMapScreen } from '@/features/shipper-mobile-flow/screens/cargo-map-screen';
import { getCargoMapData } from '@/features/shipper-mobile-flow/application/get-cargo-map-data';

type PageProps = { params: Promise<{ id: string }> };

export default async function CargoMapPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getCargoMapData(id);
  if (!cargo) notFound();
  return <CargoMapScreen cargo={cargo} />;
}
