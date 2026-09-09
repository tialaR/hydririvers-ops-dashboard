import { notFound } from 'next/navigation';
import { OperationMapScreen } from '@/features/waterway-map/screens/owned-cargo-operation-map-screen';
import { getOwnedCargoMapData } from '@/features/cargo/owned/application/get-owned-cargo-map-data';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';

type PageProps = { params: Promise<{ id: string; locale: string }> };

export default async function CargoMapPage({ params }: PageProps) {
  const { id, locale } = await params;
  const user = await requireShipperSession(locale);
  const cargo = await getOwnedCargoMapData(id, user.id);
  if (!cargo) notFound();
  return <OperationMapScreen cargo={cargo} />;
}
