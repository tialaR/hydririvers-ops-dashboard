import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';
import { getOwnedCargoOffers } from '@/features/negotiations/application/get-owned-cargo-offers';
import { MobileNegotiationScreen } from '@/features/negotiations/components/mobile-negotiation/mobile-negotiation-screen';
export default async function NegotiationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cargo = await getOwnedCargoById(id);
  if (!cargo) return null;
  const offers = await getOwnedCargoOffers(id);
  return <MobileNegotiationScreen cargo={cargo} offers={offers} />;
}
