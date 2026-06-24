import { notFound } from 'next/navigation';
import { NegotiationScreen } from '@/features/shipper-mobile-flow/screens/negotiation-screen';
import { getShipperCargoById } from '@/features/shipper-mobile-flow/application/get-shipper-cargo-by-id';
import { getShipperOffers } from '@/features/shipper-mobile-flow/application/get-shipper-offers';

type PageProps = { params: Promise<{ id: string }> };

export default async function NegotiationPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getShipperCargoById(id);
  if (!cargo) notFound();
  const offers = await getShipperOffers(id);
  return <NegotiationScreen cargo={cargo} offers={offers} />;
}
