import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';
import { getOwnedCargoOffers } from '@/features/negotiations/application/get-owned-cargo-offers';
import { MobileNegotiationScreen } from '@/features/negotiations/components/mobile-negotiation/mobile-negotiation-screen';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';
export default async function NegotiationPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const user = await requireShipperSession(locale);
  const cargo = await getOwnedCargoById(id, user.id);
  if (!cargo) return null;
  const offers = await getOwnedCargoOffers(id, user.id);
  return <MobileNegotiationScreen cargo={cargo} offers={offers} />;
}
