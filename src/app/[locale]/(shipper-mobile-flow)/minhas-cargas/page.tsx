import { listOwnedCargoes } from '@/features/cargo/owned/application/list-owned-cargoes';

import { OwnedCargoListRouteClient } from './owned-cargo-list-route-client';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';

export default async function MyCargoesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireShipperSession(locale);
  const initialCargoes = await listOwnedCargoes(user.id);
  return <OwnedCargoListRouteClient initialCargoes={initialCargoes} />;
}
