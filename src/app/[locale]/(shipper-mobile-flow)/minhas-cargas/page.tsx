import { listOwnedCargoes } from '@/features/cargo/owned/application/list-owned-cargoes';

import { OwnedCargoListRouteClient } from './owned-cargo-list-route-client';

export default async function MyCargoesPage() {
  const initialCargoes = await listOwnedCargoes();
  return <OwnedCargoListRouteClient initialCargoes={initialCargoes} />;
}
