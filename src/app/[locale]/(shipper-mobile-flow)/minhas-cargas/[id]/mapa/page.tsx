import { notFound } from 'next/navigation';
import { OperationMapScreen } from '@/features/waterway-map/screens/owned-cargo-operation-map-screen';
import { getOwnedCargoMapData } from '@/features/cargo/owned/application/get-owned-cargo-map-data';

type PageProps = { params: Promise<{ id: string }> };

export default async function CargoMapPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getOwnedCargoMapData(id);
  if (!cargo) notFound();
  return <OperationMapScreen cargo={cargo} />;
}
